import axios from "axios";
import type { Receipt, User, Assigned } from "../types";

const api = axios.create({ baseURL: "http://localhost:3000" });

export const listReceipts = () =>
  api.get<Receipt[]>("/receipts").then((r) => r.data);
export const getReceipt = (id: string) =>
  api.get<Receipt>(`/receipts/${id}`).then((r) => r.data);
export const uploadReceipt = (file: File) => {
  const f = new FormData();
  f.append("file", file);
  return api.post<Receipt>("/receipts/image", f).then((r) => r.data);
};

// neue Calls
export const listUsers = () => api.get<User[]>("/users").then((r) => r.data);

export const updateItemAssignment = (
  receiptId: string,
  itemId: string,
  assignedTo: Assigned[]
) =>
  api
    .put(`/receipts/${receiptId}/items/${itemId}/assign`, { assignedTo })
    .then((r) => r.data);

// optional: Zahlungen/Settlement serverseitig – falls du später einen Endpoint baust

export const createUser = (name: string) =>
  api.post<User>("/users", { name }).then((r) => r.data);
export const bulkUsers = (names: string[]) =>
  api.post<User[]>("/users/bulk", { names }).then((r) => r.data);
export const deleteUser = (id: string) =>
  api.delete(`/users/${id}`).then((r) => r.data);
