

import axios from "axios"

const API_URL = "http://localhost:8000";

export const apiFetch = axios.create({
    baseURL : API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

