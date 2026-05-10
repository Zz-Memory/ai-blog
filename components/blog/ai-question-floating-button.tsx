type AiQuestionFloatingButtonProps = {
  onClick: () => void;
  className?: string;
};

export function AiQuestionFloatingButton({ onClick, className = "" }: AiQuestionFloatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex h-14 w-14 items-center justify-center rounded-full border border-sky-300 bg-white shadow-[0_0_20px_rgba(15,23,42,0.08)] transition hover:shadow-[0_0_30px_rgba(56,189,248,0.22)] ${className}`}
      aria-label="打开 AI 问答"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-400/25 to-violet-400/25 opacity-20 animate-ping" />
      <span className="material-symbols-outlined relative z-10 text-sky-700 transition group-hover:scale-110 text-[20px]">
        smart_toy
      </span>
    </button>
  );
}
