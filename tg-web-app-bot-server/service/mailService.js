const nodemailer = require('nodemailer');

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.yandex.ru',
            port: 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            }
        });
    }

    async sendActivationMail(to, link) {
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to,
                subject: 'Активация аккаунта на ДомоЧай',
                text: `Для активации аккаунта перейдите по ссылке: ${link}`,
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333;">Добро пожаловать в ДомоЧай!</h1>
                    <p style="font-size: 16px;">Для активации вашего аккаунта перейдите по ссылке ниже:</p>
                    <a href="${link}" 
                       style="display: inline-block; padding: 12px 24px; background-color: #ffcc00; 
                              color: #000; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Активировать аккаунт
                    </a>
                    <p style="font-size: 14px; color: #666; margin-top: 20px;">
                        Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.
                    </p>
                </div>
                `
            });
            console.log('Активационное письмо отправлено на:', to);
        } catch (error) {
            console.error('Ошибка отправки email:', error);
            throw error;
        }
    }
}

module.exports = new MailService();