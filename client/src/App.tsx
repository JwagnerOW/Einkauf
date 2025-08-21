import { useEffect, useState } from "react";
import { listReceipts, getReceipt } from "./api/client.ts";
import UploadForm from "./components/UploadForm.tsx";
import ReceiptsList from "./components/ReceiptList.tsx";
import ReceiptDetail from "./components/ReceiptDetail.tsx";
import Counter from "./components/Counter.tsx";
import type { Receipt } from "./types.tsx";
import UsersPanel from "./components/UserPanel.tsx";

export default function App() {
  const [tab, setTab] = useState<
    "upload" | "list" | "detail" | "users" | "counter"
  >("upload");
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [current, setCurrent] = useState<Receipt | null>(null);

  useEffect(() => {
    if (tab === "list") listReceipts().then(setReceipts).catch(console.error);
  }, [tab]);

  const open = async (id: string) => {
    setTab("detail");
    setCurrent(null);
    try {
      setCurrent(await getReceipt(id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      style={{ maxWidth: 900, margin: "24px auto", fontFamily: "system-ui" }}
    >
      <h1>Receipt OCR</h1>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setTab("upload")}>Upload</button>{" "}
        <button onClick={() => setTab("list")}>Liste</button>{" "}
        <button onClick={() => setTab("users")}>Personen</button>
        <button onClick={() => setTab("counter")}>Counter</button>
      </div>

      {tab === "upload" && <UploadForm onUploaded={(r) => open(r._id)} />}
      {tab === "list" && <ReceiptsList receipts={receipts} onOpen={open} />}
      {tab === "detail" && <ReceiptDetail receipt={current} />}
      {tab === "users" && <UsersPanel />}
      {tab === "counter" && <Counter />}
    </div>
  );
}
