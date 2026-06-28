import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { Router, type IRouter } from "express";
import { getRedis, signAccessToken } from "@pkg/shared";

type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
};

const router: IRouter = Router();

function userKey(email: string): string {
  return `user:${email.toLowerCase()}`;
}

router.post("/register", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const redis = getRedis();
  const key = userKey(email);
  const exists = await redis.get(key);

  if (exists) {
    res.status(409).json({ error: "user already exists" });
    return;
  }

  const user: UserRecord = {
    id: randomUUID(),
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10),
  };

  await redis.set(key, JSON.stringify(user));

  const accessToken = signAccessToken({ userId: user.id, email: user.email });

  res.status(201).json({
    accessToken,
    user: { id: user.id, email: user.email },
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const redis = getRedis();
  const raw = await redis.get(userKey(email));

  if (!raw) {
    res.status(401).json({ error: "invalid credentials" });
    return;
  }

  const user = JSON.parse(raw) as UserRecord;
  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    res.status(401).json({ error: "invalid credentials" });
    return;
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email });

  res.json({
    accessToken,
    user: { id: user.id, email: user.email },
  });
});

export default router;
