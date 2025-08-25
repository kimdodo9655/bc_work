import axios from "axios";
import { getApiBaseUrl } from "@/utils/env";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
