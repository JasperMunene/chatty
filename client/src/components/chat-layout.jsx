"use client";

import { MessagesSquare } from "lucide-react";
import ChatSidebar from "@/components/chat-sidebar";
import ProfileMenu from "@/components/profile-menu";


export default function ChatLayout({ 
  children, 
  chats, 
  selectedChatId, 
  onChatSelect,
  onCreateGroup,
  user,
  onUpdateProfile,
  onLogout
}) {
  return (
    <main className="flex min-h-screen bg-gradient-to-b from-background to-muted">
      <ChatSidebar 
        chats={chats} 
        selectedChatId={selectedChatId} 
        onChatSelect={onChatSelect}
        onCreateGroup={onCreateGroup}
      />
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-2">
            <MessagesSquare className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">Chat App</h1>
          </div>
          <ProfileMenu 
            user={user}
            onUpdateProfile={onUpdateProfile}
            onLogout={onLogout}
          />
        </header>
        {children}
      </div>
    </main>
  );
}