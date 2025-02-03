// filepath: /e:/IdeaProjects/school-control/backend/src/server.ts
import app from './app';

const port = 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});