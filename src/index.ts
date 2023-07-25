import { createServer } from "http";
import { app } from "./app.js";
import { sequelize } from "./sequelize.js";

const port = process.env.PORT || 3000;

void (async () => {
  console.log(process.env.DB_PASS);
  await sequelize.sync({ force: true });

  createServer(app).listen(port, () =>
    console.info(`Server running on http://localhost:${port}`)
  );
})();
