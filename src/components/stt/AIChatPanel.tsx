import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, X, Loader2, Bot } from "lucide-react";
import ChatMessage from "./ChatMessage";
import {
  sendChatMessage,
  type ChatMessage as ChatMessageType,
} from "../../lib/chat";

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  transcriptionText: string;
}

const SUGGESTED_PROMPTS = [
  "Tolong buatkan rangkuman singkat dari teks ini",
  "Apa saja poin-poin penting yang dibahas?",
  "Apakah ada keputusan atau kesimpulan?",
  "Siapa saja yang disebutkan di teks ini?",
];

export default function AIChatPanel({
  isOpen,
  onClose,
  transcriptionText,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Prevent body scroll when panel is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessageType = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const historyToSend = [...messages, userMsg];
      const reply = await sendChatMessage(transcriptionText, historyToSend);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `**Error:** ${error.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Chat Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] xl:w-[450px] z-50 flex flex-col bg-[--bg-secondary] border-l border-white/5 shadow-2xl"
            style={{
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[--text-primary]">AI Assistant</h3>
                  <p className="text-xs text-[--text-secondary]">
                    Ask about your transcription
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 text-[--text-secondary] hover:text-[--text-primary] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                  <Bot className="w-16 h-16 text-[--accent-cyan] mb-4 opacity-50" />
                  <p className="text-[--text-primary] font-medium mb-2">
                    How can I help you?
                  </p>
                  <p className="text-sm text-[--text-secondary] max-w-[250px]">
                    Ask me anything about the transcribed text. I can summarize,
                    extract key points, and more.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <ChatMessage
                    key={idx}
                    role={msg.role}
                    content={msg.content}
                  />
                ))
              )}

              {isLoading && (
                <div className="flex gap-3 w-full">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-cyan-400 to-violet-500 text-white">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-[--text-secondary] rounded-tl-sm flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            {messages.length === 0 && (
              <div className="px-6 pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-cyan-300 hover:text-cyan-200 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-[--bg-secondary] border-t border-white/5">
              <div className="relative flex items-end glass rounded-2xl p-2 focus-within:border-[--accent-cyan]/50 focus-within:bg-white/5 transition-colors shadow-inner">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  className="w-full bg-transparent border-none outline-none text-sm text-[--text-primary] placeholder:text-[--text-muted] resize-none min-h-[44px] max-h-32 p-3 pb-2"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white disabled:opacity-50 disabled:grayscale transition-all mb-0.5 mr-0.5"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center mt-3">
                <span className="text-[10px] text-[--text-muted]">
                  AI can make mistakes. Verify important info.
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
