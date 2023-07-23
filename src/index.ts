import { createServer } from "http";
import { app } from "./app.js";
import { sequelize } from "./sequelize.js";
import * as config from "./config.js";

const port = config.env.PORT || 3000;

void (async () => {
  //   const { PSQL_HOST, DB_USER, DB_PASS } = config.env;
  //   console.log({ PSQL_HOST, DB_USER, DB_PASS });
  //   console.log(config.env);
  //   await sequelize.authenticate();
  console.log(config.env.DB_PASS);
  await sequelize.sync({ force: true });

  createServer(app).listen(port, () =>
    console.info(`Server running on port ${port}`)
  );
})();
