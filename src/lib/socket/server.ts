import type { Server as SocketIOServer, Socket } from "socket.io";
import { db } from "@/lib/db";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getMailer, templates } from "@/lib/mail";
import type { ChatMessagePayload, SessionUser } from "@/types";

/** userId → number of open sockets (presence) */
const online = new Map<string, number>();

function parseCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  const match = header.split(/;\s*/).find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

async function canAccessConversation(user: SessionUser, conversationId: string) {
  const convo = await db.conversation.findUnique({ where: { id: conversationId } });
  if (!convo) return null;
  if (user.role === "ADMIN") return convo;
  if (convo.studentId === user.id || convo.teacherId === user.id) return convo;
  return null;
}

export function registerChatServer(io: SocketIOServer): void {
  // Handshake auth from the httpOnly access-token cookie
  io.use(async (socket, nextFn) => {
    const token = parseCookie(socket.handshake.headers.cookie, "vaony_at");
    const user = token ? await verifyAccessToken(token) : null;
    if (!user) return nextFn(new Error("Unauthorized"));
    (socket.data as { user: SessionUser }).user = user;
    nextFn();
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket.data as { user: SessionUser }).user;
    online.set(user.id, (online.get(user.id) ?? 0) + 1);

    socket.on("conversation:join", async (conversationId: string) => {
      const convo = await canAccessConversation(user, conversationId);
      if (!convo) return;
      await socket.join(`conversation:${conversationId}`);

      // Mark incoming messages as delivered on join
      await db.message.updateMany({
        where: { conversationId, senderId: { not: user.id }, deliveredAt: null },
        data: { deliveredAt: new Date() },
      });
      socket.to(`conversation:${conversationId}`).emit("message:delivered", { conversationId });
    });

    socket.on(
      "message:send",
      async (
        payload: { conversationId: string; body: string },
        ack?: (msg: ChatMessagePayload | { error: string }) => void
      ) => {
        const body = String(payload.body ?? "").trim();
        if (!body || body.length > 5000) return ack?.({ error: "Invalid message" });
        const convo = await canAccessConversation(user, payload.conversationId);
        if (!convo) return ack?.({ error: "Conversation not found" });

        const recipientId = convo.studentId === user.id ? convo.teacherId : convo.studentId;
        const recipientOnline = (online.get(recipientId) ?? 0) > 0;

        const message = await db.message.create({
          data: {
            conversationId: convo.id,
            senderId: user.id,
            body,
            deliveredAt: recipientOnline ? new Date() : null,
          },
        });

        const dto: ChatMessagePayload = {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          body: message.body,
          fileUrl: message.fileUrl,
          fileName: message.fileName,
          fileType: message.fileType,
          sentAt: message.sentAt.toISOString(),
          deliveredAt: message.deliveredAt?.toISOString() ?? null,
          readAt: null,
        };

        io.to(`conversation:${convo.id}`).emit("message:new", dto);
        ack?.(dto);

        if (!recipientOnline) {
          // Offline email + in-app notification (spec §4.7)
          const recipient = await db.user.findUnique({ where: { id: recipientId } });
          if (recipient) {
            await getMailer().send({
              to: recipient.email,
              subject: "New message on Vaony",
              html: templates.newMessage(`${user.firstName} ${user.lastName}`),
            });
          }
          await db.notification.create({
            data: {
              userId: recipientId,
              type: "MESSAGE",
              title: `New message from ${user.firstName}`,
              body: body.slice(0, 120),
            },
          });
        }
      }
    );

    socket.on("message:read", async (payload: { conversationId: string }) => {
      const convo = await canAccessConversation(user, payload.conversationId);
      if (!convo) return;
      await db.message.updateMany({
        where: { conversationId: convo.id, senderId: { not: user.id }, readAt: null },
        data: { readAt: new Date() },
      });
      socket.to(`conversation:${convo.id}`).emit("message:read", { conversationId: convo.id });
    });

    socket.on("typing", (payload: { conversationId: string; typing: boolean }) => {
      socket.to(`conversation:${payload.conversationId}`).emit("typing", {
        userId: user.id,
        typing: payload.typing,
      });
    });

    socket.on("disconnect", () => {
      const count = (online.get(user.id) ?? 1) - 1;
      if (count <= 0) online.delete(user.id);
      else online.set(user.id, count);
    });
  });
}
