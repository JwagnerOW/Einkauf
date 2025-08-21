export type User = { _id: string; name: string };

export type Assigned = { user: string; qty: number };

export type ReceiptItem = {
  _id: string;
  name: string;
  price: number; // Einzel- oder Zeilenpreis (wie bisher)
  qty: number;
  assignedTo: Assigned[]; // <- neu nutzen
};

export type Receipt = {
  _id: string;
  total: number;
  items: ReceiptItem[];
  rawText?: string;
  createdAt: string;
  updatedAt: string;
};
