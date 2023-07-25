import { Sequelize } from "sequelize-typescript";
import { Contact } from "./models/Contact.js";

export const sequelize = new Sequelize({
  dialect: "postgres",
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.PSQL_HOST || "localhost",
  models: [Contact],
  logging: false,
});
