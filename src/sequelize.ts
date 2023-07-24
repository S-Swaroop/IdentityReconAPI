import * as config from "./config.js";
import { Sequelize } from "sequelize-typescript";
import { Contact } from "./models/Contact.js";

export const sequelize = new Sequelize({
  dialect: "postgres",
  database: config.env.DB_NAME,
  username: config.env.DB_USER,
  password: config.env.DB_PASS,
  //   host: "0.0.0.0",
  host: config.env.PSQL_HOST || "localhost",
  models: [Contact],
  //   models: [fileMetaData(import.meta).__dirname + "/models"],
  logging: false,
});
