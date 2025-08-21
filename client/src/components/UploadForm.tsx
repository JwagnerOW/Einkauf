import { useState } from "react";
import { uploadReceipt } from "../api/client";
import type { Receipt } from "../types";

type Props = { onUploaded?: (r: Receipt) => void };

export default function UploadForm({ onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setErr("Bitte Bild auswählen");
    setBusy(true);
    setErr("");
    try {
      const r = await uploadReceipt(file);
      onUploaded?.(r);
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.message ?? "Upload fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button disabled={busy}>{busy ? "Hochladen…" : "Hochladen"}</button>
      {err && <p style={{ color: "#b00" }}>{err}</p>}
    </form>
  );
}
