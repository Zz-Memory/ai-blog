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
      <button type="button" aria-label={`关闭${title}`} className="absolute inset-0 bg-cyan-950/35 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-cyan-100/80 bg-white/90 p-6 shadow-[0_18px_45px_rgba(56,189,248,0.16)] backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
        <div className={`mt-6 flex gap-3 ${hideCancelButton ? "justify-end" : ""}`}>
          {hideCancelButton ? null : (
            <button type="button" className="flex-1 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-cyan-100" onClick={onClose}>
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
