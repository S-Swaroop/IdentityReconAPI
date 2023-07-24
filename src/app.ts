import "reflect-metadata";
import express, { NextFunction, type Request, type Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import { contactsRouter } from "./controllers/Contact.js";

export const app = express();

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
app.use(morgan("dev"));

app.use(
  cors({
    origin: ["*"],
  })
);

app.use(bodyParser.json());

// Contacts Router
app.use("/", contactsRouter());

/**
 * Error logger and responder
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const { message } = err;
  console.log(message);
  let status;
  switch (err.cause) {
    case "CONNNECTED_STATE_UPDATE_ERROR":
      status = 409;
      break;
    case "CONSOLIDATION_ERROR":
      status = 504;
      break;
    default:
      status = 500;
      break;
  }
  res.status(status).send({ error: message });
});

app.get("/ping", (req: Request, res: Response) => {
  res.status(200).json({ message: "pong " });
});
