"use client";

import { useEffect, useMemo, useState } from "react";

type AuthMode = "login" | "register" | "reset";

type PasswordState = {
  value: string;
  touched: boolean;
};

type ValidationState = {
  account?: string;
  password?: string;
  nickname?: string;
  email?: string;
  verification?: string;
  confirmPassword?: string;
};

function FieldIcon({ icon }: { icon: string }) {
  return <span className="material-symbols-outlined text-[20px] leading-none">{icon}</span>;
}

function InputShell({
  icon,
  placeholder,
  type = "text",
  canToggleVisibility = false,
  value,
  onChange,
}: {
  icon: string;
  placeholder: string;
  type?: string;
  canToggleVisibility?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && visible ? "text" : type;

  return (
    <div className="group relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary">
        <FieldIcon icon={icon} />
      </span>
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full rounded-lg border border-white/10 bg-[#0f1012] py-3 pl-11 pr-12 text-[15px] text-on-surface placeholder:text-outline/70 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
      />
      {canToggleVisibility && isPassword ? (
        <button
          type="button"
          aria-label={visible ? "隐藏密码" : "显示密码"}
          onClick={() => setVisible((current) => !current)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-on-surface"
        >
          <FieldIcon icon={visible ? "visibility" : "visibility_off"} />
        </button>
      ) : null}
    </div>
  );
}

function passwordRuleMessage(value: string, touched: boolean) {
  if (!touched && !value) {
    return "密码需由字母与数字组合，长度至少 8 位。";
  }

  const isValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value);
  return isValid ? "密码格式符合要求。" : "密码需由字母与数字组合，长度至少 8 位。";
}


function isStrongPassword(value: string) {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value);
}

export function AuthModal({
  isOpen,
  initialMode,
  onClose,
}: {
  isOpen: boolean;
  initialMode: Exclude<AuthMode, "reset">;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [registerPassword, setRegisterPassword] = useState<PasswordState>({ value: "", touched: false });
  const [resetPassword, setResetPassword] = useState<PasswordState>({ value: "", touched: false });
  const [errors, setErrors] = useState<ValidationState>({});

  useEffect(() => {
    if (isOpen) setMode(initialMode);
  }, [isOpen, initialMode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setRegisterPassword({ value: "", touched: false });
      setResetPassword({ value: "", touched: false });
      setErrors({});
    }
  }, [isOpen]);

  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isReset = mode === "reset";

  const registerMessage = useMemo(() => passwordRuleMessage(registerPassword.value, registerPassword.touched), [registerPassword]);
  const resetMessage = useMemo(() => passwordRuleMessage(resetPassword.value, resetPassword.touched), [resetPassword]);

  if (!isOpen) return null;

  const validateLogin = (formData: FormData) => {
    const nextErrors: ValidationState = {};
    const account = String(formData.get("login-account") ?? "").trim();
    const password = String(formData.get("login-password") ?? "").trim();

    if (!account) nextErrors.account = "请输入账号或邮箱。";
    if (!password) {
      nextErrors.password = "请输入密码。";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateRegister = (formData: FormData) => {
    const nextErrors: ValidationState = {};
    const nickname = String(formData.get("reg-nickname") ?? "").trim();
    const email = String(formData.get("reg-email") ?? "").trim();
    const verification = String(formData.get("reg-verification") ?? "").trim();
    const password = String(formData.get("reg-password") ?? "").trim();
    const confirmPassword = String(formData.get("reg-confirm-password") ?? "").trim();

    if (!nickname) nextErrors.nickname = "请输入昵称。";
    if (!email) nextErrors.email = "请输入电子邮箱。";
    if (!verification) nextErrors.verification = "请输入验证码。";
    if (!password) {
      nextErrors.password = "请输入密码。";
    } else if (!isStrongPassword(password)) {
      nextErrors.password = "密码格式错误，请输入字母与数字组合，且至少 8 位。";
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "请再次输入密码。";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "两次输入的密码不一致。";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateReset = (formData: FormData) => {
    const nextErrors: ValidationState = {};
    const email = String(formData.get("reset-email") ?? "").trim();
    const verification = String(formData.get("reset-code") ?? "").trim();
    const password = String(formData.get("reset-password") ?? "").trim();
    const confirmPassword = String(formData.get("reset-confirm-password") ?? "").trim();

    if (!email) nextErrors.email = "请输入电子邮箱。";
    if (!verification) nextErrors.verification = "请输入验证码。";
    if (!password) {
      nextErrors.password = "请输入新密码。";
    } else if (!isStrongPassword(password)) {
      nextErrors.password = "密码格式错误，请输入字母与数字组合，且至少 8 位。";
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "请再次输入新密码。";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "两次输入的密码不一致。";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="关闭登录注册弹窗"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-2xl border border-white/10 bg-[#18191d] p-6 shadow-[0_0_30px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent" />

        <button
          type="button"
          aria-label="关闭"
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100"
          onClick={onClose}
        >
          <FieldIcon icon="close" />
        </button>

        <div className="text-center">
          <h1 className="text-[40px] font-semibold tracking-tight text-zinc-100">
            Memory的小破站
          </h1>
        </div>

        <div className="mt-8 flex rounded-lg bg-white/5 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrors({});
            }}
            className={`flex-1 rounded-md py-2.5 text-[15px] transition ${
              isLogin
                ? "border border-white/5 bg-[#2a2a2d] text-zinc-100 shadow-sm"
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrors({});
            }}
            className={`flex-1 rounded-md py-2.5 text-[15px] transition ${
              isRegister
                ? "border border-white/5 bg-[#2a2a2d] text-zinc-100 shadow-sm"
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            注册
          </button>
        </div>

        <div className="mt-6 max-h-[60vh] overflow-y-auto pr-1">
          {isLogin && (
            <form
              className="space-y-5"
              action="#"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                if (!validateLogin(formData)) return;
              }}
            >
              <div>
                <label className="mb-2 block text-[13px] font-medium text-zinc-300" htmlFor="login-account">
                  账号/邮箱
                </label>
                <InputShell icon="person" placeholder="输入您的账号或邮箱" />
                {errors.account ? <p className="mt-2 text-[12px] text-rose-300">{errors.account}</p> : null}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-[13px] font-medium text-zinc-300" htmlFor="login-password">
                    密码
                  </label>
                  <button
                    type="button"
                    className="text-[13px] text-blue-200 transition hover:text-blue-100"
                    onClick={() => setMode("reset")}
                  >
                    忘记密码？
                  </button>
                </div>
                <InputShell icon="lock" placeholder="输入您的密码" type="password" canToggleVisibility />
                {errors.password ? <p className="mt-2 text-[12px] text-rose-300">{errors.password}</p> : null}
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#adc6ff] py-3.5 text-[15px] font-medium text-[#001a41] shadow-[0_0_15px_rgba(173,198,255,0.2)] transition hover:bg-[#c3d2ff]"
              >
                <span>登录</span>
                <FieldIcon icon="arrow_forward" />
              </button>
            </form>
          )}

          {isRegister && (
            <form
              className="space-y-4"
              action="#"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                if (!validateRegister(formData)) return;
              }}
            >
              <div>
                <label className="mb-2 block text-[13px] font-medium text-zinc-300" htmlFor="reg-nickname">
                  昵称
                </label>
                <InputShell icon="badge" placeholder="设置您的昵称" />
                {errors.nickname ? <p className="mt-2 text-[12px] text-rose-300">{errors.nickname}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-medium text-zinc-300" htmlFor="reg-email">
                  电子邮箱
                </label>
                <InputShell icon="mail" placeholder="输入您的电子邮箱" type="email" />
                {errors.email ? <p className="mt-2 text-[12px] text-rose-300">{errors.email}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-medium text-zinc-300" htmlFor="reg-verification">
                  验证码
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <InputShell icon="security" placeholder="输入验证码" />
                  </div>
                  <button
                    type="button"
                    className="whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-4 text-[13px] font-medium text-zinc-100 transition hover:bg-white/10"
                  >
                    获取验证码
                  </button>
                </div>
                {errors.verification ? <p className="mt-2 text-[12px] text-rose-300">{errors.verification}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-medium text-zinc-300" htmlFor="reg-password">
                  设置密码
                </label>
                <InputShell
                  icon="lock"
                  placeholder="设置您的密码"
                  type="password"
                  canToggleVisibility
                  value={registerPassword.value}
                  onChange={(value) => {
                    setRegisterPassword({ value, touched: true });
                    if (errors.password) {
                      setErrors((current) => ({ ...current, password: undefined }));
                    }
                  }}
                />
                <p className="mt-2 text-[12px] leading-5 text-zinc-400">{registerMessage}</p>
                {errors.password ? <p className="mt-2 text-[12px] text-rose-300">{errors.password}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-medium text-zinc-300" htmlFor="reg-confirm-password">
                  确认密码
                </label>
                <InputShell icon="lock_reset" placeholder="再次输入密码" type="password" canToggleVisibility />
                {errors.confirmPassword ? <p className="mt-2 text-[12px] text-rose-300">{errors.confirmPassword}</p> : null}
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#adc6ff] py-3.5 text-[15px] font-medium text-[#001a41] shadow-[0_0_15px_rgba(173,198,255,0.2)] transition hover:bg-[#c3d2ff]"
              >
                <span>注册</span>
                <FieldIcon icon="arrow_forward" />
              </button>
            </form>
          )}

          {isReset && (
            <form
              className="space-y-5"
              action="#"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                if (!validateReset(formData)) return;
              }}
            >
              <div>
                <label className="mb-2 block text-[13px] font-medium text-zinc-300" htmlFor="reset-email">
                  电子邮箱
                </label>
                <InputShell icon="mail" placeholder="输入您的电子邮箱" type="email" />
                {errors.email ? <p className="mt-2 text-[12px] text-rose-300">{errors.email}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-medium text-zinc-300" htmlFor="reset-code">
                  验证码
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <InputShell icon="security" placeholder="输入验证码" />
                  </div>
                  <button
                    type="button"
                    className="whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-4 text-[13px] font-medium text-zinc-100 transition hover:bg-white/10"
                  >
                    获取验证码
                  </button>
                </div>
                {errors.verification ? <p className="mt-2 text-[12px] text-rose-300">{errors.verification}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-medium text-zinc-300" htmlFor="reset-password">
                  新密码
                </label>
                <InputShell
                  icon="lock"
                  placeholder="设置新的密码"
                  type="password"
                  canToggleVisibility
                  value={resetPassword.value}
                  onChange={(value) => {
                    setResetPassword({ value, touched: true });
                    if (errors.password) {
                      setErrors((current) => ({ ...current, password: undefined }));
                    }
                  }}
                />
                <p className="mt-2 text-[12px] leading-5 text-zinc-400">{resetMessage}</p>
                {errors.password ? <p className="mt-2 text-[12px] text-rose-300">{errors.password}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-medium text-zinc-300" htmlFor="reset-confirm-password">
                  确认新密码
                </label>
                <InputShell icon="lock_reset" placeholder="再次输入新密码" type="password" canToggleVisibility />
                {errors.confirmPassword ? <p className="mt-2 text-[12px] text-rose-300">{errors.confirmPassword}</p> : null}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 py-3.5 text-[15px] font-medium text-zinc-100 transition hover:bg-white/10"
                  onClick={() => setMode("login")}
                >
                  返回登录
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#adc6ff] py-3.5 text-[15px] font-medium text-[#001a41] shadow-[0_0_15px_rgba(173,198,255,0.2)] transition hover:bg-[#c3d2ff]"
                >
                  <span>重置密码</span>
                  <FieldIcon icon="arrow_forward" />
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 border-t border-white/5 pt-5 text-center text-[13px] text-zinc-400">
          登录即代表您同意我们的 <a href="#" className="text-blue-200 transition hover:text-blue-100">服务条款</a> 和 <a href="#" className="text-blue-200 transition hover:text-blue-100">隐私政策</a>
        </div>
      </div>
    </div>
  );
}
