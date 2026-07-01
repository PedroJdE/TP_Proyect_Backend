import nodemailer from 'nodemailer'
import ENVIRONMENT from './environment.js'

export function normalizeGmailAppPassword(password) {
    if (!password) return ''
    return String(password).replace(/\s+/g, '').trim()
}

const mailer_transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: ENVIRONMENT.GMAIL_USERNAME,
        pass: normalizeGmailAppPassword(ENVIRONMENT.GMAIL_PASSWORD)
    }
})

export default mailer_transport