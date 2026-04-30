// 确认弹窗的 props。
// 所有需要二次确认的操作都可以复用这个组件，只需要传入标题、文案和回调即可。
type VisitorCenterConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  confirmButtonClassName: string;
  onClose: () => void;
  onConfirm: () => void;
  hideCancelButton?: boolean;
};

// 通用确认弹窗。
// 通过 `open` 控制显隐，通过 `onClose` 和 `onConfirm` 交给父组件处理最终行为。
export function VisitorCenterConfirmModal({
  open,
  title,
  description,
  cancelLabel,
  confirmLabel,
  confirmButtonClassName,
  onClose,
  onConfirm,
  hideCancelButton = false,
}: VisitorCenterConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* 遮罩层本身也是可点击区域，点击后关闭弹窗，提升交互效率。 */}
      <button type="button" aria-label={`关闭${title}`} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#18191d] p-6 shadow-[0_0_30px_rgba(0,0,0,0.45)]">
        <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
        <div className={`mt-6 flex gap-3 ${hideCancelButton ? "justify-end" : ""}`}>
          {hideCancelButton ? null : (
            <button type="button" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-100 transition hover:bg-white/10" onClick={onClose}>
              {cancelLabel}
            </button>
          )}
          <button type="button" className={`${hideCancelButton ? "rounded-xl" : "flex-1 rounded-xl"} px-4 py-3 text-sm font-medium transition ${confirmButtonClassName}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
