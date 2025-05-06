import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, text: string) => {
  // 1) Create a transporter object using SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Define the email options (like: from - to - subject - text - html ....etc)
  const mailOptions = {
    from: 'Social Media App <developermohamed119@gmail.com>',
    to,
    subject,
    text,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};
