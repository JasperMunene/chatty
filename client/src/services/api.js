import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:3000/v1",
});

export const fetchChats = () => API.get("/chats")
export const sendMessage = (data) => API.get("/messages", data)