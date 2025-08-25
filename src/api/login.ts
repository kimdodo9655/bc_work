import api from "@/api/axios";

export async function fetchLogin() {
  const res = await api.get("/user/login");
  return res.data;
}
