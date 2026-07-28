import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, User, Bot, Loader2, Zap, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Magnetic from "./Magnetic.tsx";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ZenAIChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

const ZenAIChat: React.FC<ZenAIChatProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello ${(currentUser?.name || "there").split(" ")[0]}! I'm ZenAI, your intelligence layer. How can I help you clear the chaos today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ai/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userMessage }),
        }
      );

      if (!response.ok) {
        throw new Error("AI request failed");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.text || "No response" },
      ]);
    } catch (error) {
      console.error("ZenAI Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I encountered an error connecting to my neural core. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-end md:p-6 bg-surface-950/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-xl h-full md:h-[90vh] glass-premium rounded-none md:rounded-[3rem] border border-surface-200 dark:border-white/10 shadow-premium flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-surface-200 dark:border-white/5 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-5">
                <div className={`p-3.5 rounded-2xl text-white shadow-brand transition-all duration-500 ${isTyping ? 'bg-brand-500 animate-pulse-glow' : 'bg-brand-600'}`}>
                  <Zap size={28} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-black tracking-tighter leading-none text-surface-900 dark:text-white">
                    ZenAI Assistant
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isTyping ? 'bg-brand-400 animate-pulse' : 'bg-emerald-500'} shadow-sm`}></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">
                      {isTyping ? 'Processing Data' : 'Intelligence Active'}
                    </span>
                  </div>
                </div>
              </div>
              <Magnetic strength={0.3}>
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-surface-100 dark:hover:bg-white/10 rounded-full transition-all text-surface-500 active:scale-90"
                >
                  <X size={28} />
                </button>
              </Magnetic>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-surface-50/30 dark:bg-black/20"
            >
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 20, stiffness: 150 }}
                    className={`flex gap-5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-premium transition-transform hover:scale-110 duration-500 ${
                        msg.role === "user"
                          ? "bg-surface-900 text-white dark:bg-white dark:text-surface-900"
                          : "bg-brand-600 text-white"
                      }`}
                    >
                      {msg.role === "user" ? <User size={24} /> : <Bot size={24} />}
                    </div>
                    <div
                      className={`max-w-[80%] space-y-1 ${msg.role === "user" ? "text-right" : ""}`}
                    >
                      <div
                        className={`p-5 rounded-[2.5rem] text-[15px] leading-relaxed shadow-sm font-medium transition-all ${
                          msg.role === "user"
                            ? "bg-white dark:bg-surface-800 rounded-tr-none text-surface-900 dark:text-surface-100 border border-surface-100 dark:border-white/5"
                            : "bg-brand-600 text-white rounded-tl-none shadow-brand"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white shadow-brand flex items-center justify-center">
                    <Bot size={24} />
                  </div>
                  <div className="p-5 bg-brand-600 text-white rounded-[2.5rem] rounded-tl-none shadow-brand flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-8 bg-white/50 dark:bg-surface-950 border-t border-surface-200 dark:border-white/5">
              <form onSubmit={handleSend} className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="How can ZenAI help clear the chaos?"
                  disabled={isTyping}
                  className="w-full glass-inset !bg-white dark:!bg-white/5 p-5 pr-16 rounded-[1.5rem] text-sm font-bold outline-none focus:ring-4 focus:ring-brand-500/10 transition-all border-surface-200 dark:border-white/10 shadow-inner"
                />
                <Magnetic strength={0.2}>
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-3 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl transition-all shadow-brand active:scale-95 disabled:opacity-30"
                  >
                    <Send size={20} />
                  </button>
                </Magnetic>
              </form>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                {[
                  { label: "Summarize Chaos", icon: Sparkles },
                  { label: "Brainstorm Goals", icon: Zap },
                  { label: "Refine Roadmap", icon: TrendingUp },
                ].map((action, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInput(action.label)}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-100 dark:bg-white/5 hover:bg-brand-500/10 border border-surface-200 dark:border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-surface-500 hover:text-brand-500 transition-all active:scale-95"
                  >
                    <action.icon size={12} />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ZenAIChat;
