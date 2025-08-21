import { useMemo } from "react";
import type { Receipt, User, Assigned } from "../types";
import { updateItemAssignment } from "../api/client";

type Props = {
  receipt: Receipt;
  users: User[];
  onItemChange?: (itemId: string, assignedTo: Assigned[]) => void;
};

export default function OwnerMatrix({ receipt, users, onItemChange }: Props) {
  const usersById = useMemo(
    () => new Map(users.map((u) => [u._id, u])),
    [users]
  );

  const setQty = async (itemId: string, userId: string, qty: number) => {
    const item = receipt.items.find((i) => i._id === itemId);
    if (!item) return;
    // neue assignedTo bauen
    const list: Assigned[] = [];
    const seen = new Set<string>();

    // vorhandene übernehmen/ändern
    for (const a of item.assignedTo || []) {
      if (a.user === userId) {
        if (qty > 0) list.push({ user: userId, qty });
        seen.add(userId);
      } else {
        if (a.qty > 0) list.push(a);
        seen.add(a.user);
      }
    }
    // neu hinzufügen, falls vorher nicht vorhanden
    if (!seen.has(userId) && qty > 0) list.push({ user: userId, qty });

    // Limit: Summe darf item.qty nicht übersteigen
    const sum = list.reduce((s, a) => s + a.qty, 0);
    if (sum > item.qty) {
      // einfache Kappung
      const overflow = sum - item.qty;
      const me = list.find((a) => a.user === userId)!;
      me.qty = Math.max(0, me.qty - overflow);
    }

    await updateItemAssignment(receipt._id, itemId, list);
    onItemChange?.(itemId, list);
  };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
      <thead>
        <tr>
          <th>Artikel</th>
          <th>Menge</th>
          {users.map((u) => (
            <th key={u._id}>{u.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {receipt.items.map((item) => {
          const assignedSum = (item.assignedTo || []).reduce(
            (s, a) => s + a.qty,
            0
          );
          const autoSplit = assignedSum === 0; // leere Liste = alle gemeinsam
          return (
            <tr key={item._id}>
              <td>
                {item.name} <small>({Number(item.price).toFixed(2)} €)</small>
              </td>
              <td>{item.qty}</td>
              {users.map((u) => {
                const current =
                  item.assignedTo?.find((a) => a.user === u._id)?.qty ?? 0;
                return (
                  <td key={u._id}>
                    {autoSplit ? (
                      <span style={{ opacity: 0.7 }}>auto</span>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        max={item.qty}
                        value={current}
                        onChange={(e) =>
                          setQty(
                            item._id,
                            u._id,
                            parseInt(e.target.value || "0", 10)
                          )
                        }
                        style={{ width: 60 }}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
