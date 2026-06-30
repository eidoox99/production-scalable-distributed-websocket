import "@pkg/shared";
import express from "express";
import authRouter from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT ?? 4005;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);

app.listen(PORT, () => {
  console.log(`auth-service listening on ${PORT}`);
});
