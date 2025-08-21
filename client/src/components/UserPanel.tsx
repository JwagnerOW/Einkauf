import { useEffect, useState } from "react";
import { listUsers, createUser, deleteUser, bulkUsers } from "../api/client";
import type { User } from "../types";

export default function UsersPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [bulk, setBulk] = useState(""); // Zeilenweise Eingabe
  const [err, setErr] = useState("");

  const load = () =>
    listUsers()
      .then(setUsers)
      .catch((e) => setErr(e.message));
  useEffect(() => {
    load();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!name.trim()) return;
    try {
      await createUser(name.trim());
      setName("");
      load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message);
    }
  };

  const addBulk = async () => {
    setErr("");
    const names = bulk
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!names.length) return;
    try {
      await bulkUsers(names);
      setBulk("");
      load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message);
    }
  };

  const remove = async (id: string) => {
    await deleteUser(id);
    load();
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <h2>Personen</h2>
      <form
        onSubmit={add}
        style={{ display: "flex", gap: 8, marginBottom: 12 }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <button type="submit">+ Hinzufügen</button>
      </form>

      <details style={{ marginBottom: 12 }}>
        <summary>Mehrere auf einmal</summary>
        <p>Kopiere hier mehrere Namen (je Zeile einer) hinein:</p>
        <textarea
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          rows={5}
          style={{ width: "100%" }}
        />
        <br />
        <button onClick={addBulk}>Alle anlegen</button>
      </details>

      {err && <p style={{ color: "#b00" }}>{err}</p>}

      {!users.length ? (
        <p>Noch keine Nutzer.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>
                  <button onClick={() => remove(u._id)}>Löschen</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
