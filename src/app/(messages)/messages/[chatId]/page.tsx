"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import MessagesShell from "@/features/messages/components/MessagesShell";

export default function ChatPage() {
  const params = useParams<{ chatId?: string }>();
  const chatId = useMemo(
    () => (typeof params?.chatId === "string" ? params.chatId.trim() : ""),
    [params?.chatId],
  );

  return <MessagesShell initialConversationId={chatId || undefined} />;
}
