import { Router } from "express";
import { db } from "../lib/db.js";

const app = Router();

app.get("/", async (req, res) => {
  const messageCount = await db.message.count();
  const sessionCount = await db.session.count();
  const operatorCount = await db.operator.count();

  return res.status(200).json({
    status: "OK",
    time: new Date().toISOString(),
    messageCount: messageCount,
    sessionCount: sessionCount,
    operatorCount: operatorCount,
  });
});

export default app;
