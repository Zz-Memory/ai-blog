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
  name,
}: {
  icon: string;
  placeholder: string;
  type?: string;
  canToggleVisibility?: boolean;
  value?: string;
  name?: string;
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
        name={name}
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
  if (!touched && !value) return "密码需由字母与数字组合，长度至少 8 位。";
  const isValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value);
  return isValid ? "密码格式符合要求。" : "密码需由字母与数字组合，长度至少 8 位。";
}

function isStrongPassword(value: string) {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value);
}

async function readApiMessage(response: Response) {
  const data = (await response.json().catch(() => null)) as { message?: string } | null;
  return data?.message || (response.ok ? "操作成功。" : "操作失败，请重试。");
}

export function AuthModal({ isOpen, initialMode, onClose }: { isOpen: boolean; initialMode: Exclude<AuthMode, "reset">; onClose: () => void; }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [registerPassword, setRegisterPassword] = useState<PasswordState>({ value: "", touched: false });
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [resetPassword, setResetPassword] = useState<PasswordState>({ value: "", touched: false });
  const [registerVerification, setRegisterVerification] = useState("");
  const [resetVerification, setResetVerification] = useState("");
  const [registerNickname, setRegisterNickname] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [loginAccount, setLoginAccount] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [errors, setErrors] = useState<ValidationState>({});

  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; if (isOpen) window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, [isOpen, onClose]);

  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isReset = mode === "reset";

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setRegisterPassword({ value: "", touched: false });
    setRegisterConfirmPassword("");
    setResetPassword({ value: "", touched: false });
    setRegisterVerification("");
    setResetVerification("");
    setRegisterNickname("");
    setRegisterEmail("");
    setResetEmail("");
    setLoginAccount("");
    setLoginPassword("");
    setIsSendingCode(false);
    setIsLoggingIn(false);
    setSubmitMessage("");
    setErrors({});
  }, [isOpen, initialMode]);

  const registerMessage = useMemo(() => passwordRuleMessage(registerPassword.value, registerPassword.touched), [registerPassword]);
  const resetMessage = useMemo(() => passwordRuleMessage(resetPassword.value, resetPassword.touched), [resetPassword]);

  if (!isOpen) return null;

  const handleSendVerificationCode = async (email: string, purpose: "register" | "reset") => {
    if (!email) { setErrors((current) => ({ ...current, email: "请输入电子邮箱。" })); return; }
    setSubmitMessage(""); setIsSendingCode(true);
    try {
      const response = await fetch("/api/auth/verification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, purpose: purpose === "reset" ? "RESET_PASSWORD" : "REGISTER" }) });
      setSubmitMessage(await readApiMessage(response));
    } catch { setSubmitMessage("验证码发送失败，请稍后重试。"); } finally { setIsSendingCode(false); }
  };

  const handleLoginSubmit = async () => {
    const nextErrors: ValidationState = {};
    if (!loginAccount.trim()) nextErrors.account = "请输入账号或邮箱。";
    if (!loginPassword.trim()) nextErrors.password = "请输入密码。";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitMessage("");
    setIsLoggingIn(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: loginAccount.trim(), password: loginPassword }),
      });
      const message = await readApiMessage(response);
      setSubmitMessage(message);
    } catch {
      setSubmitMessage("登录失败，请稍后重试。");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async () => {
    if (!validateRegister()) return;

    setSubmitMessage("");
    setIsRegistering(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: registerNickname.trim(),
          email: registerEmail.trim(),
          verification: registerVerification.trim(),
          password: registerPassword.value,
          confirmPassword: registerConfirmPassword.trim(),
        }),
      });
      const message = await readApiMessage(response);
      setSubmitMessage(message);
    } catch {
      setSubmitMessage("注册失败，请稍后重试。");
    } finally {
      setIsRegistering(false);
    }
  };

  const validateRegister = () => {
    const nextErrors: ValidationState = {};
    if (!registerNickname.trim()) nextErrors.nickname = "请输入昵称。";
    if (!registerEmail.trim()) nextErrors.email = "请输入电子邮箱。";
    if (!registerVerification.trim()) nextErrors.verification = "请输入验证码。";
    if (!registerPassword.value) nextErrors.password = "请输入密码。"; else if (!isStrongPassword(registerPassword.value)) nextErrors.password = "密码格式错误，请输入字母与数字组合，且至少 8 位。";
    if (!registerConfirmPassword) nextErrors.confirmPassword = "请再次输入密码。"; else if (registerPassword.value !== registerConfirmPassword) nextErrors.confirmPassword = "两次输入的密码不一致。";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateReset = () => {
    const nextErrors: ValidationState = {};
    if (!resetEmail.trim()) nextErrors.email = "请输入电子邮箱。";
    if (!resetVerification.trim()) nextErrors.verification = "请输入验证码。";
    if (!resetPassword.value) nextErrors.password = "请输入新密码。"; else if (!isStrongPassword(resetPassword.value)) nextErrors.password = "密码格式错误，请输入字母与数字组合，且至少 8 位。";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button type="button" aria-label="关闭登录注册弹窗" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-2xl border border-white/10 bg-[#18191d] p-6 shadow-[0_0_30px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent" />
        <button type="button" aria-label="关闭" className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100" onClick={onClose}><FieldIcon icon="close" /></button>
        <div className="text-center"><h1 className="text-[40px] font-semibold tracking-tight text-zinc-100">Memory的小破站</h1></div>
        <div className="mt-8 flex rounded-lg bg-white/5 p-1">
          <button type="button" onClick={() => { setMode("login"); setErrors({}); }} className={`flex-1 rounded-md py-2.5 text-[15px] transition ${isLogin ? "border border-white/5 bg-[#2a2a2d] text-zinc-100 shadow-sm" : "text-zinc-400 hover:text-zinc-100"}`}>登录</button>
          <button type="button" onClick={() => { setMode("register"); setErrors({}); }} className={`flex-1 rounded-md py-2.5 text-[15px] transition ${isRegister ? "border border-white/5 bg-[#2a2a2d] text-zinc-100 shadow-sm" : "text-zinc-400 hover:text-zinc-100"}`}>注册</button>
        </div>
        <div className="mt-6 max-h-[60vh] overflow-y-auto pr-1">
          {submitMessage ? <div className="mb-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-[13px] leading-6 text-zinc-200">{submitMessage}</div> : null}
          {isLogin && (
            <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); void handleLoginSubmit(); }}>
              <div><label className="mb-2 block text-[13px] font-medium text-zinc-300">账号/邮箱</label><InputShell icon="person" placeholder="输入您的账号或邮箱" value={loginAccount} onChange={setLoginAccount} /></div>
              <div><div className="mb-2 flex items-center justify-between"><label className="block text-[13px] font-medium text-zinc-300">密码</label><button type="button" className="text-[13px] text-blue-200 transition hover:text-blue-100" onClick={() => setMode("reset")}>忘记密码？</button></div><InputShell icon="lock" placeholder="输入您的密码" type="password" canToggleVisibility value={loginPassword} onChange={setLoginPassword} /></div>
              <button type="submit" disabled={isLoggingIn} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#adc6ff] py-3.5 text-[15px] font-medium text-[#001a41] shadow-[0_0_15px_rgba(173,198,255,0.2)] transition hover:bg-[#c3d2ff] disabled:cursor-not-allowed disabled:opacity-70"><span>{isLoggingIn ? "登录中..." : "登录"}</span><FieldIcon icon="arrow_forward" /></button>
            </form>
          )}
          {isRegister && (
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void handleRegisterSubmit(); }}>
              <div><label className="mb-2 block text-[13px] font-medium text-zinc-300">昵称</label><InputShell icon="badge" placeholder="设置您的昵称" value={registerNickname} onChange={setRegisterNickname} />{errors.nickname ? <p className="mt-2 text-[12px] text-rose-300">{errors.nickname}</p> : null}</div>
              <div><label className="mb-2 block text-[13px] font-medium text-zinc-300">电子邮箱</label><InputShell icon="mail" placeholder="输入您的电子邮箱" type="email" value={registerEmail} onChange={setRegisterEmail} />{errors.email ? <p className="mt-2 text-[12px] text-rose-300">{errors.email}</p> : null}</div>
              <div><label className="mb-2 block text-[13px] font-medium text-zinc-300">验证码</label><div className="flex gap-3"><div className="flex-1"><InputShell icon="security" placeholder="输入验证码" value={registerVerification} onChange={setRegisterVerification} /></div><button type="button" disabled={isSendingCode} className="whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-4 text-[13px] font-medium text-zinc-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60" onClick={() => void handleSendVerificationCode(registerEmail.trim(), "register")}>{isSendingCode ? "发送中..." : "获取验证码"}</button></div>{errors.verification ? <p className="mt-2 text-[12px] text-rose-300">{errors.verification}</p> : null}</div>
              <div><label className="mb-2 block text-[13px] font-medium text-zinc-300">设置密码</label><InputShell icon="lock" placeholder="设置您的密码" type="password" canToggleVisibility value={registerPassword.value} onChange={(value) => setRegisterPassword({ value, touched: true })} /><p className="mt-2 text-[12px] leading-5 text-zinc-400">{registerMessage}</p>{errors.password ? <p className="mt-2 text-[12px] text-rose-300">{errors.password}</p> : null}</div>
              <div><label className="mb-2 block text-[13px] font-medium text-zinc-300">确认密码</label><InputShell icon="lock_reset" placeholder="再次输入密码" type="password" canToggleVisibility value={registerConfirmPassword} onChange={setRegisterConfirmPassword} />{errors.confirmPassword ? <p className="mt-2 text-[12px] text-rose-300">{errors.confirmPassword}</p> : null}</div>
              <button type="submit" disabled={isRegistering} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#adc6ff] py-3.5 text-[15px] font-medium text-[#001a41] shadow-[0_0_15px_rgba(173,198,255,0.2)] transition hover:bg-[#c3d2ff] disabled:cursor-not-allowed disabled:opacity-70"><span>{isRegistering ? "注册中..." : "注册"}</span><FieldIcon icon="arrow_forward" /></button>
            </form>
          )}
          {isReset && (
            <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); if (!validateReset()) return; setSubmitMessage("重置密码功能稍后接入。"); }}>
              <div><label className="mb-2 block text-[13px] font-medium text-zinc-300">电子邮箱</label><InputShell icon="mail" placeholder="输入您的电子邮箱" type="email" value={resetEmail} onChange={setResetEmail} /></div>
              <div><label className="mb-2 block text-[13px] font-medium text-zinc-300">验证码</label><div className="flex gap-3"><div className="flex-1"><InputShell icon="security" placeholder="输入验证码" value={resetVerification} onChange={setResetVerification} /></div><button type="button" disabled={isSendingCode} className="whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-4 text-[13px] font-medium text-zinc-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60" onClick={() => void handleSendVerificationCode(resetEmail.trim(), "reset")}>{isSendingCode ? "发送中..." : "获取验证码"}</button></div></div>
              <div><label className="mb-2 block text-[13px] font-medium text-zinc-300">新密码</label><InputShell icon="lock" placeholder="设置新的密码" type="password" canToggleVisibility value={resetPassword.value} onChange={(value) => setResetPassword({ value, touched: true })} /><p className="mt-2 text-[12px] leading-5 text-zinc-400">{resetMessage}</p></div>
              <div className="flex gap-3 pt-1"><button type="button" className="flex-1 rounded-lg border border-white/10 bg-white/5 py-3.5 text-[15px] font-medium text-zinc-100 transition hover:bg-white/10" onClick={() => setMode("login")}>返回登录</button><button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#adc6ff] py-3.5 text-[15px] font-medium text-[#001a41] shadow-[0_0_15px_rgba(173,198,255,0.2)] transition hover:bg-[#c3d2ff]"><span>重置密码</span><FieldIcon icon="arrow_forward" /></button></div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
