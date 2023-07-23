import { URL, fileURLToPath } from "url";
import { join, dirname } from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: join(fileMetaData(import.meta).__dirname, ".env") });

export function fileMetaData(meta: { url: string | URL }) {
  const __filename = fileURLToPath(meta.url);
  const __dirname = dirname(__filename);

  return { __dirname, __filename };
}

export const env = process.env;
