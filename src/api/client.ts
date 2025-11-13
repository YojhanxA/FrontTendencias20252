// src/api/client.ts
import axios from "axios";

axios.defaults.baseURL =
  (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "") + "/";

export default axios;
