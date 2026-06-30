import "@pkg/shared";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { requireAuth } from "./middleware/auth.js";

const app = express();
const PORT = process.env.PORT ?? 4010;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL ?? "http://localhost:4005";

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(
  "/auth",
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
  })
);

app.use("/api", requireAuth);

app.listen(PORT, () => {
  console.log(`api-gateway listening on ${PORT}`);
});
