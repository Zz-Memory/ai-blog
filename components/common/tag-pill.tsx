export function TagPill({ label, active = false, count }: { label: string; active?: boolean; count?: number }) {
  return (
    <span className={`rounded-md border px-3 py-1 text-[12px] transition ${active ? "border-cyan-300/70 bg-gradient-to-r from-cyan-400/15 to-violet-400/15 text-cyan-800" : "border-cyan-200/50 bg-white/75 text-slate-600 hover:border-cyan-300/70 hover:bg-cyan-50 hover:text-cyan-900"}`}>
      # {label}{typeof count === "number" ? ` (${count})` : ""}
    </span>
  );
}
