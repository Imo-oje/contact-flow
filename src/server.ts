import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { PORT } from "./constants/env";

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
