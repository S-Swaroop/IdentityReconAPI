/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router, Request, Response, NextFunction } from "express";
import { Sequelize } from "sequelize-typescript";
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
          let primaryContactId;
          try {
            // create if new data or just update link state of connected contacts and get primary contact id
            // all within a transaction
            await Contact.sequelize?.transaction(async (trx) => {
              const connectedContacts = await Contact.findAll({
                where: Sequelize.or(
                  { email: email },
                  { phoneNumber: phoneNumber }
                ),
                order: [["createdAt", "ASC"]],
              });
              let isNewEmail = true;
              let isNewPhoneNumber = true;
              let primaryContact;
              const secondaryContactIds = [];

              for (let i = 0; i < connectedContacts.length; i++) {
                if (i === 0) {
                  primaryContact = connectedContacts[i];
                } else {
                  secondaryContactIds.push(connectedContacts[i].get("id"));
                }
                if (connectedContacts[i].get("email") === email) {
                  isNewEmail = false;
                }
                if (connectedContacts[i].get("phoneNumber") === phoneNumber) {
                  isNewPhoneNumber = false;
                }
              }

              let newContact;
              // create or update primary contact
              if (primaryContact) {
                await Contact.update(
                  {
                    linkPrecedence: "primary",
                    linkedId: null,
                  },
                  {
                    where: { id: primaryContact.get("id") },
                    transaction: trx,
                  }
                );
                if (isNewEmail || isNewPhoneNumber) {
                  newContact = await Contact.create(
                    {
                      email,
                      phoneNumber,
                      linkedId: primaryContact.get("id"),
                      linkPrecedence: "secondary",
                    },
                    { transaction: trx }
                  );
                }
              } else {
                if (isNewEmail || isNewPhoneNumber) {
                  newContact = await Contact.create({
                    email,
                    phoneNumber,
                    linkedId: null,
                    linkPrecedence: "primary",
                  });
                  primaryContact = newContact;
                }
              }

              // update primary contact and secondary contacts
              if (secondaryContactIds.length > 0) {
                await Contact.update(
                  {
                    linkPrecedence: "secondary",
                    linkedId: primaryContact?.get("id") || null,
                  },
                  { where: { id: secondaryContactIds }, transaction: trx }
                );
              }

              primaryContactId = primaryContact?.get("id");
            });
          } catch (err) {
            console.error(err);
            throw new Error(
              "***Error in updating connected contacts state***",
              { cause: "CONNNECTED_STATE_UPDATE_ERROR" }
            );
          }
          if (primaryContactId) {
            const consolidatedContact = await Contact.getConsolidatedContact(
              primaryContactId
            );
            res.status(201).json({ contact: consolidatedContact });
          } else {
            throw new Error("***Error in getting consolidated contact***", {
              cause: "CONSOLIDATION_ERROR",
            });
          }
        } catch (err) {
          next(err);
        }
      }
    );
