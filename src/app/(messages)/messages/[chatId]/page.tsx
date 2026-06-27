"use client";

import { useParams } from "next/navigation";
import MessagesShell from "@/features/messages/components/MessagesShell";

export default function ChatPage() {
  const params = useParams<{ chatId?: string }>();
  const chatId =
    typeof params?.chatId === "string" ? params.chatId.trim() : "";

  return <MessagesShell initialConversationId={chatId || undefined} />;
}
