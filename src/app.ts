import "reflect-metadata";
import express, { NextFunction, type Request, type Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { contactsRouter } from "./controllers/Contact.js";

export const app = express();

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
  const { message, stack } = err;
  let status;
  switch (err.cause) {
    case "DB_CONFLICT":
      console.error(`***DB ERROR***`, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        request: { url: req.baseUrl, body: req.body },
        message,
        stack,
      });
      status = 409;
      break;
    default:
      console.error(err);
      status = 500;
      break;
  }
  res.status(status).send({ error: message });
});

app.get("/ping", (req: Request, res: Response) => {
  res.status(200).json({ message: "pong " });
});
