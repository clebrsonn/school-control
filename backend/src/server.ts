// filepath: /e:/IdeaProjects/school-control/backend/src/server.ts
import app from './app';
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT ?? 5000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});