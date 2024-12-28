"use client";

import { useEffect, useState } from "react";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import ChatHeader from "@/components/chat/chat-header";
import ChatSidebar from "@/components/chat-sidebar";
import socket from "@/services/socket";
import { fetchChats, sendMessage } from "@/services/api";

export default function Home() {
  const [user, setUser] = useState({
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face"
  });

  const [selectedChatId, setSelectedChatId] = useState(1);
  const [chats, setChats] = useState([
    {
      id: 1,
      name: "Jane Smith",
      lastMessage: "Hey, how are you?",
      timestamp: new Date(),
      unreadCount: 2,
    },
    {
      id: 2,
      name: "Team Project",
      lastMessage: "The meeting is at 3 PM",
      timestamp: new Date(),
      unreadCount: 0,
    },
  ]);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch chat messages
    fetchChats().then((response) => {
      setMessages(response.data)
    })

    // Listen for new messages
    socket.on("newMessage", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, [])

  const handleSendMessage = (text) => {
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        text,
        sender: "user",
        timestamp: new Date()
      }
    ]);
  };

  const handleCreateGroup = (name) => {
    const newGroup = {
      id: chats.length + 1,
      name,
      lastMessage: "Group created",
      timestamp: new Date(),
      unreadCount: 0,
    };
    setChats([...chats, newGroup]);
  };

  const handleUpdateProfile = (data) => {
    setUser({ ...user, ...data });
  };

  const handleLogout = () => {
    console.log("Logging out...");
  };

  return (
    <main className="flex h-fit overflow-y-scroll overflow-hidden no-scrollbar  bg-gradient-to-b from-background to-muted">
      <ChatSidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onChatSelect={setSelectedChatId}
        onCreateGroup={handleCreateGroup}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          user={user}
          onUpdateProfile={handleUpdateProfile}
          onLogout={handleLogout}
        />
        <MessageList messages={messages} />
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </main>
  );
}