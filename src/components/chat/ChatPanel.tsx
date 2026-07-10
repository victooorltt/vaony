"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  FaceSmileIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import { useSocket } from "@/hooks/useSocket";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import type { ChatMessagePayload } from "@/types";

interface Party {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

interface ConversationSummary {
  id: string;
  student: Party;
  teacher: Party;
  lastMessage: { body: string; sentAt: string } | null;
  unread: number;
}

const EMOJIS = ["😀", "😅", "👍", "🙏", "🎉", "🤔", "❤️", "✅", "📐", "🧮", "💡", "🔥"];

export function ChatPanel({ meId }: { meId: string }) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/chat/conversations");
    if (res.ok) {
      const json = (await res.json()) as { conversations: ConversationSummary[] };
      setConversations(json.conversations);
      setActiveId((prev) => prev ?? json.conversations[0]?.id ?? null);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  if (loaded && conversations.length === 0) {
    return (
      <EmptyState
        title="No conversations yet"
        body="Chat opens automatically with your teacher once a session is booked and paid."
      />
    );
  }

  return (
    <div className="grid h-[calc(100vh-12rem)] min-h-[480px] overflow-hidden rounded-2xl border border-vaony-ink/8 bg-white md:grid-cols-[280px_1fr]">
      {/* Conversation list */}
      <aside className={cn("border-r border-vaony-ink/8 overflow-y-auto", activeId && "hidden md:block")}>
        {conversations.map((c) => {
          const other = c.student.id === meId ? c.teacher : c.student;
          return (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "flex w-full items-center gap-3 border-b border-vaony-ink/5 p-4 text-left transition hover:bg-vaony-blue/4",
                activeId === c.id && "bg-vaony-blue/6"
              )}
            >
              <Avatar firstName={other.firstName} lastName={other.lastName} src={other.avatarUrl} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-vaony-ink">
                  {other.firstName} {other.lastName}
                </span>
                <span className="block truncate text-xs text-vaony-ink/50">
                  {c.lastMessage?.body ?? "Say hi 👋"}
                </span>
              </span>
              {c.unread > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-vaony-blue px-1.5 font-mono text-[10px] font-bold text-white">
                  {c.unread}
                </span>
              )}
            </button>
          );
        })}
      </aside>

      {/* Active thread */}
      {active ? (
        <ChatThread
          key={active.id}
          conversation={active}
          meId={meId}
          onBack={() => setActiveId(null)}
          onActivity={refresh}
        />
      ) : (
        <div className="hidden items-center justify-center text-sm text-vaony-ink/40 md:flex">
          Select a conversation
        </div>
      )}
    </div>
  );
}

