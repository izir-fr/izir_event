// EMAIL SMTP
module.exports = {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // secure:true for port 465, secure:false for port 587
  auth: {
    user: process.env.EMAIL_AUTH_USER,
    pass: process.env.EMAIL_AUTH_PASS
  }
}
