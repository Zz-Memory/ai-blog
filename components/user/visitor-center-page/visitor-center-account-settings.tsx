"use client";

import { useMemo, useState } from "react";

type AccountRole = "visitor" | "blogger";

const accountRole: AccountRole = "visitor";
const avatarByRole: Record<AccountRole, string> = {
  visitor: "/avatars/visitor-default.png",
  blogger: "/avatars/blogger-default.png",
};

const passwordStrengthRegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
const verificationCodeRegExp = /^\d{6}$/;

// 账号设置模块：个人资料、安全设置、邮箱绑定与危险区域。
// 该模块根据示例设计稿还原为右侧主内容区，用于管理个人身份与安全信息。
export function VisitorCenterAccountSettings() {
  const [passwordMode, setPasswordMode] = useState<"modify" | "reset">("modify");
  const [nicknameEditing, setNicknameEditing] = useState(false);
  const [savedNickname, setSavedNickname] = useState("AI Explorer");
  const [nicknameDraft, setNicknameDraft] = useState("AI Explorer");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [resetCode, setResetCode] = useState("");

  const newPasswordError = useMemo(() => {
    if (!newPassword) return "";
    return passwordStrengthRegExp.test(newPassword) ? "" : "密码需由字母与数字组合，且长度至少 8 位。";
  }, [newPassword]);

  const confirmPasswordError = useMemo(() => {
    if (!confirmPassword) return "";
    if (!passwordStrengthRegExp.test(confirmPassword)) {
      return "密码需由字母与数字组合，且长度至少 8 位。";
    }
    if (newPassword && confirmPassword !== newPassword) {
      return "两次输入的密码不一致";
    }
    return "";
  }, [confirmPassword, newPassword]);

  const emailCodeError = useMemo(() => {
    if (!emailCode) return "";
    return verificationCodeRegExp.test(emailCode) ? "验证码正确" : "验证码错误";
  }, [emailCode]);

  const resetCodeError = useMemo(() => {
    if (!resetCode) return "";
    return verificationCodeRegExp.test(resetCode) ? "验证码正确" : "验证码错误";
  }, [resetCode]);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-[48px] font-bold tracking-[-0.02em] text-zinc-100">个人资料</h2>
        <p className="max-w-2xl text-[17px] leading-8 text-zinc-400">配置您在本博客网站中的身份和展示。</p>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#14161b] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#adc6ff]/10 blur-[80px] pointer-events-none" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex shrink-0 flex-col items-center gap-3">
            <div className="group relative">
              <div className="h-32 w-32 overflow-hidden rounded-full border border-white/10 bg-[#101215]">
                <img
                  src={avatarByRole[accountRole]}
                  alt={accountRole === "visitor" ? "访客默认头像" : "博主默认头像"}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <span className="text-xs tracking-[0.2em] text-zinc-500">系统默认头像</span>
          </div>

          <div className="flex-1 space-y-4 pt-1">
            <div className="space-y-2">
              <label htmlFor="nickname" className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                昵称（可修改）
              </label>
              {nicknameEditing ? (
                <div className="relative">
                  <input
                    id="nickname"
                    type="text"
                    value={nicknameDraft}
                    onChange={(event) => setNicknameDraft(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 pr-4 text-sm text-zinc-100 outline-none transition focus:border-[#adc6ff]/50 focus:ring-1 focus:ring-[#adc6ff]/20"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setNicknameDraft(savedNickname);
                    setNicknameEditing(true);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#101215] px-4 py-3 text-left text-sm text-zinc-100 transition hover:border-[#adc6ff]/40 hover:bg-[#131722]"
                >
                  <span>{savedNickname}</span>
                  <span className="material-symbols-outlined text-[18px] text-zinc-500">edit</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                用户名（登录账号）
              </label>
              <input
                id="username"
                type="text"
                disabled
                defaultValue="@thinkspace_user"
                className="w-full cursor-not-allowed rounded-xl border border-transparent bg-white/[0.03] px-4 py-3 text-sm text-zinc-500 opacity-90 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-white/8 pt-5 mt-6">
          <button
            type="button"
            onClick={() => {
              setSavedNickname(nicknameDraft);
              setNicknameEditing(false);
            }}
            className="rounded-xl bg-[#adc6ff] px-5 py-3 text-sm font-medium text-[#001a41] transition hover:bg-[#c3d2ff]"
          >
            保存更改
          </button>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <section id="security" className="space-y-6">
        <h2 className="text-2xl font-semibold text-zinc-100">安全设置</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-5 rounded-2xl border border-white/8 bg-[#14161b] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-zinc-100">
                <span className="material-symbols-outlined text-[#adc6ff]">key</span>
                <h3 className="text-base font-semibold">修改密码</h3>
              </div>
              <div className="flex rounded-lg border border-white/8 bg-white/5 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setPasswordMode("modify")}
                  className={`rounded-md px-3 py-1 transition ${passwordMode === "modify" ? "bg-[#2a2e39] text-zinc-100" : "text-zinc-400"}`}
                >
                  修改密码
                </button>
                <button
                  type="button"
                  onClick={() => setPasswordMode("reset")}
                  className={`rounded-md px-3 py-1 transition ${passwordMode === "reset" ? "bg-[#2a2e39] text-zinc-100" : "text-zinc-400"}`}
                >
                  重置密码
                </button>
              </div>
            </div>

            {passwordMode === "modify" ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 pr-12 text-sm text-zinc-100 outline-none"
                      placeholder="旧密码"
                      type={showOldPassword ? "text" : "password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-200"
                      aria-label={showOldPassword ? "隐藏旧密码" : "显示旧密码"}
                    >
                      <span className="material-symbols-outlined text-[18px]">{showOldPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 pr-12 text-sm text-zinc-100 outline-none"
                      placeholder="新密码"
                      type={showNewPassword ? "text" : "password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-200"
                      aria-label={showNewPassword ? "隐藏新密码" : "显示新密码"}
                    >
                      <span className="material-symbols-outlined text-[18px]">{showNewPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                  {newPassword ? (
                    <p className={`text-xs leading-6 ${newPasswordError ? "text-rose-300" : "text-emerald-300"}`}>
                      {newPasswordError || "密码需由字母与数字组合，且长度至少 8 位。"}
                    </p>
                  ) : (
                    <p className="text-xs leading-6 text-zinc-500">密码需由字母与数字组合，且长度至少 8 位。</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 pr-12 text-sm text-zinc-100 outline-none"
                      placeholder="确认新密码"
                      type={showConfirmPassword ? "text" : "password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-200"
                      aria-label={showConfirmPassword ? "隐藏确认密码" : "显示确认密码"}
                    >
                      <span className="material-symbols-outlined text-[18px]">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                  {confirmPassword ? (
                    <p className={`text-xs leading-6 ${confirmPasswordError ? "text-rose-300" : "text-emerald-300"}`}>
                      {confirmPasswordError || "密码需由字母与数字组合，且长度至少 8 位。"}
                    </p>
                  ) : (
                    <p className="text-xs leading-6 text-zinc-500">密码需由字母与数字组合，且长度至少 8 位。</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <input
                      value={resetCode}
                      onChange={(event) => setResetCode(event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 text-sm text-zinc-100 outline-none"
                      placeholder="邮箱验证码"
                      type="text"
                    />
                    <button type="button" className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10">
                      发送验证码
                    </button>
                  </div>
                  {resetCode ? (
                    <p className={`text-xs leading-6 ${resetCodeError === "验证码正确" ? "text-emerald-300" : "text-rose-300"}`}>
                      {resetCodeError}
                    </p>
                  ) : (
                    <p className="text-xs leading-6 text-zinc-500">请输入邮箱收到的 6 位验证码。</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 pr-12 text-sm text-zinc-100 outline-none"
                      placeholder="新密码"
                      type={showNewPassword ? "text" : "password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-200"
                      aria-label={showNewPassword ? "隐藏新密码" : "显示新密码"}
                    >
                      <span className="material-symbols-outlined text-[18px]">{showNewPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                  {newPassword ? (
                    <p className={`text-xs leading-6 ${newPasswordError ? "text-rose-300" : "text-emerald-300"}`}>
                      {newPasswordError || "密码需由字母与数字组合，且长度至少 8 位。"}
                    </p>
                  ) : (
                    <p className="text-xs leading-6 text-zinc-500">密码需由字母与数字组合，且长度至少 8 位。</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 pr-12 text-sm text-zinc-100 outline-none"
                      placeholder="确认新密码"
                      type={showConfirmPassword ? "text" : "password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-200"
                      aria-label={showConfirmPassword ? "隐藏确认密码" : "显示确认密码"}
                    >
                      <span className="material-symbols-outlined text-[18px]">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                  {confirmPassword ? (
                    <p className={`text-xs leading-6 ${confirmPasswordError ? "text-rose-300" : "text-emerald-300"}`}>
                      {confirmPasswordError || "密码需由字母与数字组合，且长度至少 8 位。"}
                    </p>
                  ) : (
                    <p className="text-xs leading-6 text-zinc-500">密码需由字母与数字组合，且长度至少 8 位。</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button type="button" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10">
                更改密码
              </button>
            </div>
          </div>

          <div className="space-y-5 rounded-2xl border border-white/8 bg-[#14161b] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-3 text-zinc-100">
              <span className="material-symbols-outlined text-[#adc6ff]">mark_email_read</span>
              <h3 className="text-base font-semibold">邮箱绑定</h3>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">当前已验证邮箱</div>
              <div className="mt-2 text-sm text-zinc-100">user1233456@thinkspace.ai</div>
            </div>

            <div className="space-y-3 border-t border-white/8 pt-4">
              <div className="flex gap-3">
                <input className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 text-sm text-zinc-100 outline-none" placeholder="输入新邮箱" type="text" />
                <button type="button" className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10">
                  发送验证码
                </button>
              </div>
              <input
                value={emailCode}
                onChange={(event) => setEmailCode(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#101215] px-4 py-3 text-sm text-zinc-100 outline-none"
                placeholder="验证码"
                type="text"
              />
              {emailCode ? (
                <p className={`text-xs leading-6 ${emailCodeError === "验证码正确" ? "text-emerald-300" : "text-rose-300"}`}>
                  {emailCodeError}
                </p>
              ) : (
                <p className="text-xs leading-6 text-zinc-500">请输入邮箱收到的 6 位验证码。</p>
              )}
              <div className="flex justify-end">
                <button type="button" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10">
                  更改邮箱
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <section id="danger" className="space-y-6">
        <h2 className="text-2xl font-semibold text-[#ffb4ab]">危险区域</h2>
        <div className="relative overflow-hidden rounded-2xl border border-[#ffb4ab]/20 bg-[#2a1416] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-[#ffb4ab]/5 blur-[60px] pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-zinc-100">注销账号</h3>
              <p className="max-w-2xl text-sm leading-7 text-zinc-400">
                注销后，您的所有数据（包括帖子、评论和 AI 历史记录）将被永久删除。<span className="font-semibold text-[#ffb4ab]">此操作不可逆转。</span>
              </p>
              <div className="flex max-w-sm gap-3">
                <input className="w-full rounded-xl border border-[#ffb4ab]/30 bg-[#101215] px-4 py-3 text-sm text-zinc-100 outline-none" placeholder="邮箱验证码" type="text" />
                <button type="button" className="shrink-0 rounded-xl border border-[#ffb4ab]/30 bg-[#ffb4ab]/10 px-4 py-3 text-sm font-medium text-[#ffb4ab] transition hover:bg-[#ffb4ab]/20">
                  发送验证码
                </button>
              </div>
            </div>

            <button type="button" className="shrink-0 rounded-xl border border-[#ffb4ab]/30 bg-[#93000a] px-5 py-3 text-sm font-medium text-[#ffdad6] opacity-50 cursor-not-allowed">
              确认注销
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
