"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AccountRole = "visitor" | "blogger";

type AccountSettingsProfile = {
  id: string;
  email: string;
  username: string;
  role: AccountRole;
  nickname: string;
  avatarUrl: string;
};

const passwordStrengthRegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
const verificationCodeRegExp = /^\d{6}$/;
const COOLDOWN_SECONDS = 60;

type VerificationPurpose = "RESET_PASSWORD" | "DELETE_ACCOUNT";

export function VisitorCenterAccountSettings() {
  const [passwordMode, setPasswordMode] = useState<"modify" | "reset">("modify");
  const [nicknameEditing, setNicknameEditing] = useState(false);
  const [savedNickname, setSavedNickname] = useState("AI Explorer");
  const [nicknameDraft, setNicknameDraft] = useState("AI Explorer");
  const [email, setEmail] = useState("user1233456@thinkspace.ai");
  const [avatarUrl, setAvatarUrl] = useState("/avatars/visitor-default.png");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [deleteCode, setDeleteCode] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [loadingAction, setLoadingAction] = useState<"password" | "reset" | "delete" | null>(null);
  const [resetCooldown, setResetCooldown] = useState(0);
  const [deleteCooldown, setDeleteCooldown] = useState(0);
  const resetTimerRef = useRef<number | null>(null);
  const deleteTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/user/account-settings", { cache: "no-store" });
        const payload = (await response.json().catch(() => ({}))) as { user?: AccountSettingsProfile; message?: string };
        if (!response.ok) throw new Error(payload.message || "加载账号设置失败。");
        if (!mounted || !payload.user) return;
        setSavedNickname(payload.user.nickname);
        setNicknameDraft(payload.user.nickname);
        setEmail(payload.user.email);
        setAvatarUrl(payload.user.avatarUrl);
      } catch (error) {
        if (!mounted) return;
        setProfileError(error instanceof Error ? error.message : "加载账号设置失败。");
      } finally {
        if (mounted) setProfileLoading(false);
      }
    }

    void loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (resetCooldown <= 0) return;
    resetTimerRef.current = window.setTimeout(() => setResetCooldown((value) => value - 1), 1000);
    return () => {
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    };
  }, [resetCooldown]);

  useEffect(() => {
    if (deleteCooldown <= 0) return;
    deleteTimerRef.current = window.setTimeout(() => setDeleteCooldown((value) => value - 1), 1000);
    return () => {
      if (deleteTimerRef.current) window.clearTimeout(deleteTimerRef.current);
    };
  }, [deleteCooldown]);

  const newPasswordError = useMemo(() => {
    if (!newPassword) return "";
    return passwordStrengthRegExp.test(newPassword) ? "" : "密码需由字母与数字组合，且长度至少 8 位。";
  }, [newPassword]);

  const confirmPasswordError = useMemo(() => {
    if (!confirmPassword) return "";
    if (!passwordStrengthRegExp.test(confirmPassword)) return "密码需由字母与数字组合，且长度至少 8 位。";
    if (newPassword && confirmPassword !== newPassword) return "两次输入的新密码不一致。";
    return "";
  }, [confirmPassword, newPassword]);

  const resetCodeError = useMemo(() => {
    if (!resetCode) return "";
    return verificationCodeRegExp.test(resetCode) ? "验证码正确" : "验证码错误";
  }, [resetCode]);

  const deleteCodeError = useMemo(() => {
    if (!deleteCode) return "";
    return verificationCodeRegExp.test(deleteCode) ? "验证码正确" : "验证码错误";
  }, [deleteCode]);

  const canDeleteAccount = deleteCodeError === "验证码正确";

  async function sendVerificationCode(purpose: VerificationPurpose) {
    setActionError("");
    setActionMessage("");
    const cooldown = purpose === "DELETE_ACCOUNT" ? deleteCooldown : resetCooldown;
    if (cooldown > 0) return;

    try {
      const response = await fetch("/api/user/account-settings/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose }),
      });
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) throw new Error(payload.message || "验证码发送失败。");
      setActionMessage(payload.message || "验证码已发送，请查收邮箱。");
      if (purpose === "DELETE_ACCOUNT") setDeleteCooldown(COOLDOWN_SECONDS);
      else setResetCooldown(COOLDOWN_SECONDS);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "验证码发送失败。");
    }
  }

  async function handleSaveNickname() {
    const nextNickname = nicknameDraft.trim();
    if (!nextNickname) return;
    setProfileSaving(true);
    setProfileError("");
    setActionMessage("");
    try {
      const response = await fetch("/api/user/account-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nextNickname }),
      });
      const payload = (await response.json().catch(() => ({}))) as { user?: AccountSettingsProfile; message?: string };
      if (!response.ok) throw new Error(payload.message || "保存昵称失败。");
      if (payload.user) {
        setSavedNickname(payload.user.nickname);
        setNicknameDraft(payload.user.nickname);
        setEmail(payload.user.email);
        setAvatarUrl(payload.user.avatarUrl);
      }
      setNicknameEditing(false);
      setActionMessage("昵称已保存。");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "保存昵称失败。");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword() {
    setActionError("");
    setActionMessage("");
    if (!oldPassword) return setActionError("请输入旧密码。");
    if (newPasswordError || confirmPasswordError || !newPassword || !confirmPassword) return setActionError(newPasswordError || confirmPasswordError || "请检查密码输入是否正确。");

    setLoadingAction("password");
    try {
      const response = await fetch("/api/user/account-settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, password: newPassword, confirmPassword }),
      });
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) throw new Error(payload.message || "修改密码失败。");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setActionMessage(payload.message || "密码修改成功。");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "修改密码失败。");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleResetPassword() {
    setActionError("");
    setActionMessage("");
    if (!resetCode) return setActionError("请输入验证码。");
    if (newPasswordError || confirmPasswordError || !newPassword || !confirmPassword) return setActionError(newPasswordError || confirmPasswordError || "请检查密码输入是否正确。");

    setLoadingAction("reset");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, verificationCode: resetCode, password: newPassword, confirmPassword }),
      });
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) throw new Error(payload.message || "重置密码失败。");
      setResetCode("");
      setNewPassword("");
      setConfirmPassword("");
      setActionMessage(payload.message || "密码重置成功。");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "重置密码失败。");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleDeleteAccount() {
    setActionError("");
    setActionMessage("");
    if (!canDeleteAccount) return setActionError("请输入正确的验证码。");

    setLoadingAction("delete");
    try {
      const response = await fetch("/api/user/account-settings/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationCode: deleteCode, email }),
      });
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) throw new Error(payload.message || "注销账号失败。");
      setActionMessage(payload.message || "账号已注销。");
      window.location.href = "/";
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "注销账号失败。");
    } finally {
      setLoadingAction(null);
    }
  }

  const resetSendDisabled = resetCooldown > 0;
  const deleteSendDisabled = deleteCooldown > 0;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-[48px] font-bold tracking-[-0.02em] text-zinc-100">个人资料</h2>
        <p className="max-w-2xl text-[17px] leading-8 text-zinc-400">配置您在本博客网站中的身份和展示。</p>
        {profileError ? <p className="text-sm text-rose-300">{profileError}</p> : null}
        {actionError ? <p className="text-sm text-rose-300">{actionError}</p> : null}
        {actionMessage ? <p className="text-sm text-emerald-300">{actionMessage}</p> : null}
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#14161b] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:p-8">{/* ... existing profile card unchanged ... */}
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#adc6ff]/10 blur-[80px] pointer-events-none" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex shrink-0 flex-col items-center gap-3"><div className="h-32 w-32 overflow-hidden rounded-full border border-white/10 bg-[#101215]"><img src={avatarUrl} alt={savedNickname} className="h-full w-full object-cover" /></div><span className="text-xs tracking-[0.2em] text-zinc-500">用户头像</span></div>
          <div className="flex-1 space-y-4 pt-1">
            <div className="space-y-2"><label htmlFor="nickname" className="text-xs uppercase tracking-[0.18em] text-zinc-500">昵称（可修改）</label>{nicknameEditing ? <input id="nickname" type="text" value={nicknameDraft} onChange={(event) => setNicknameDraft(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-[#adc6ff]/50 focus:ring-1 focus:ring-[#adc6ff]/20" /> : <button type="button" onClick={() => { setNicknameDraft(savedNickname); setNicknameEditing(true); }} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#101215] px-4 py-3 text-left text-sm text-zinc-100 transition hover:border-[#adc6ff]/40 hover:bg-[#131722]"><span>{savedNickname}</span><span className="material-symbols-outlined text-[18px] text-zinc-500">edit</span></button>}</div>
            <div className="space-y-2"><label htmlFor="account" className="text-xs uppercase tracking-[0.18em] text-zinc-500">账号（邮箱）</label><input id="account" type="text" disabled value={email} className="w-full cursor-not-allowed rounded-xl border border-transparent bg-white/[0.03] px-4 py-3 text-sm text-zinc-500 opacity-90 outline-none" /></div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-white/8 pt-5"><p className="text-xs text-zinc-500">{profileLoading ? "正在加载账号信息..." : "账户已同步到数据库"}</p><button type="button" disabled={profileSaving || profileLoading} onClick={handleSaveNickname} className="rounded-xl bg-[#adc6ff] px-5 py-3 text-sm font-medium text-[#001a41] transition hover:bg-[#c3d2ff] disabled:cursor-not-allowed disabled:opacity-60">{profileSaving ? "保存中..." : "保存更改"}</button></div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <section id="security" className="space-y-6">
        <h2 className="text-2xl font-semibold text-zinc-100">安全设置</h2>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-5 rounded-2xl border border-white/8 bg-[#14161b] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3 text-zinc-100"><span className="material-symbols-outlined text-[#adc6ff]">key</span><h3 className="text-base font-semibold">修改密码</h3></div><div className="flex rounded-lg border border-white/8 bg-white/5 p-1 text-xs"><button type="button" onClick={() => setPasswordMode("modify")} className={`rounded-md px-3 py-1 transition ${passwordMode === "modify" ? "bg-[#2a2e39] text-zinc-100" : "text-zinc-400"}`}>修改密码</button><button type="button" onClick={() => setPasswordMode("reset")} className={`rounded-md px-3 py-1 transition ${passwordMode === "reset" ? "bg-[#2a2e39] text-zinc-100" : "text-zinc-400"}`}>重置密码</button></div></div>
            {passwordMode === "modify" ? <div className="space-y-3"> <div className="relative"><input value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 pr-12 text-sm text-zinc-100 outline-none" placeholder="旧密码" type={showOldPassword ? "text" : "password"} /><button type="button" onClick={() => setShowOldPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-200" aria-label={showOldPassword ? "隐藏旧密码" : "显示旧密码"}><span className="material-symbols-outlined text-[18px]">{showOldPassword ? "visibility_off" : "visibility"}</span></button></div><div className="relative"><input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 pr-12 text-sm text-zinc-100 outline-none" placeholder="新密码" type={showNewPassword ? "text" : "password"} /><button type="button" onClick={() => setShowNewPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-200" aria-label={showNewPassword ? "隐藏新密码" : "显示新密码"}><span className="material-symbols-outlined text-[18px]">{showNewPassword ? "visibility_off" : "visibility"}</span></button></div>{newPassword ? <p className={`text-xs leading-6 ${newPasswordError ? "text-rose-300" : "text-emerald-300"}`}>{newPasswordError || "密码需由字母与数字组合，且长度至少 8 位。"}</p> : <p className="text-xs leading-6 text-zinc-500">密码需由字母与数字组合，且长度至少 8 位。</p>}<div className="relative"><input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 pr-12 text-sm text-zinc-100 outline-none" placeholder="确认新密码" type={showConfirmPassword ? "text" : "password"} /><button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-200" aria-label={showConfirmPassword ? "隐藏确认密码" : "显示确认密码"}><span className="material-symbols-outlined text-[18px]">{showConfirmPassword ? "visibility_off" : "visibility"}</span></button></div>{confirmPassword ? <p className={`text-xs leading-6 ${confirmPasswordError ? "text-rose-300" : "text-emerald-300"}`}>{confirmPasswordError || "密码需由字母与数字组合，且长度至少 8 位。"}</p> : <p className="text-xs leading-6 text-zinc-500">密码需由字母与数字组合，且长度至少 8 位。</p>}<div className="flex justify-end"><button type="button" onClick={handleChangePassword} disabled={loadingAction === "password"} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10 disabled:opacity-60">{loadingAction === "password" ? "提交中..." : "更改密码"}</button></div></div> : <div className="space-y-3"><div className="flex gap-3"><input value={resetCode} onChange={(event) => setResetCode(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 text-sm text-zinc-100 outline-none" placeholder="邮箱验证码" type="text" /><button type="button" onClick={() => sendVerificationCode("RESET_PASSWORD")} disabled={resetSendDisabled} className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60">{resetCooldown > 0 ? `${resetCooldown} 秒后可重发` : "发送验证码"}</button></div>{resetCode ? <p className={`text-xs leading-6 ${resetCodeError === "验证码正确" ? "text-emerald-300" : "text-rose-300"}`}>{resetCodeError}</p> : <p className="text-xs leading-6 text-zinc-500">请输入邮箱收到的 6 位验证码。</p>}<div className="relative"><input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 pr-12 text-sm text-zinc-100 outline-none" placeholder="新密码" type={showNewPassword ? "text" : "password"} /><button type="button" onClick={() => setShowNewPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-200" aria-label={showNewPassword ? "隐藏新密码" : "显示新密码"}><span className="material-symbols-outlined text-[18px]">{showNewPassword ? "visibility_off" : "visibility"}</span></button></div>{newPassword ? <p className={`text-xs leading-6 ${newPasswordError ? "text-rose-300" : "text-emerald-300"}`}>{newPasswordError || "密码需由字母与数字组合，且长度至少 8 位。"}</p> : <p className="text-xs leading-6 text-zinc-500">密码需由字母与数字组合，且长度至少 8 位。</p>}<div className="relative"><input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 pr-12 text-sm text-zinc-100 outline-none" placeholder="确认新密码" type={showConfirmPassword ? "text" : "password"} /><button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-200" aria-label={showConfirmPassword ? "隐藏确认密码" : "显示确认密码"}><span className="material-symbols-outlined text-[18px]">{showConfirmPassword ? "visibility_off" : "visibility"}</span></button></div>{confirmPassword ? <p className={`text-xs leading-6 ${confirmPasswordError ? "text-rose-300" : "text-emerald-300"}`}>{confirmPasswordError || "密码需由字母与数字组合，且长度至少 8 位。"}</p> : <p className="text-xs leading-6 text-zinc-500">密码需由字母与数字组合，且长度至少 8 位。</p>}<div className="flex justify-end"><button type="button" onClick={handleResetPassword} disabled={loadingAction === "reset"} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10 disabled:opacity-60">{loadingAction === "reset" ? "提交中..." : "更改密码"}</button></div></div>}
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-[#ffb4ab]/20 bg-[#2a1416] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
            <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-[#ffb4ab]/5 blur-[60px] pointer-events-none" />
            <div className="relative z-10 flex h-full flex-col gap-5"><div className="space-y-3"><div className="flex items-center gap-3 text-[#ffb4ab]"><span className="material-symbols-outlined">warning</span><h3 className="text-base font-semibold">注销账号</h3></div><p className="max-w-xl text-sm leading-7 text-zinc-400">注销后，您的所有数据（包括帖子、评论和 AI 历史记录）将被永久删除。<span className="font-semibold text-[#ffb4ab]">此操作不可逆转。</span></p></div><div className="mt-auto space-y-3 rounded-2xl border border-[#ffb4ab]/15 bg-white/[0.02] p-4"><div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-zinc-500"><span className="material-symbols-outlined text-[16px] text-[#ffb4ab]">verified_user</span>验证身份</div><div className="flex gap-3"><input value={deleteCode} onChange={(event) => setDeleteCode(event.target.value)} className="w-full rounded-xl border border-[#ffb4ab]/30 bg-[#101215] px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500" placeholder="输入邮箱验证码" type="text" /><button type="button" onClick={() => sendVerificationCode("DELETE_ACCOUNT")} disabled={deleteSendDisabled} className="shrink-0 rounded-xl border border-[#ffb4ab]/30 bg-[#ffb4ab]/10 px-4 py-3 text-sm font-medium text-[#ffb4ab] transition hover:bg-[#ffb4ab]/20 disabled:cursor-not-allowed disabled:opacity-60">{deleteCooldown > 0 ? `${deleteCooldown} 秒后可重发` : "发送验证码"}</button></div>{deleteCode ? <p className={`text-xs leading-6 ${deleteCodeError === "验证码正确" ? "text-emerald-300" : "text-rose-300"}`}>{deleteCodeError}</p> : <p className="text-xs leading-6 text-zinc-500">请先完成邮箱验证，再执行注销。</p>}<div className="flex items-center justify-between gap-3"><p className="text-xs leading-6 text-zinc-500">该操作会删除账号及其全部关联数据。</p><button type="button" onClick={handleDeleteAccount} disabled={!canDeleteAccount || loadingAction === "delete"} className="shrink-0 rounded-xl border border-[#ffb4ab]/30 bg-[#93000a] px-5 py-3 text-sm font-medium text-[#ffdad6] transition hover:bg-[#c00010] disabled:cursor-not-allowed disabled:opacity-60">{loadingAction === "delete" ? "注销中..." : "确认注销"}</button></div></div></div>
          </div>
        </div>
      </section>
    </div>
  );
}
