import type { User, Assigned, ReceiptItem } from "../types";

type Props = {
  item: ReceiptItem;
  users: User[];
  onChange: (assigned: Assigned[]) => void; // set item.assignedTo
};

export default function AssignmentSelector({ item, users, onChange }: Props) {
  const assigned = item.assignedTo ?? [];

  const toggle = (userId: string) => {
    const exists = assigned.find((a) => a.user === userId);
    onChange(
      exists
        ? assigned.filter((a) => a.user !== userId)
        : [...assigned, { user: userId, qty: 0 }]
    );
  };

  const setQty = (userId: string, qty: number) => {
    onChange(assigned.map((a) => (a.user === userId ? { ...a, qty } : a)));
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {users.map((u) => {
        const sel = assigned.find((a) => a.user === u._id);
        const letter = u.name?.[0]?.toUpperCase() ?? "?";
        return (
          <div
            key={u._id}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <button
              type="button"
              onClick={() => toggle(u._id)}
              title={u.name}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "none",
                background: sel ? "#4caf50" : "#ddd",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {letter}
            </button>
            {sel && (
              <input
                type="number"
                min={0}
                value={sel.qty ?? 0}
                onChange={(e) => setQty(u._id, Number(e.target.value))}
                style={{ width: 56 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
