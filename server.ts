/**
 * Custom Node server: Next.js + Socket.IO on the same port, plus the
 * booking-reminder cron (24 h / 1 h before class — spec §4.6).
 */
import { createServer } from "http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { parse } from "url";
import cron from "node-cron";
import { registerChatServer } from "./src/lib/socket/server";
import { runBookingReminders } from "./src/lib/jobs/reminders";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 3000);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res, parse(req.url ?? "/", true));
  });

  const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: { origin: process.env.NEXT_PUBLIC_APP_URL, credentials: true },
  });
  registerChatServer(io);

  // Reminder sweep every 5 minutes
  cron.schedule("*/5 * * * *", () => {
    runBookingReminders().catch((err) => console.error("[reminders]", err));
  });

  const host = process.env.HOST ?? "0.0.0.0";
  httpServer.listen(port, host, () => {
    console.log(`\n  ▲ Vaony ready on http://${host}:${port}\n`);
  });
});
