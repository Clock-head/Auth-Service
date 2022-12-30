import { UserDoc } from '../models/user';

export class TwoFAManager {
  static async genRandomNum() {
    function getRandom(): number {
      return Math.round(Math.random() * 10);
    }

    const codeArray: number[] = [];

    while (codeArray.length < 4) {
      codeArray.push(getRandom());
    }

    const numberOutput =
      codeArray[0].toString() +
      codeArray[1].toString() +
      codeArray[2].toString() +
      codeArray[3].toString();

    return parseInt(numberOutput);
  }

  static async setTimeout() {
    const date = new Date();
    return date.setMinutes(date.getMinutes() + 5);
  }

  static async compare2FA(storedInput: number, suppliedInput: number) {
    return storedInput === suppliedInput;
  }

  static async user2FAReset(user: UserDoc) {
    user.twoFACode = null;
    user.twoFATimeout = null;
    await user.save();
  }

  static async send2FAEmail(code: number, transporter: Function) {
    const mailOptions = {
      from: 'Auth <me@samples.mailgun.org>',
      to: 'james.n.kai92@gmail.com',
      subject: 'Auth',
      text: `${code}`,
    };

    await transporter(mailOptions, function (err: boolean, data: Object) {
      if (err) {
        console.log('Error: ', err);
      } else {
        console.log('Message sent!', data);
      }
    });
  }
}
