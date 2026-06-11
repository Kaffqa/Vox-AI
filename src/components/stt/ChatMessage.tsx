import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isAssistant = role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 w-full ${isAssistant ? "" : "flex-row-reverse"}`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
          isAssistant
            ? "bg-gradient-to-br from-cyan-400 to-violet-500 text-white"
            : "bg-white/5 text-[--text-secondary] border border-white/10"
        }`}
      >
        {isAssistant ? (
          <Sparkles className="w-4 h-4" />
        ) : (
          <User className="w-4 h-4" />
        )}
      </div>

      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl ${
          isAssistant
            ? "glass text-[--text-primary] rounded-tl-sm"
            : "bg-[--accent-cyan]/20 border border-[--accent-cyan]/30 text-[--text-primary] rounded-tr-sm"
        }`}
      >
        {isAssistant ? (
          <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-a:text-[--accent-cyan]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        )}
      </div>
    </motion.div>
  );
}
