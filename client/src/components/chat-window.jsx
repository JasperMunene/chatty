"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";


export default function ChatWindow({ messages }) {
  return (
    <ScrollArea className="flex-1 p-4 rounded-lg border bg-card">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-2",
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <p className="text-sm">{message.text}</p>
              <time className="text-xs opacity-70">
                {format(message.timestamp, "HH:mm")}
              </time>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}