import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileRow, LinkRow, CommentRow, Theme, Badge } from "@/lib/types";
import {
  adminLogin, updateProfile, upsertLink, deleteLink, deleteComment, uploadMedia,
} from "@/lib/admin-functions";
import { ICON_OPTIONS, SocialIcon } from "@/components/bio/SocialIcon";
import { Trash2, Plus, Save, Upload, LogOut, ArrowLeft, Image, Video, Music } from "lucide-react";

const STORAGE_KEY = "bio_admin_pwd";

export default function AdminPage() {
  const [pwd, setPwd] = useState<string>("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "admin";
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPwd(saved);
      setAuthed(true);
    }
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminLogin({ data: { password: pwd } });
      sessionStorage.setItem(STORAGE_KEY, pwd);
      setAuthed(true);
    } catch {
      setError("senha incorreta");
    } finally {
      setLoading(false);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen grid place-items-center px-4" style={{ background: "#070014" }}>
        <form onSubmit={submit} className="w-full max-w-sm glass rounded-2xl p-6 space-y-4">
          <div className="text-center">
            <h1 className="font-cyber text-2xl gradient-text">admin access</h1>
            <p className="text-xs text-muted-foreground mt-1 font-mono">restricted area</p>
          </div>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="senha"
            autoFocus
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--neon-primary)]"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading || !pwd}
            className="w-full neon-border bg-black/40 hover:bg-black/60 rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "verificando…" : "entrar"}
          </button>
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">
            ← voltar para a bio
          </Link>
        </form>
      </div>
    );
  }

  return <AdminDashboard password={pwd} onLogout={() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
    setPwd("");
  }} />;
}