function ChatThread({
  conversation,
  meId,
  onBack,
  onActivity,
}: {
  conversation: ConversationSummary;
  meId: string;
  onBack: () => void;
  onActivity: () => void;
}) {
  const socket = useSocket();
  const [messages, setMessages] = useState<ChatMessagePayload[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const other = conversation.student.id === meId ? conversation.teacher : conversation.student;

  // Load history + join room
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/chat/messages?conversationId=${conversation.id}`);
      if (res.ok && !cancelled) {
        const json = (await res.json()) as { messages: ChatMessagePayload[]; nextCursor: string | null };
        setMessages(json.messages);
        setNextCursor(json.nextCursor);
      }
    })();

    socket.emit("conversation:join", conversation.id);
    socket.emit("message:read", { conversationId: conversation.id });

    const onNew = (msg: ChatMessagePayload) => {
      if (msg.conversationId !== conversation.id) return;
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      if (msg.senderId !== meId) {
        socket.emit("message:read", { conversationId: conversation.id });
      }
      onActivity();
    };
    const onRead = (p: { conversationId: string }) => {
      if (p.conversationId !== conversation.id) return;
      setMessages((prev) =>
        prev.map((m) => (m.senderId === meId ? { ...m, readAt: m.readAt ?? new Date().toISOString() } : m))
      );
    };
    const onTyping = (p: { userId: string; typing: boolean }) => {
      if (p.userId !== meId) setOtherTyping(p.typing);
    };

    socket.on("message:new", onNew);
    socket.on("message:read", onRead);
    socket.on("typing", onTyping);
    return () => {
      cancelled = true;
      socket.off("message:new", onNew);
      socket.off("message:read", onRead);
      socket.off("typing", onTyping);
    };
  }, [conversation.id, meId, socket, onActivity]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, otherTyping]);

  async function loadOlder() {
    if (!nextCursor) return;
    const res = await fetch(
      `/api/chat/messages?conversationId=${conversation.id}&cursor=${nextCursor}`
    );
    if (res.ok) {
      const json = (await res.json()) as { messages: ChatMessagePayload[]; nextCursor: string | null };
      setMessages((prev) => [...json.messages, ...prev]);
      setNextCursor(json.nextCursor);
    }
  }

  function send() {
    const body = input.trim();
    if (!body) return;
    setInput("");
    setShowEmoji(false);
    socket.emit("message:send", { conversationId: conversation.id, body });
  }

  function onInputChange(value: string) {
    setInput(value);
    socket.emit("typing", { conversationId: conversation.id, typing: true });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing", { conversationId: conversation.id, typing: false });
    }, 1200);
  }

  async function uploadFile(file: File) {
    setUploadError("");
    const formData = new FormData();
    formData.set("conversationId", conversation.id);
    formData.set("file", file);
    const res = await fetch("/api/chat/upload", { method: "POST", body: formData });
    const json = (await res.json().catch(() => ({}))) as {
      message?: ChatMessagePayload & { sentAt: string };
      error?: string;
    };
    if (res.ok && json.message) {
      // Broadcast through the socket path so the other side sees it live
      setMessages((prev) => [...prev, json.message!]);
      socket.emit("message:send", {
        conversationId: conversation.id,
        body: `shared a file: ${json.message.fileName ?? "attachment"} → ${json.message.fileUrl ?? ""}`,
      });
    } else {
      setUploadError(json.error ?? "Upload failed");
    }
  }

  return (
    <section className="flex min-h-0 flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-vaony-ink/8 p-4">
        <button onClick={onBack} className="text-sm text-vaony-blue md:hidden" aria-label="Back to conversations">
          ←
        </button>
        <Avatar firstName={other.firstName} lastName={other.lastName} src={other.avatarUrl} size="sm" />
        <div>
          <p className="text-sm font-medium text-vaony-ink">
            {other.firstName} {other.lastName}
          </p>
          <p className="font-mono text-[10px] text-vaony-ink/45">
            {otherTyping ? "typing…" : "chat history is saved"}
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="grid-pattern min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
        {nextCursor && (
          <button
            onClick={loadOlder}
            className="mx-auto block rounded-full border border-vaony-ink/10 bg-white px-3 py-1 text-xs text-vaony-ink/60 hover:border-vaony-blue/40"
          >
            Load older messages
          </button>
        )}
        {messages.map((m) => {
          const mine = m.senderId === meId;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                  mine
                    ? "brand-gradient rounded-br-md text-white"
                    : "rounded-bl-md border border-vaony-ink/8 bg-white text-vaony-ink"
                )}
              >
                {m.fileUrl ? (
                  <a
                    href={m.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("underline", mine ? "text-white" : "text-vaony-blue")}
                  >
                    📎 {m.fileName ?? "attachment"}
                  </a>
                ) : (
                  <span className="whitespace-pre-wrap break-words">{m.body}</span>
                )}
                <span
                  className={cn(
                    "mt-1 flex items-center justify-end gap-1 font-mono text-[10px]",
                    mine ? "text-white/60" : "text-vaony-ink/40"
                  )}
                >
                  {new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {mine && (
                    <span className="flex" aria-label={m.readAt ? "Read" : m.deliveredAt ? "Delivered" : "Sent"}>
                      <CheckIcon className="h-3 w-3" />
                      {(m.deliveredAt || m.readAt) && (
                        <CheckIcon className={cn("-ml-1.5 h-3 w-3", m.readAt && "text-vaony-amber")} />
                      )}
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <footer className="border-t border-vaony-ink/8 p-3">
        {uploadError && <p className="mb-2 text-xs text-red-600" role="alert">{uploadError}</p>}
        {showEmoji && (
          <div className="mb-2 flex flex-wrap gap-1 rounded-xl border border-vaony-ink/8 bg-white p-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setInput((v) => v + e)}
                className="rounded-lg p-1.5 text-lg hover:bg-vaony-blue/8"
                aria-label={`Insert ${e}`}
              >
                {e}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowEmoji((v) => !v)}
            className="rounded-xl p-2.5 text-vaony-ink/50 hover:bg-vaony-blue/8 hover:text-vaony-blue"
            aria-label="Emoji picker"
          >
            <FaceSmileIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-xl p-2.5 text-vaony-ink/50 hover:bg-vaony-blue/8 hover:text-vaony-blue"
            aria-label="Attach file"
          >
            <PaperClipIcon className="h-5 w-5" />
          </button>
          <input
            ref={fileRef}
            type="file"
            hidden
            accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadFile(f);
              e.target.value = "";
            }}
          />
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={`Message ${other.firstName}…`}
            className="max-h-32 flex-1 resize-none rounded-xl border border-vaony-ink/12 px-4 py-2.5 text-sm outline-none focus:border-vaony-blue focus:ring-2 focus:ring-vaony-blue/20"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="brand-gradient rounded-xl p-2.5 text-white shadow-md shadow-vaony-blue/25 transition disabled:opacity-40"
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </footer>
    </section>
  );
}
