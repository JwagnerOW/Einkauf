import { useEffect, useState } from "react";
import type { Receipt, User, Assigned } from "../types";
import { listUsers } from "../api/client";
import OwnerMatrix from "./OwnerMatrix";
import SettlementPanel from "./SettlementPanel";
// ...

export default function ReceiptDetail({
  receipt,
}: {
  receipt: Receipt | null;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [localReceipt, setLocalReceipt] = useState<Receipt | null>(receipt);

  useEffect(() => {
    setLocalReceipt(receipt || null);
  }, [receipt]);
  useEffect(() => {
    listUsers().then(setUsers).catch(console.error);
  }, []);

  if (!localReceipt) return <p>lade…</p>;

  // Re-Render nach Änderung aus OwnerMatrix
  const onItemChange = (itemId: string, assignedTo: Assigned[]) => {
    setLocalReceipt((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((i) =>
          i._id === itemId ? { ...i, assignedTo } : i
        ),
      };
    });
  };

  const lineTotal = (i: any) => Number(i.price) * (i.qty ?? 1);
  const computedSum = (localReceipt.items || []).reduce(
    (s, i) => s + lineTotal(i),
    0
  );
  const delta = Math.abs(computedSum - Number(localReceipt.total || 0));

  return (
    <div>
      <h2>Beleg</h2>
      <p>
        <b>Total (Bon):</b> {Number(localReceipt.total).toFixed(2)} €
        {delta > 0.02 && (
          <em>
            {" "}
            (Abw.: {(computedSum - Number(localReceipt.total)).toFixed(2)} €)
          </em>
        )}
      </p>

      <OwnerMatrix
        receipt={localReceipt}
        users={users}
        onItemChange={onItemChange}
      />

      {/* optional: Rohtext */}
      {localReceipt.rawText && (
        <details style={{ marginTop: 12 }}>
          <summary>Rohtext</summary>
          <pre style={{ whiteSpace: "pre-wrap" }}>{localReceipt.rawText}</pre>
        </details>
      )}

      <SettlementPanel receipt={localReceipt} users={users} />
    </div>
  );
}
