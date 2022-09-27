const nodeMailer = require('nodemailer')

exports.sendEmail = async (option)=>{
const transPorter = nodeMailer.createTransport({


    host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "7a4da80024e843",
    pass: "3f225cc49468c3"
  }


    // host:process.envSMPT_HOST,
    // port:process.env.SMPT_PORT,
    // auth:{
    //     user:process.env.SMPT_MAIL,
    //     pass:process.env.SMPT_PASSWORD
    // },
    // service: process.env.SMPT_SERVICE
});

const mailOpetions = {
    from:process.env.SMPT_MAIL,
    to:option.email,
    subject:option.subject,
    text:option.message
}
await transPorter.sendMail(mailOpetions)
}