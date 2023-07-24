import { createServer } from "http";
import { app } from "./app.js";
import { sequelize } from "./sequelize.js";
import * as config from "./config.js";

const port = config.env.PORT || 3000;

void (async () => {
  await sequelize.sync({ force: true });

  createServer(app).listen(port, () =>
    console.info(`Server running on http://localhost:${port}`)
  );
})();
