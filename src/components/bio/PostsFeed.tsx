import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PostRow } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper } from "lucide-react";

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function PostsFeed() {
  const [posts, setPosts] = useState<PostRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("posts").select("*").order("created_at", { ascending: false }).limit(30);
      if (data) setPosts(data as PostRow[]);
    };
    load();
    const ch = supabase
      .channel("posts-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  if (posts.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Newspaper className="h-4 w-4" style={{ color: "var(--neon-primary)" }} />
        <h3 className="text-sm uppercase tracking-[0.2em] font-mono">posts</h3>
        <span className="ml-auto text-xs text-muted-foreground">{posts.length}</span>
      </div>
      <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1 -mr-1">
        <AnimatePresence initial={false}>
          {posts.map((p) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-2"
            >
              {p.type === "image" && p.media_url && (
                <img src={p.media_url} alt="" className="w-full rounded-lg object-cover max-h-80" />
              )}
              {p.type === "video" && p.media_url && (
                <video src={p.media_url} controls playsInline className="w-full rounded-lg max-h-80" />
              )}
              {p.content && (
                <p className="text-sm text-white/90 whitespace-pre-wrap break-words">{p.content}</p>
              )}
              <p className="text-[10px] font-mono text-muted-foreground">{timeAgo(p.created_at)}</p>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
