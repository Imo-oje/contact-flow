import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { PORT } from "./constants/env";

app.listen(PORT == null || PORT == "" ? 8000 : PORT, () => {
  console.log(`[[ SERVER ]]: Running on http://localhost:${PORT}`);
});
