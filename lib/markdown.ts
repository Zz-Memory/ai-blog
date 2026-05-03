// Shared Markdown-to-HTML preview helper.
// Keep this in sync with the editor preview and seed-generated HTML.
export function toPreviewHtml(markdown: string) {
  return markdown
    // 1. 基础 XSS 转义 (必须在最前)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

    // 2. 代码块 (简易处理，不支持语法高亮)
    .replace(/```[\s\S]*?\n([\s\S]*?)```/g, '<pre class="bg-gray-800 text-white p-4 rounded overflow-x-auto mb-4"><code>$1</code></pre>')

    // 3. 行内代码
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-500 rounded px-1">$1</code>')

    // 4. 图片 (必须在链接前)
    .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded my-4" />')

    // 5. 超链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>')

    // 6. 引用块
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 text-gray-600 italic my-4">$1</blockquote>')

    // 7. 标题 1~6 级
    .replace(/^###### (.*$)/gim, '<h6 class="text-base font-semibold mt-4 mb-2">$1</h6>')
    .replace(/^##### (.*$)/gim, '<h5 class="text-lg font-semibold mt-4 mb-2">$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4 class="text-xl font-semibold mt-5 mb-3">$1</h4>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-5 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')

    // 原有逻辑保留...
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n- (.*)/g, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(?!<h1|<h2|<h3|<h4|<h5|<h6|<pre|<blockquote|<img|<a|<li>|<p|<code)/gm, '<p class="mb-4">')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul class="list-disc pl-5 mb-4">$1</ul>')
    .replace(/<p class="mb-4">\s*<h/g, '<h')
    .replace(/<\/li><\/ul>\s*<ul class="list-disc pl-5 mb-4">/g, '')
    // 7. 处理换行，需避开 <pre> 块
    .replace(/(?<!<pre[^>]*>[\s\S]*?)\n/g, '<br/>');
}
