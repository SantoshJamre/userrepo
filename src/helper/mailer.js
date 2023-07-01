import Config from '../configurations/configurations.js';
import Mailer from 'nodemailer';

export default class {
  async send(email, sendSubject, sendMsg, options = { fromName: Config.Mailer.fromName, fromEmail: Config.Mailer.fromEmail, mailerCredential: Config.Mailer.credential }) {
    const fromName = options.fromName
    const fromEmail = options.fromEmail
    return new Promise((resolve, reject) => {
      const transporter = Mailer.createTransport(options.mailerCredential);
      const mailOptions = {
        from: `"${fromName}" ${fromEmail}`,
        to: email,
        subject: sendSubject,
        html: sendMsg
      };
      
      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(info.messageId);
        }
      });
    });
  }

  async mailSend(recipient, subject, body, options = undefined) {
    try {
      await this.send(recipient, subject, body, options);
      return true;
    } catch (error) {
      return false;
    }
  }

};
