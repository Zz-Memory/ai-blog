"use client";

import { useMemo, useState } from "react";

import { AuthModal } from "@/components/blog/auth-modal";
import { SiteFooter } from "@/components/blog/site-footer";
import { SiteHeader } from "@/components/blog/site-header";

type AuthEntry = "login" | "register";

type CommentNode = {
  id: string;
  author: string;
  avatarText: string;
  time: string;
  content: string;
  likes: number;
  replies?: Array<{
    id: string;
    author: string;
    avatarText: string;
    time: string;
    content: string;
    likes: number;
    replyTo: string;
  }>;
};

const articleToc = [
  { id: "intro", label: "超越 RAG：探索下一代...", level: 0 },
  { id: "rag-issues", label: "当前 RAG 架构的困境", level: 1 },
  { id: "graphrag", label: "基于图的上下文感知系统...", level: 1 },
];

const articleTags = ["人工智能", "大语言模型", "前端开发"];

const comments: CommentNode[] = [
  {
    id: "c1",
    author: "Alex Chen",
    avatarText: "A",
    time: "2小时前",
    content:
      "非常深入的分析。GraphRAG 确实在解决全局摘要问题上表现出色，但构建索引时的 token 消耗是个不小的挑战，不知道作者有没有在成本控制方面的建议？",
    likes: 12,
    replies: [
      {
        id: "c1-r1",
        author: "Memory",
        avatarText: "M",
        time: "1小时前",
        content:
          "感谢你的问题。实际落地时可以优先做分层索引、缓存高频查询结果，并通过更轻量的抽取器减少大模型调用次数。",
        likes: 5,
        replyTo: "Alex Chen",
      },
    ],
  },
  {
    id: "c2",
    author: "Sora",
    avatarText: "S",
    time: "30分钟前",
    content: "目录结构和正文排版都很舒服，尤其是侧边悬浮块的视觉处理很到位。",
    likes: 8,
  },
];

