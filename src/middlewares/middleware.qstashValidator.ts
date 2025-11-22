import { Receiver } from "@upstash/qstash";
import type { Request, Response, NextFunction } from "express";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function qstashValidator(req: Request, res: Response, next: NextFunction) {
  try {
    const signature = req.headers["upstash-signature"] as string;

    await receiver.verify({
      signature,
      body: req.rawBody?.toString() ?? "",
    });

    next();
  } catch (err) {
    console.error("Invalid QStash signature:", err);
    return res.status(401).json({ error: "Unauthorized QStash request" });
  }
}
