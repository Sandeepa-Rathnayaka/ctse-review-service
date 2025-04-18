import winston, { format, transports } from "winston";

const customLoggerFormat = format.combine(
  format.timestamp(),
  format.printf(({ timestamp, level, message }) => {
    return `${timestamp} :- ${level.toUpperCase().padEnd(7)}: ${message}`;
  })
);

const logger = winston.createLogger({
  format: customLoggerFormat,
  level: "debug",
  transports: [
    new transports.Console(),
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 10000000,
      maxFiles: 5,
    }),
    new transports.File({
      filename: "logs/info.log",
      level: "info",
      maxsize: 10000000,
      maxFiles: 5,
    }),
    new transports.File({
      filename: "logs/debug.log",
      level: "debug",
      maxsize: 10000000,
      maxFiles: 5,
    }),
  ],
});

export default logger;
