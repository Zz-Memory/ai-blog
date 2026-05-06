type AiQuestionFloatingButtonProps = {
  onClick: () => void;
  className?: string;
};

export function AiQuestionFloatingButton({ onClick, className = "" }: AiQuestionFloatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex h-14 w-14 items-center justify-center rounded-full border border-primary-container/50 bg-surface-container-high shadow-[0_0_20px_rgba(75,142,255,0.15)] transition hover:shadow-[0_0_30px_rgba(75,142,255,0.3)] ${className}`}
      aria-label="打开 AI 问答"
    >
      <div className="absolute inset-0 rounded-full bg-primary-container/20 opacity-20 animate-ping" />
      <span className="material-symbols-outlined relative z-10 text-primary-container transition group-hover:scale-110 text-[20px]">
        smart_toy
      </span>
    </button>
  );
}
