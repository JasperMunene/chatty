import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';

export const signupUser = async (data) => {
    const response = await axios.post(`${BASE_URL}/auth/signup`, data);
    return response;
};

export const loginUser = async (data) => {
    const response = await axios.post(`${BASE_URL}/auth/login`, data);
    return response;
};

export const logoutUser = async () => {
    const response = await axios.post(`${BASE_URL}/auth/logout`);
    return response;
};

