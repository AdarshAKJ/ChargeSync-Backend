/* eslint-disable no-undef */
import config from '../../config'
import dotenv from 'dotenv'
dotenv.config()
import node_mailer from 'nodemailer'

let emailMailer = node_mailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: config.EMAIL_USER, // Admin Gmail ID
        pass: config.EMAIL_PASS, // Admin Gmail Password
    },
})


// let emailMailer = node_mailer.createTransport({
//   service: "SendinBlue",
//   auth: {
//     user: 'central.auth007@gmail.com', // Admin Gmail ID
//     pass: 'BbIvODZdPMSsc6VU', // Admin Gmail Password
//   },
// })

export default emailMailer