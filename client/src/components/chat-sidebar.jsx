"use client";

import { MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import CreateGroupDialog from "./create-group";



export default function ChatSidebar({ 
  chats, 
  selectedChatId, 
  onChatSelect,
  onCreateGroup 
}) {
  return (
    <div className="w-80 border-r bg-card relative">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-4xl">Chats</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-5rem)]">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onChatSelect(chat.id)}
            className={cn(
              "w-full p-4 text-left hover:bg-accent transition-colors",
              selectedChatId === chat.id && "bg-accent"
            )}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xl">{chat.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {format(chat.timestamp, "HH:mm")}
                  </span>
                </div>
                <p className=" text-muted-foreground truncate">
                  {chat.lastMessage}
                </p>
              </div>
              {chat.unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                  {chat.unreadCount}
                </span>
              )}
            </div>
          </button>
        ))}
      </ScrollArea>
      <CreateGroupDialog onCreateGroup={onCreateGroup} />
    </div>
  );
}