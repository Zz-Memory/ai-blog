type AiQuestionFloatingButtonProps = {
  onClick: () => void;
  className?: string;
};

export function AiQuestionFloatingButton({ onClick, className = "" }: AiQuestionFloatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex h-14 w-14 items-center justify-center rounded-full border border-cyan-200 bg-white shadow-[0_0_20px_rgba(56,189,248,0.18)] transition hover:shadow-[0_0_30px_rgba(56,189,248,0.32)] ${className}`}
      aria-label="打开 AI 问答"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/25 to-violet-400/25 opacity-25 animate-ping" />
      <span className="material-symbols-outlined relative z-10 text-cyan-700 transition group-hover:scale-110 text-[20px]">
        smart_toy
      </span>
    </button>
  );
}
