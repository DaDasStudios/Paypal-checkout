import express from "express"
import axios from "axios"
import { HOST, PAYPAL_CLIENT, PAYPAL_SECRET, PAYPAL_URL } from './config.js'

const app = express()

app.use(express.json())

const auth = async function () {
    const body = new URLSearchParams({ "grant_type": "client_credentials" })
    const { data } = await axios.post(`${PAYPAL_URL}/v1/oauth2/token`, body, {
        auth: {
            username: PAYPAL_CLIENT,
            password: PAYPAL_SECRET
        }
    })
    return data
}

app.get('/cancel', (req, res) => {
    res.send("Orden cancelada")
})

app.post('/create-order', async (req, res) => {
    // ? Get an token with the credentials
    try {
        const { access_token } = await auth()
        const { data } = await axios.post(`${PAYPAL_URL}/v2/checkout/orders`, {
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        "currency_code": "GBP",
                        "value": "10.5"
                    },
                    description: "This is a product to buy"
                }
            ],
            application_context: {
                cancel_url: `${HOST}/cancel`,
                return_url: `${HOST}/capture`,
            }
        }, {
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Content-Type": "application/json"
            },
        })

        if (data.status !== "CREATED") {
            return res.send("Algo salió mal")
        }

        return res.json({ capture: data.links[1] })
    } catch (error) {
        console.log(error)
        return res.send("Algo salió mal")
    }
})

app.get("/capture", async (req, res) => {
    try {
        const { token, PayerID } = req.query
        const { access_token } = await auth()
        const { data } = await axios.post(`${PAYPAL_URL}/v2/checkout/orders/${token}/capture`, {}, {
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Content-Type": "application/json"
            },
        })

        if (data.status !== "COMPLETED") {
            return res.send("Ups, algo salió mal")
        }

        return res.send("Compra hecha satisfactoriamente")

    } catch (error) {
        return res.send("Ups, algo salió mal")
    }
})

app.use(express.static("public"))

app.listen(3000, () => {
    console.log(`Serving on port 3000`)
})