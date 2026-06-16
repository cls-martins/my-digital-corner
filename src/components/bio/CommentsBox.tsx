import { useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CommentRow } from "@/lib/types";
import { Send, MessageSquare, Reply, Pencil, Check, X, ShieldCheck, Pin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { replyComment, editComment } from "@/lib/admin-functions";

const ADMIN_PWD_KEY = "bio_admin_pwd";
const ADMIN_NICK = "martins";

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
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMsg, setEditMsg] = useState("");

  const adminPwd = typeof window !== "undefined" ? sessionStorage.getItem(ADMIN_PWD_KEY) : null;
  const isAdmin = !!adminPwd;

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("comments").select("*").order("created_at", { ascending: false }).limit(200);
      if (data) setComments(data as CommentRow[]);
    };
    load();
    const channel = supabase
      .channel("comments-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const { roots, repliesByParent } = useMemo(() => {
    const roots: CommentRow[] = [];
    const map: Record<string, CommentRow[]> = {};
    const sorted = [...comments].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    for (const c of sorted) {
      if (c.parent_id) {
        (map[c.parent_id] ||= []).push(c);
      } else {
        roots.push(c);
      }
    }
    roots.reverse();
    roots.sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned));
    return { roots, repliesByParent: map };
  }, [comments]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const nick = nickname.trim().slice(0, 40);
    const msg = message.trim().slice(0, 500);
    if (!nick || !msg) return;
    setSending(true);
    const { error } = await supabase.from("comments").insert({ nickname: nick, message: msg });
    setSending(false);
    if (error) return setError("Não foi possível enviar.");
    setMessage("");
  };

  const sendReply = async (parentId: string) => {
    if (!adminPwd || !replyMsg.trim()) return;
    try {
      await replyComment({ data: { password: adminPwd, parent_id: parentId, nickname: ADMIN_NICK, message: replyMsg.trim().slice(0, 500) } });
      setReplyMsg(""); setReplyTo(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const saveEdit = async (id: string) => {
    if (!adminPwd || !editMsg.trim()) return;
    try {
      await editComment({ data: { password: adminPwd, id, message: editMsg.trim().slice(0, 500) } });
      setEditingId(null); setEditMsg("");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4" style={{ color: "var(--neon-primary)" }} />
        <h3 className="text-sm uppercase tracking-[0.2em] font-mono">Comentários</h3>
        <span className="ml-auto text-xs text-muted-foreground">{comments.length}</span>
      </div>

      <form onSubmit={submit} className="space-y-2">
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="seu apelido"
          maxLength={40}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--neon-primary)] transition"
        />
        <div className="flex gap-2 min-w-0">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="deixe uma mensagem…"
            maxLength={500}
            className="flex-1 min-w-0 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--neon-primary)] transition"
          />
          <button
            type="submit"
            disabled={sending || !nickname.trim() || !message.trim()}
            className="shrink-0 h-9 w-9 grid place-items-center rounded-lg neon-border bg-black/40 hover:bg-black/60 disabled:opacity-40 transition"
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </form>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-1 -mr-1">
        <AnimatePresence initial={false}>
          {roots.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-white/5 bg-black/20 px-3 py-2 space-y-2"
            >
              <CommentItem
                c={c}
                isAdmin={isAdmin}
                editingId={editingId}
                editMsg={editMsg}
                setEditingId={setEditingId}
                setEditMsg={setEditMsg}
                saveEdit={saveEdit}
                onReply={() => { setReplyTo(c.id); setReplyMsg(""); }}
              />

              {repliesByParent[c.id]?.map((r) => (
                <div key={r.id} className="ml-3 pl-3 border-l border-white/10">
                  <CommentItem
                    c={r}
                    isAdmin={isAdmin}
                    editingId={editingId}
                    editMsg={editMsg}
                    setEditingId={setEditingId}
                    setEditMsg={setEditMsg}
                    saveEdit={saveEdit}
                  />
                </div>
              ))}

              {isAdmin && replyTo === c.id && (
                <div className="ml-3 pl-3 border-l border-white/10 flex gap-2">
                  <input
                    autoFocus
                    value={replyMsg}
                    onChange={(e) => setReplyMsg(e.target.value)}
                    placeholder="responder como autor…"
                    maxLength={500}
                    className="flex-1 min-w-0 bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--neon-primary)]"
                  />
                  <button onClick={() => sendReply(c.id)} className="h-7 w-7 grid place-items-center rounded-lg neon-border bg-black/40">
                    <Send className="h-3 w-3" />
                  </button>
                  <button onClick={() => setReplyTo(null)} className="h-7 w-7 grid place-items-center rounded-lg border border-white/10">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
          {roots.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              ainda sem mensagens. seja a primeira pessoa.
            </p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CommentItem({
  c, isAdmin, editingId, editMsg, setEditingId, setEditMsg, saveEdit, onReply,
}: {
  c: CommentRow;
  isAdmin: boolean;
  editingId: string | null;
  editMsg: string;
  setEditingId: (v: string | null) => void;
  setEditMsg: (v: string) => void;
  saveEdit: (id: string) => void;
  onReply?: () => void;
}) {
  const editing = editingId === c.id;
  return (
    <div>
      <div className="flex items-baseline gap-2 text-xs">
        <span className={`font-semibold ${c.is_author ? "" : "gradient-text"}`} style={c.is_author ? { color: "var(--neon-primary)" } : undefined}>
          {c.nickname}
        </span>
        {c.is_author && (
          <span className="inline-flex items-center gap-0.5 text-[9px] uppercase tracking-wider px-1 py-0.5 rounded border border-[var(--neon-primary)]/40 text-[var(--neon-primary)]">
            <ShieldCheck className="h-2.5 w-2.5" /> autor
          </span>
        )}
        {c.is_pinned && (
          <span className="inline-flex items-center gap-0.5 text-[9px] uppercase tracking-wider px-1 py-0.5 rounded border border-[var(--neon-accent)]/40 text-[var(--neon-accent)]">
            <Pin className="h-2.5 w-2.5" /> fixado
          </span>
        )}
        <span className="text-muted-foreground">{timeAgo(c.created_at)}</span>
        {isAdmin && (
          <span className="ml-auto flex items-center gap-1">
            {onReply && (
              <button onClick={onReply} className="text-muted-foreground hover:text-foreground" aria-label="Responder">
                <Reply className="h-3 w-3" />
              </button>
            )}
            {c.is_author && !editing && (
              <button onClick={() => { setEditingId(c.id); setEditMsg(c.message); }} className="text-muted-foreground hover:text-foreground" aria-label="Editar">
                <Pencil className="h-3 w-3" />
              </button>
            )}
          </span>
        )}
      </div>
      {editing ? (
        <div className="mt-1 flex gap-1">
          <input
            value={editMsg}
            onChange={(e) => setEditMsg(e.target.value)}
            className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1 text-xs"
          />
          <button onClick={() => saveEdit(c.id)} className="h-6 w-6 grid place-items-center rounded border border-white/10"><Check className="h-3 w-3" /></button>
          <button onClick={() => setEditingId(null)} className="h-6 w-6 grid place-items-center rounded border border-white/10"><X className="h-3 w-3" /></button>
        </div>
      ) : (
        <p className="text-sm mt-0.5 break-words">{c.message}</p>
      )}
    </div>
  );
}
