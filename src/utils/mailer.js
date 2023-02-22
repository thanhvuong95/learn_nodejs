import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import handlebars from "handlebars";

import {
  HOST_NAME,
  PORT,
  USERNAME,
  PASSWORD,
  FROM_EMAIL,
} from "../configs/mail.config";

export const sendMail = async ({ to, subject, payload, htmlTemplate }) => {
  const transporter = nodemailer.createTransport({
    host: HOST_NAME,
    port: PORT,
    auth: {
      user: USERNAME,
      pass: PASSWORD,
    },
  });

  const source = fs.readFileSync(path.join(__dirname, htmlTemplate), "utf8");
  const templateCompile = handlebars.compile(source);

  const mailOptions = {
    from: FROM_EMAIL,
    to,
    subject,
    html: templateCompile(payload),
  };

  await transporter.sendMail(mailOptions);
};
