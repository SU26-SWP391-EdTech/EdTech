import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content text-sm text-[#374151] leading-7 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold text-[#111827] mt-6 mb-3">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold text-[#111827] mt-5 mb-2.5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold text-[#111827] mt-4 mb-2">{children}</h3>,
          p: ({ children }) => <p className="my-3">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 my-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 my-3 space-y-1">{children}</ol>,
          blockquote: ({ children }) => <blockquote className="border-l border-[#CBD5E1] pl-4 my-4 text-[#475569]">{children}</blockquote>,
          code: ({ children, className: codeClassName }) => codeClassName ? (
            <code className={`${codeClassName} block overflow-x-auto rounded-lg bg-[#111827] p-4 text-sm text-[#F8FAFC]`}>{children}</code>
          ) : (
            <code className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-[0.9em] text-[#BE123C]">{children}</code>
          ),
          pre: ({ children }) => <pre className="my-4 overflow-x-auto">{children}</pre>,
          a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="font-medium text-[#2563EB] underline underline-offset-2">{children}</a>,
          table: ({ children }) => <div className="my-4 overflow-x-auto"><table className="w-full border-collapse text-left">{children}</table></div>,
          th: ({ children }) => <th className="border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 font-semibold">{children}</th>,
          td: ({ children }) => <td className="border border-[#CBD5E1] px-3 py-2">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}