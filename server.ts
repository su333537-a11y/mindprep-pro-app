import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  // Cloud Run defaults to 8080, AI Studio requires 3000
  const PORT = process.env.K_SERVICE ? 8080 : 3000;

  console.log("Starting server. NODE_ENV is:", process.env.NODE_ENV);
  console.log("K_SERVICE is:", process.env.K_SERVICE);

  // Use Vite in dev mode ONLY if not in production AND not in Cloud Run (K_SERVICE is set by Cloud Run)
  if (process.env.NODE_ENV !== "production" && !process.env.K_SERVICE) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT as number, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
