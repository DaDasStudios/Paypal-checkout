import { config } from "dotenv"
config()

export const HOST = process.env.HOST || "http://localhost:3000"
export const PAYPAL_URL = process.env.PAYPAL_URL || "https://api-m.sandbox.paypal.com"
export const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT
export const PAYPAL_SECRET = process.env.PAYPAL_SECRET

