import { createLogger, transports, format } from "winston";
require("winston-daily-rotate-file");

const streamFormatter = (path, type) =>
  new transports.DailyRotateFile({
    filename: `${path}/${type}-%DATE%.log`,
    datePattern: "YYYY-MM-DD-HH",
  });

export const logger = (path, type) => {
  const infoStream = streamFormatter(path, type);
  return createLogger({
    transports: [infoStream],
    format: format.json(),
  });
};
