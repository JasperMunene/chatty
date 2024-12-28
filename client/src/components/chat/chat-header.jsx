"use client";

import { MessagesSquare } from "lucide-react";
import ProfileMenu from "@/components/profile-menu";


export default function ChatHeader({ user, onUpdateProfile, onLogout }) {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-2">
        <MessagesSquare className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Chatty</h1>
      </div>
      <ProfileMenu 
        user={user}
        onUpdateProfile={onUpdateProfile}
        onLogout={onLogout}
      />
    </header>
  );
}