function AdminDashboard({ password, onLogout }: { password: string; onLogout: () => void }) {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [tab, setTab] = useState<"profile" | "theme" | "media" | "links" | "comments">("profile");
  const [savingMsg, setSavingMsg] = useState<string | null>(null);

  const reload = async () => {
    const [{ data: p }, { data: l }, { data: c }] = await Promise.all([
      supabase.from("profile").select("*").limit(1).single(),
      supabase.from("links").select("*").order("position", { ascending: true }),
      supabase.from("comments").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    if (p) setProfile(p as unknown as ProfileRow);
    if (l) setLinks(l as LinkRow[]);
    if (c) setComments(c as CommentRow[]);
  };

  useEffect(() => { reload(); }, []);

  const flash = (m: string) => {
    setSavingMsg(m);
    setTimeout(() => setSavingMsg(null), 1800);
  };

  const saveProfile = async (patch: Partial<ProfileRow>) => {
    try {
      await updateProfile({ data: { password, patch: patch as Record<string, unknown> } });
      flash("salvo ✓");
      await reload();
    } catch (e) {
      flash("erro: " + ((e as Error).message || "falha ao salvar"));
    }
  };

  if (!profile) return <div className="min-h-screen grid place-items-center text-sm">carregando…</div>;

  const tabs: { k: typeof tab; label: string }[] = [
    { k: "profile", label: "perfil" },
    { k: "theme", label: "tema" },
    { k: "media", label: "mídia" },
    { k: "links", label: "links" },
    { k: "comments", label: `comentários (${comments.length})` },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#070014" }}>
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-black/60 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> bio
          </Link>
          <h1 className="font-cyber text-lg gradient-text ml-2">admin panel</h1>
          {savingMsg && <span className="text-xs font-mono text-emerald-400 animate-pulse">{savingMsg}</span>}
          <button onClick={onLogout}
            className="ml-auto text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-destructive/50">
            <LogOut className="h-3.5 w-3.5" /> sair
          </button>
        </div>
        <nav className="max-w-4xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition ${
                tab === t.k ? "bg-[var(--neon-primary)]/20 text-[var(--neon-primary)] border border-[var(--neon-primary)]/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {tab === "profile" && <ProfileTab profile={profile} onSave={saveProfile} />}
        {tab === "theme" && <ThemeTab profile={profile} onSave={saveProfile} />}
        {tab === "media" && <MediaTab profile={profile} password={password} onSave={saveProfile} />}
        {tab === "links" && <LinksTab links={links} password={password} onChange={reload} flash={flash} />}
        {tab === "comments" && <CommentsTab comments={comments} password={password} onChange={reload} flash={flash} />}
      </main>
    </div>
  );
}

function ProfileTab({ profile, onSave }: { profile: ProfileRow; onSave: (p: Partial<ProfileRow>) => Promise<void> }) {
  const [name, setName] = useState(profile.display_name);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio);
  const [badges, setBadges] = useState<Badge[]>(profile.badges || []);
  const [nameStyle, setNameStyle] = useState<NonNullable<ProfileRow["name_style"]>>(profile.name_style || "brackets");

  const NAME_STYLES: { v: string; label: string }[] = [
    { v: "brackets", label: "[B][R][A][C][K][E][T][S]" },
    { v: "neon", label: "NEON GLOW" },
    { v: "glitch", label: "GLITCH RGB" },
    { v: "mono", label: "mono_lower" },
    { v: "gradient", label: "GRADIENT" },
    { v: "outline", label: "OUTLINE" },
    { v: "minimal", label: "Minimal" },
  ];

  return (
    <div className="space-y-4">
      <Section title="identidade">
        <Field label="nome de exibição">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="@ handle">
          <input className={inputCls} value={handle} onChange={(e) => setHandle(e.target.value)} />
        </Field>
        <Field label="bio">
          <textarea rows={4} className={inputCls} value={bio} onChange={(e) => setBio(e.target.value)} />
        </Field>
        <Field label="estilo do nome">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {NAME_STYLES.map((s) => (
              <button
                key={s.v}
                onClick={() => setNameStyle(s.v as NonNullable<ProfileRow["name_style"]>)}
                className={`px-3 py-2 text-xs rounded-lg border transition text-left ${
                  nameStyle === s.v
                    ? "bg-[var(--neon-primary)]/20 border-[var(--neon-primary)]/50 text-[var(--neon-primary)]"
                    : "border-white/10 text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>
        <button className={btnPrimary} onClick={() => onSave({ display_name: name, handle, bio, name_style: nameStyle })}>
          <Save className="h-3.5 w-3.5" /> salvar identidade
        </button>
      </Section>

      <Section title="badges">
        <div className="space-y-2">
          {badges.map((b, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                className={inputCls + " flex-1"}
                value={b.label}
                onChange={(e) => {
                  const c = [...badges]; c[i] = { ...c[i], label: e.target.value }; setBadges(c);
                }}
              />
              <input
                type="color"
                value={b.color}
                onChange={(e) => {
                  const c = [...badges]; c[i] = { ...c[i], color: e.target.value }; setBadges(c);
                }}
                className="h-9 w-12 rounded-lg bg-transparent border border-white/10"
              />
              <button
                onClick={() => setBadges(badges.filter((_, j) => j !== i))}
                className="h-9 w-9 grid place-items-center rounded-lg border border-white/10 hover:border-destructive/50"
                aria-label="Remover">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            className={btnGhost}
            onClick={() => setBadges([...badges, { label: "novo", color: "#a855f7" }])}>
            <Plus className="h-3.5 w-3.5" /> novo badge
          </button>
        </div>
        <button className={btnPrimary} onClick={() => onSave({ badges })}>
          <Save className="h-3.5 w-3.5" /> salvar badges
        </button>
      </Section>
    </div>
  );
}

function ThemeTab({ profile, onSave }: { profile: ProfileRow; onSave: (p: Partial<ProfileRow>) => Promise<void> }) {
  const [theme, setTheme] = useState<Theme>(profile.theme);
  const [entryEffect, setEntryEffect] = useState<NonNullable<ProfileRow["entry_effect"]>>(profile.entry_effect || "fade");
  const fonts = ["Space Grotesk", "JetBrains Mono", "Orbitron", "Inter", "Bebas Neue"];
  const anims = ["glitch", "shimmer", "none"];
  const allFx = ["bigtext", "particles", "grid", "scanlines"];
  const entries: { v: NonNullable<ProfileRow["entry_effect"]>; label: string }[] = [
    { v: "none", label: "nenhum" },
    { v: "fade", label: "fade (rápido)" },
    { v: "click", label: "click to enter" },
    { v: "typewriter", label: "typewriter" },
    { v: "glitch", label: "glitch reveal" },
    { v: "scan", label: "scan line" },
  ];

  const toggleFx = (fx: string) => {
    const set = new Set(theme.effects || []);
    if (set.has(fx)) set.delete(fx); else set.add(fx);
    setTheme({ ...theme, effects: [...set] });
  };

  return (
    <div className="space-y-4">
      <Section title="cores">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["primary", "secondary", "accent", "background"] as const).map((k) => (
            <Field key={k} label={k}>
              <div className="flex gap-2">
                <input type="color" value={theme[k]}
                  onChange={(e) => setTheme({ ...theme, [k]: e.target.value })}
                  className="h-10 w-12 rounded-lg bg-transparent border border-white/10" />
                <input value={theme[k]} onChange={(e) => setTheme({ ...theme, [k]: e.target.value })}
                  className={inputCls + " flex-1"} />
              </div>
            </Field>
          ))}
        </div>
      </Section>

      <Section title="tipografia">
        <Field label="fonte premium">
          <select value={theme.font} onChange={(e) => setTheme({ ...theme, font: e.target.value })} className={inputCls}>
            {fonts.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="animação do nome">
          <select value={theme.textAnimation} onChange={(e) => setTheme({ ...theme, textAnimation: e.target.value as Theme["textAnimation"] })} className={inputCls}>
            {anims.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </Field>
      </Section>

      <Section title="efeito de entrada">
        <Field label="o que aparece quando alguém abre a página">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {entries.map((e) => (
              <button
                key={e.v}
                onClick={() => setEntryEffect(e.v)}
                className={`px-3 py-2 text-xs rounded-lg border transition text-left ${
                  entryEffect === e.v
                    ? "bg-[var(--neon-primary)]/20 border-[var(--neon-primary)]/50 text-[var(--neon-primary)]"
                    : "border-white/10 text-muted-foreground hover:text-foreground"
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      <Section title="efeitos de fundo">
        <Field label="ative os efeitos que quiser">
          <div className="flex flex-wrap gap-2">
            {allFx.map((fx) => {
              const active = fx === "bigtext"
                ? theme.effects?.includes("bigtext") !== false
                : theme.effects?.includes(fx);
              return (
                <button key={fx} onClick={() => toggleFx(fx)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                    active
                      ? "bg-[var(--neon-primary)]/20 border-[var(--neon-primary)]/50 text-[var(--neon-primary)]"
                      : "border-white/10 text-muted-foreground hover:text-foreground"
                  }`}>{fx}</button>
              );
            })}
          </div>
        </Field>
      </Section>

      <button className={btnPrimary} onClick={() => onSave({ theme, entry_effect: entryEffect })}>
        <Save className="h-3.5 w-3.5" /> aplicar tema
      </button>
    </div>
  );
}

function MediaTab({ profile, password, onSave }: { profile: ProfileRow; password: string; onSave: (p: Partial<ProfileRow>) => Promise<void> }) {
  const [audioTitle, setAudioTitle] = useState(profile.audio_title || "");
  const [audioArtist, setAudioArtist] = useState(profile.audio_artist || "");

  return (
    <div className="space-y-4">
      <Section title="avatar">
        <UploadField
          icon={<Image className="h-3.5 w-3.5" />}
          label="imagem do avatar"
          accept="image/*"
          currentUrl={profile.avatar_url}
          password={password}
          onUploaded={(url) => onSave({ avatar_url: url })}
        />
      </Section>

      <Section title="banner do card (topo)">
        <UploadField
          icon={<Image className="h-3.5 w-3.5" />}
          label="imagem do banner"
          accept="image/*"
          currentUrl={profile.banner_url}
          password={password}
          onUploaded={(url) => onSave({ banner_url: url })}
        />
        {profile.banner_url && (
          <button className={btnGhost} onClick={() => onSave({ banner_url: null })}>
            <Trash2 className="h-3.5 w-3.5" /> remover banner
          </button>
        )}
      </Section>

      <Section title="áudio de fundo">
        <UploadField
          icon={<Music className="h-3.5 w-3.5" />}
          label="arquivo de áudio (mp3, ogg…)"
          accept="audio/*"
          currentUrl={profile.audio_url}
          password={password}
          onUploaded={(url) => onSave({ audio_url: url })}
        />
        <Field label="nome da música">
          <input className={inputCls} value={audioTitle} onChange={(e) => setAudioTitle(e.target.value)} />
        </Field>
        <Field label="artista">
          <input className={inputCls} value={audioArtist} onChange={(e) => setAudioArtist(e.target.value)} />
        </Field>
        <button className={btnPrimary}
          onClick={() => onSave({ audio_title: audioTitle, audio_artist: audioArtist })}>
          <Save className="h-3.5 w-3.5" /> salvar info da música
        </button>
      </Section>

      <Section title="vídeo de fundo">
        <UploadField
          icon={<Video className="h-3.5 w-3.5" />}
          label="vídeo (mp4, webm)"
          accept="video/*"
          currentUrl={profile.background_video_url}
          password={password}
          onUploaded={(url) => onSave({ background_video_url: url })}
        />
        {profile.background_video_url && (
          <button className={btnGhost} onClick={() => onSave({ background_video_url: null })}>
            <Trash2 className="h-3.5 w-3.5" /> remover vídeo
          </button>
        )}
      </Section>

      <Section title="imagem de fundo (alternativa ao vídeo)">
        <UploadField
          icon={<Image className="h-3.5 w-3.5" />}
          label="imagem de fundo"
          accept="image/*"
          currentUrl={profile.background_image_url}
          password={password}
          onUploaded={(url) => onSave({ background_image_url: url })}
        />
        {profile.background_image_url && (
          <button className={btnGhost} onClick={() => onSave({ background_image_url: null })}>
            <Trash2 className="h-3.5 w-3.5" /> remover imagem
          </button>
        )}
      </Section>
    </div>
  );
}

function UploadField({ icon, label, accept, currentUrl, password, onUploaded }: {
  icon: React.ReactNode; label: string; accept: string;
  currentUrl: string | null | undefined; password: string;
  onUploaded: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handle = async (file: File) => {
    setErr(null);
    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let bin = "";
      const CHUNK = 0x8000;
      for (let i = 0; i < bytes.length; i += CHUNK) {
        bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK)));
      }
      const b64 = btoa(bin);
      const res = await uploadMedia({
        data: { password, filename: file.name, contentBase64: b64, contentType: file.type || "application/octet-stream" },
      });
      onUploaded(res.url);
    } catch (e) {
      setErr((e as Error).message || "falha ao enviar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      {currentUrl && (
        <div className="text-[10px] font-mono text-muted-foreground truncate">
          atual: {currentUrl}
        </div>
      )}
      <label className={`${btnGhost} cursor-pointer`}>
        <Upload className="h-3.5 w-3.5" />
        {busy ? "enviando…" : "selecionar arquivo"}
        <input type="file" accept={accept} className="hidden"
          onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])} />
      </label>
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}

function LinksTab({ links, password, onChange, flash }: {
  links: LinkRow[]; password: string; onChange: () => Promise<void>; flash: (m: string) => void;
}) {
  const types = ["instagram", "discord", "whatsapp", "threads", "google", "twitter", "youtube", "twitch", "github", "spotify", "custom", "widget"];

  const save = async (l: Partial<LinkRow> & { label: string; url: string; icon: string; type: string; position: number; id?: string }) => {
    await upsertLink({ data: { password, link: l } });
    flash("salvo ✓");
    await onChange();
  };
  const remove = async (id: string) => {
    if (!confirm("remover este link?")) return;
    await deleteLink({ data: { password, id } });
    await onChange();
  };

  return (
    <div className="space-y-3">
      <Section title="adicionar link / widget">
        <NewLinkForm types={types} onAdd={(l) => save({ ...l, position: links.length })} />
      </Section>
      <Section title={`existentes (${links.length})`}>
        <div className="space-y-2">
          {links.map((l) => (
            <LinkRowEdit key={l.id} link={l} types={types}
              onSave={(patch) => save({ ...l, ...patch })}
              onRemove={() => remove(l.id)} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function NewLinkForm({ types, onAdd }: { types: string[]; onAdd: (l: { label: string; url: string; icon: string; type: string }) => void }) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("custom");
  const [icon, setIcon] = useState("link");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <input placeholder="rótulo" className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)} />
      <input placeholder="https://…" className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} />
      <select value={type} onChange={(e) => { setType(e.target.value); setIcon(e.target.value); }} className={inputCls}>
        {types.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <select value={icon} onChange={(e) => setIcon(e.target.value)} className={inputCls}>
        {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
      </select>
      <button
        disabled={!label || !url}
        onClick={() => { onAdd({ label, url, type, icon }); setLabel(""); setUrl(""); }}
        className={btnPrimary + " sm:col-span-2 disabled:opacity-50"}>
        <Plus className="h-3.5 w-3.5" /> adicionar
      </button>
    </div>
  );
}

function LinkRowEdit({ link, types, onSave, onRemove }: {
  link: LinkRow; types: string[];
  onSave: (patch: Partial<LinkRow>) => Promise<void>; onRemove: () => void;
}) {
  const [l, setL] = useState(link);
  const dirty = l.label !== link.label || l.url !== link.url || l.icon !== link.icon || l.type !== link.type || l.position !== link.position;

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <SocialIcon name={l.icon} className="h-4 w-4 text-[var(--neon-primary)]" />
        <input className={inputCls + " flex-1"} value={l.label} onChange={(e) => setL({ ...l, label: e.target.value })} />
        <input type="number" className={inputCls + " w-16"} value={l.position}
          onChange={(e) => setL({ ...l, position: Number(e.target.value) })} />
        <button onClick={onRemove}
          className="h-9 w-9 grid place-items-center rounded-lg border border-white/10 hover:border-destructive/50">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <input className={inputCls} value={l.url} onChange={(e) => setL({ ...l, url: e.target.value })} />
      <div className="flex gap-2">
        <select value={l.type} onChange={(e) => setL({ ...l, type: e.target.value })} className={inputCls + " flex-1"}>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={l.icon} onChange={(e) => setL({ ...l, icon: e.target.value })} className={inputCls + " flex-1"}>
          {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        {dirty && (
          <button onClick={() => onSave(l)} className={btnPrimary}>
            <Save className="h-3.5 w-3.5" /> salvar
          </button>
        )}
      </div>
    </div>
  );
}

function CommentsTab({ comments, password, onChange, flash }: {
  comments: CommentRow[]; password: string; onChange: () => Promise<void>; flash: (m: string) => void;
}) {
  const remove = async (id: string) => {
    if (!confirm("apagar este comentário?")) return;
    await deleteComment({ data: { password, id } });
    flash("removido");
    await onChange();
  };

  return (
    <Section title="comentários públicos">
      <div className="space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs gradient-text font-semibold">{c.nickname}</div>
              <p className="text-sm break-words">{c.message}</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-1">
                {new Date(c.created_at).toLocaleString()}
              </p>
            </div>
            <button onClick={() => remove(c.id)}
              className="h-8 w-8 grid place-items-center rounded-lg border border-white/10 hover:border-destructive/50">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {comments.length === 0 && <p className="text-xs text-muted-foreground">sem comentários ainda.</p>}
      </div>
    </Section>
  );
}

const inputCls = "w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--neon-primary)] transition";
const btnPrimary = "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg neon-border bg-black/40 hover:bg-black/60 text-sm font-medium";
const btnGhost = "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/10 hover:border-[var(--neon-primary)]/50 text-sm";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-4 sm:p-5 space-y-3">
      <h2 className="text-xs uppercase tracking-[0.25em] font-mono text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
