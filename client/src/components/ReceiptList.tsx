import type { Receipt } from "../types";

type Props = {
  receipts: Receipt[];
  onOpen: (id: string) => void;
};

export default function ReceiptsList({ receipts, onOpen }: Props) {
  if (!receipts?.length) return <p>Keine Belege.</p>;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Datum</th>
          <th>Items</th>
          <th>Total</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {receipts.map((r) => (
          <tr key={r._id}>
            <td>{new Date(r.createdAt).toLocaleString()}</td>
            <td>{r.items?.length ?? 0}</td>
            <td>{Number(r.total).toFixed(2)} €</td>
            <td>
              <button onClick={() => onOpen(r._id)}>Öffnen</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