export function ArticleDetailPage() {
  const [searchInput, setSearchInput] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authEntry, setAuthEntry] = useState<AuthEntry>("login");
  const [commentDraft, setCommentDraft] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuestion, setChatQuestion] = useState("");
  const [isAuthenticated] = useState(false);
  const [canComment] = useState(true);

  const currentUser = isAuthenticated
    ? {
        name: "Memory",
        role: "blogger" as const,
        avatarUrl: "/avatars/blogger-default.png",
        avatarLabel: "博主头像",
      }
    : {
        name: "访客",
        role: "visitor" as const,
        avatarUrl: "/avatars/visitor-default.png",
        avatarLabel: "访客头像",
      };

  const readingStats = useMemo(
    () => ({
      likes: 12,
      comments: comments.length + comments.reduce((sum, item) => sum + (item.replies?.length ?? 0), 0),
    }),
    []
  );

  const openLogin = () => {
    setAuthEntry("login");
    setAuthOpen(true);
  };

  const openRegister = () => {
    setAuthEntry("register");
    setAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#111215] text-zinc-200">
      <SiteHeader
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={() => undefined}
        onLoginClick={openLogin}
        onRegisterClick={openRegister}
        isAuthenticated={isAuthenticated}
      />

      <main className="relative mx-auto min-h-[calc(100vh-64px)] max-w-[1600px] px-6 py-10 lg:px-10">
        <article className="mx-auto w-full max-w-[840px]">
          <header className="max-w-[840px]">
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <span className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-400">GraphRAG</span>
              <span>发布于 2024-05-24</span>
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
              <span>阅读约 8 分钟</span>
            </div>
            <h1 className="mt-5 text-3xl font-semibold leading-tight text-zinc-50 sm:text-4xl lg:text-[52px]">
              超越 RAG：探索下一代上下文感知 AI 系统的构建范式
            </h1>
            <div className="mt-6 border-t border-white/8 pt-6">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 overflow-hidden rounded-full border border-amber-400/20 shadow-[0_0_0_4px_rgba(255,255,255,0.02)]">
                  <img src="/avatars/blogger-default.png" alt="博主头像" className="h-full w-full object-cover" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-100">Memory</div>
                  <div className="text-sm text-zinc-500">独立开发者 & AI 探索者</div>
                </div>
              </div>
            </div>
          </header>

          <div className="mt-8 max-w-[840px] space-y-8 text-[15px] leading-8 text-zinc-300">
            <p id="intro">在过去的十二个月里，检索增强生成（RAG）几乎成为了企业级 AI 应用的默认架构。通过将外部知识库与大语言模型（LLM）结合，我们成功缓解了幻觉问题，并赋予了模型处理私有数据的能力。然而，随着应用场景的复杂化，传统 RAG 架构的局限性也日益凸显。</p>

            <div className="hidden md:block">
              <div className="fixed bottom-24 right-6 z-50 xl:right-[max(24px,calc((100vw-1600px)/2+24px))]">
                <button
                  type="button"
                  onClick={() => setChatOpen((value) => !value)}
                  className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-primary-container/50 bg-surface-container-high shadow-[0_0_20px_rgba(75,142,255,0.15)] transition hover:shadow-[0_0_30px_rgba(75,142,255,0.3)]"
                  aria-label="打开 AI 问答"
                >
                  <div className="absolute inset-0 rounded-full bg-primary-container/20 opacity-20 animate-ping" />
                  <span className="material-symbols-outlined relative z-10 text-primary-container transition group-hover:scale-110 text-[20px]">smart_toy</span>
                </button>
              </div>
            </div>

            {chatOpen ? (
              <section className="fixed bottom-40 right-6 z-40 w-[760px] max-w-[92vw] rounded-2xl border border-white/8 bg-[#181a20] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] xl:right-[max(24px,calc((100vw-1600px)/2+24px))]">
                <div className="flex items-center justify-between border-b border-white/8 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/20 text-primary">
                      <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-100">小智 AI 助手</h4>
                      <p className="text-xs text-zinc-500">全栈开发与AI研究导师</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setChatQuestion("")}
                      className="rounded-full p-2 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
                      aria-label="清空对话"
                      title="清空对话"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatQuestion((value) => value.trim())}
                      className="rounded-full p-2 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
                      aria-label="刷新对话"
                      title="刷新对话"
                    >
                      <span className="material-symbols-outlined text-[18px]">refresh</span>
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex justify-end gap-3">
                    <div className="rounded-2xl rounded-tr-sm border border-white/8 bg-white/5 px-4 py-3 text-sm text-zinc-200">
                      帮我总结一下这篇文章的核心观点。
                    </div>
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                      <img src={currentUser.avatarUrl} alt={currentUser.avatarLabel} className="h-full w-full object-cover" />
                    </div>
                  </div>
                  <div className="flex justify-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/20 text-primary">
                      <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/8 bg-[#101215] px-4 py-3 text-sm leading-7 text-zinc-300">
                      <p>本文主要探讨了传统 RAG 架构的局限性，并介绍了微软提出的 GraphRAG 作为下一代上下文感知系统的构建范式。</p>
                      <p className="mt-3 font-medium text-zinc-100">核心观点包括：</p>
                      <ul className="mt-2 list-disc space-y-2 pl-5">
                        <li>传统 RAG 在面对多跳推理、全局语境理解和复杂实体关系时存在明显不足。</li>
                        <li>GraphRAG 通过在索引阶段利用 LLM 构建图谱（实体、关系、社区），实现了从简单的文本检索向深度知识图谱检索的转变。</li>
                        <li>这种新范式特别适合回答宏观的、需要综合全局信息的复杂问题。</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/8 bg-surface-container px-4 py-3">
                  <input
                    value={chatQuestion}
                    onChange={(event) => setChatQuestion(event.target.value)}
                    placeholder="向小智提问关于本文的任何问题..."
                    className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
                  />
                  <button type="button" className="rounded-xl p-2 text-zinc-400 transition hover:bg-primary/10 hover:text-primary">
                    <span className="material-symbols-outlined text-[24px]">send</span>
                  </button>
                </div>
                <p className="mt-3 text-center text-[11px] text-zinc-500">AI 生成的内容可能不准确，请注意甄别。</p>
              </section>
            ) : null}

            <section id="rag-issues" className="space-y-4">
              <h2 className="text-2xl font-semibold text-zinc-50">当前 RAG 架构的困境</h2>
              <p>传统的 RAG 往往依赖简单的向量相似度搜索（Dense Retrieval）。这种基于语义嵌入（Embeddings）的方法在处理事实性查询时表现良好，但在以下场景中显得力不从心：</p>
              <ul className="list-disc space-y-2 pl-6 text-zinc-300">
                <li><strong className="text-zinc-100">多跳推理 (Multi-hop Reasoning)</strong>：当回答一个问题需要跨越多个文档收集线索时。</li>
                <li><strong className="text-zinc-100">全局语境缺失</strong>：向量切片（Chunking）破坏了文档的原始上下文结构。</li>
                <li><strong className="text-zinc-100">实体关系弱化</strong>：传统的文本块很难捕捉文档中实体间复杂的图谱关系。</li>
              </ul>
            </section>

            <section id="graphrag" className="space-y-4">
              <h2 className="text-2xl font-semibold text-zinc-50">基于图的上下文感知系统 (GraphRAG)</h2>
              <p>为了突破上述瓶颈，微软提出了 GraphRAG。这并非简单的将知识图谱（Knowledge Graph）与大模型结合，而是一种全新的文本处理范式。系统会在构建索引阶段，利用 LLM 主动从原始语料中提取实体、关系以及实体间的社区（Communities）。</p>

              <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#0d0d0f] shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-2 text-xs text-zinc-400">
                  <span>python</span>
                  <button type="button" className="rounded-md p-1 transition hover:bg-white/5 hover:text-zinc-200" aria-label="复制代码">
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  </button>
                </div>
                <pre className="overflow-x-auto p-4 text-sm leading-7 text-zinc-300"><code>{`from graphrag.query import GraphQueryEngine
from graphrag.index import build_graph_index

# 1. 构建图谱索引（在后台发生）
graph_index = build_graph_index(
    documents=corpus,
    llm_extractor=GPT4oExtractor()
)

# 2. 初始化查询引擎
engine = GraphQueryEngine(index=graph_index)

# 3. 执行全局上下文感知查询
response = engine.query(
    "总结本项目中涉及的所有安全协议，并说明它们之间的依赖关系。"
)
print(response.synthesized_answer)`}</code></pre>
              </div>

              <p>这种架构的优势在于，当面对宏观的、全局性的问题（例如“总结这段历史时期的主要矛盾”），系统不再是盲目地抽取几块文本，而是基于预先构建的社区图谱生成高维度的摘要。</p>

              <blockquote className="rounded-r-xl border-l-4 border-[#7aa2ff] bg-[#1a1e2d] px-5 py-4 italic text-zinc-300">“The future of AI is not just about retrieving information, but understanding the interconnectedness of that information within a broader context.”</blockquote>
            </section>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 border-t border-white/8 pt-6 max-w-[840px]">
            {articleTags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/8 bg-white/3 px-4 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-white/15 hover:bg-white/5 hover:text-[#b8c9ff]">#{tag}</span>
            ))}
          </div>

          <section className="mt-12 max-w-[840px]">
            <h3 className="text-2xl font-semibold text-zinc-50">评论 ({readingStats.comments})</h3>
            <div className="mt-6 rounded-2xl border border-white/8 bg-white/3 p-5 backdrop-blur-xl">
              {currentUser ? (
                <div className="flex gap-4">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                    <img src={currentUser.avatarUrl} alt={currentUser.avatarLabel} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                      rows={4}
                      placeholder={canComment ? "分享你的想法..." : "你当前没有发言权限"}
                      disabled={!canComment}
                      className="w-full resize-none rounded-xl border border-white/8 bg-[#181a20] px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-500 focus:border-[#7aa2ff]/50 focus:ring-1 focus:ring-[#7aa2ff]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <div className="mt-3 flex justify-end">
                      <button disabled={!canComment} className="rounded-lg bg-[#7aa2ff] px-4 py-2 text-sm font-medium text-[#10131a] transition hover:bg-[#8db1ff] disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-400">发布评论</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-[#181a20] px-5 py-6 text-center text-sm text-zinc-400">登录后发表评论</div>
              )}
            </div>

            <div className="mt-8 space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-4">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800 text-sm font-semibold text-zinc-200"><div className="flex h-full w-full items-center justify-center">{comment.avatarText}</div></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm"><span className="font-medium text-zinc-100">{comment.author}</span><span className="text-xs text-zinc-500">{comment.time}</span></div>
                      <p className="mt-2 text-sm leading-7 text-zinc-400">{comment.content}</p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                        <button className="flex items-center gap-1 transition hover:text-[#b8c9ff]"><span className="material-symbols-outlined text-[16px]">thumb_up</span>{comment.likes}</button>
                        <button className="flex items-center gap-1 transition hover:text-zinc-300"><span className="material-symbols-outlined text-[16px]">reply</span>回复</button>
                      </div>
                    </div>
                  </div>
                  {comment.replies?.length ? (
                    <div className="ml-14 space-y-4 border-l border-white/8 pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-4 rounded-xl bg-white/3 p-4">
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800 text-sm font-semibold text-zinc-200"><div className="flex h-full w-full items-center justify-center">{reply.avatarText}</div></div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-sm"><span className="font-medium text-zinc-100">{reply.author}</span><span className="text-xs text-zinc-500">回复 {reply.replyTo}</span><span className="text-xs text-zinc-500">{reply.time}</span></div>
                            <p className="mt-2 text-sm leading-7 text-zinc-400">{reply.content}</p>
                            <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                              <button className="flex items-center gap-1 transition hover:text-[#b8c9ff]"><span className="material-symbols-outlined text-[16px]">thumb_up</span>{reply.likes}</button>
                              <button className="flex items-center gap-1 transition hover:text-zinc-300"><span className="material-symbols-outlined text-[16px]">reply</span>回复</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </article>

        <aside className="pointer-events-none fixed left-6 top-1/2 z-20 hidden -translate-y-1/2 lg:block xl:left-[max(24px,calc((100vw-1600px)/2+24px))]">
          <div className="pointer-events-auto flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-white/3 px-3 py-4 backdrop-blur-xl">
            <button className="relative flex h-12 w-12 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/5 hover:text-[#b8c9ff]" aria-label="点赞文章">
              <span className="material-symbols-outlined text-[24px]">favorite</span>
              <span className="absolute right-0 top-0 rounded-full border border-white/10 bg-[#1e2026] px-1.5 py-0.5 text-[10px] font-semibold text-zinc-100">{readingStats.likes}</span>
            </button>
            <button className="relative flex h-12 w-12 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/5 hover:text-[#b8c9ff]" aria-label="评论文章">
              <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
              <span className="absolute right-0 top-0 rounded-full border border-white/10 bg-[#1e2026] px-1.5 py-0.5 text-[10px] font-semibold text-zinc-100">{readingStats.comments}</span>
            </button>
            <button className="flex h-12 w-12 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/5 hover:text-[#b8c9ff]" aria-label="收藏文章"><span className="material-symbols-outlined text-[24px]">bookmark</span></button>
            <button className="flex h-12 w-12 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/5 hover:text-[#b8c9ff]" aria-label="分享文章"><span className="material-symbols-outlined text-[24px]">share</span></button>
          </div>
        </aside>

        <aside className="pointer-events-none fixed right-6 top-1/2 z-20 hidden -translate-y-1/2 lg:block xl:right-[max(24px,calc((100vw-1600px)/2+24px))]">
          <div className="pointer-events-auto rounded-2xl border border-white/8 bg-white/3 p-5 backdrop-blur-xl">
            <h4 className="text-center text-xl font-semibold text-zinc-100">目录</h4>
            <nav className="mt-5 border-l border-white/8 pl-3">
              <ul className="space-y-2 text-sm text-zinc-400">
                {articleToc.map((item) => (
                  <li key={item.id} className={item.level > 0 ? "pl-4 text-xs" : ""}>
                    <a href={`#${item.id}`} className="block truncate border-l border-transparent py-1.5 transition hover:border-[#7aa2ff] hover:text-[#b8c9ff]">{item.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
      </main>

      <SiteFooter />
      <AuthModal isOpen={authOpen} initialMode={authEntry} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
