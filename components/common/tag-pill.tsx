export function TagPill({ label, active = false, count }: { label: string; active?: boolean; count?: number }) {
  return (
    <span className={`rounded-md border px-3 py-1 text-[12px] transition ${active ? "border-blue-400/50 bg-blue-500/10 text-blue-100" : "border-white/8 bg-white/5 text-zinc-300 hover:border-blue-400/50 hover:bg-blue-500/10 hover:text-blue-100"}`}>
      # {label}{typeof count === "number" ? ` (${count})` : ""}
    </span>
  );
}
