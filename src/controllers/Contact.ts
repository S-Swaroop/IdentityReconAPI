/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router, Request, Response, NextFunction } from "express";
import { Contact } from "../models/Contact.js";

export const contactsRouter = () =>
  Router()
    .get("/identify", async (req: Request, res: Response) => {
      const contacts = await Contact.findAll({});
      res.json({ contacts });
    })
    .post(
      "/identify",
      async (req: Request, res: Response, next: NextFunction) => {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        const { email, phoneNumber } = req.body;
        try {
          let newContact;
          try {
            newContact = await Contact.create({ email, phoneNumber });
          } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (err.cause !== "DB_CONFLICT_SOFT") {
              throw new Error("***Conflicting Request***", {
                cause: "DB_CONFILICT",
              });
            }
          }
          const primaryContactId =
            newContact?.get("linkedId") || newContact?.get("id");
          if (primaryContactId) {
            const consolidatedContact = await Contact.getConsolidatedContact(
              primaryContactId
            );
            res.status(201).json({ contact: consolidatedContact });
          } else {
            throw new Error("***No primary contact found***");
          }
        } catch (err) {
          next(err);
        }
      }
    );
