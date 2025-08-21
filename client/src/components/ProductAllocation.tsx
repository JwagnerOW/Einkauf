import { useState } from "react";

type Person = { id: number; name: string };
type SelectedPerson = { personId: number; amount?: number };

interface PersonSelectorProps {
  productId: number;
  people: Person[];
  selectedPeople: SelectedPerson[];
  onToggle: (personId: number) => void;
  onAmountChange: (personId: number, amount: number) => void;
}

export function PersonSelector({
  productId,
  people,
  selectedPeople,
  onToggle,
  onAmountChange,
}: PersonSelectorProps) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {people.map((p) => {
        const selectedObj = selectedPeople.find((sp) => sp.personId === p.id);
        const selected = !!selectedObj;
        const firstLetter = p.name[0].toUpperCase();

        return (
          <div
            key={p.id}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <div
              onClick={() => onToggle(p.id)}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: selected ? "#4caf50" : "#ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontWeight: "bold",
                color: "#fff",
                userSelect: "none",
              }}
              title={p.name}
            >
              {firstLetter}
            </div>
            {selected && (
              <input
                type="number"
                min={0}
                value={selectedObj?.amount ?? ""}
                onChange={(e) => onAmountChange(p.id, Number(e.target.value))}
                style={{ width: 40 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
