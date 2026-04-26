import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CommentRow } from "@/lib/types";
import { Send, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function CommentsBox() {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setComments(data as CommentRow[]);
    };
    load();
    const channel = supabase
      .channel("comments-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments" },
        (payload) => setComments((prev) => [payload.new as CommentRow, ...prev].slice(0, 50)))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "comments" },
        (payload) => setComments((prev) => prev.filter((c) => c.id !== (payload.old as { id: string }).id)))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const nick = nickname.trim().slice(0, 40);
    const msg = message.trim().slice(0, 500);
    if (!nick || !msg) return;
    setSending(true);
    const { error } = await supabase.from("comments").insert({ nickname: nick, message: msg });
    setSending(false);
    if (error) {
      setError("Não foi possível enviar.");
      return;
    }
    setMessage("");
  };

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4" style={{ color: "var(--neon-primary)" }} />
        <h3 className="text-sm uppercase tracking-[0.2em] font-mono">guestbook</h3>
        <span className="ml-auto text-xs text-muted-foreground">{comments.length}</span>
      </div>

      <form onSubmit={submit} className="space-y-2">
        <div className="flex gap-2">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="seu apelido"
            maxLength={40}
            className="w-32 sm:w-40 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--neon-primary)] transition"
          />
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="deixe uma mensagem…"
            maxLength={500}
            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--neon-primary)] transition"
          />
          <button
            type="submit"
            disabled={sending || !nickname.trim() || !message.trim()}
            className="px-3 rounded-lg neon-border bg-black/40 hover:bg-black/60 disabled:opacity-40 transition"
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </form>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1 -mr-1">
        <AnimatePresence initial={false}>
          {comments.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl border border-white/5 bg-black/20 px-3 py-2"
            >
              <div className="flex items-baseline gap-2 text-xs">
                <span className="font-semibold gradient-text">{c.nickname}</span>
                <span className="text-muted-foreground">{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-sm mt-0.5 break-words">{c.message}</p>
            </motion.div>
          ))}
          {comments.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              ainda sem mensagens. seja a primeira pessoa.
            </p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
