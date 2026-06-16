// Admin API edge function. Single endpoint with `action` discriminator.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_PASSWORD = "admin@martins#";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function check(password: string) {
  if (password !== ADMIN_PASSWORD) throw new Error("Senha incorreta");
}

function decodeBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const body = await req.json();
    const { action, password } = body ?? {};
    if (typeof password !== "string") throw new Error("Senha obrigatória");

    switch (action) {
      case "login": {
        check(password);
        return json({ ok: true });
      }
      case "updateProfile": {
        check(password);
        const { patch } = body;
        const { data: existing } = await supabase
          .from("profile").select("id").limit(1).single();
        if (!existing) throw new Error("Profile not found");
        const { error } = await supabase
          .from("profile").update(patch).eq("id", existing.id);
        if (error) throw new Error(error.message);
        return json({ ok: true });
      }
      case "upsertLink": {
        check(password);
        const { link } = body;
        if (link.id) {
          const { error } = await supabase.from("links").update({
            label: link.label, url: link.url, icon: link.icon,
            type: link.type, position: link.position,
          }).eq("id", link.id);
          if (error) throw new Error(error.message);
        } else {
          const { error } = await supabase.from("links").insert({
            label: link.label, url: link.url, icon: link.icon,
            type: link.type, position: link.position,
          });
          if (error) throw new Error(error.message);
        }
        return json({ ok: true });
      }
      case "deleteLink": {
        check(password);
        const { error } = await supabase.from("links").delete().eq("id", body.id);
        if (error) throw new Error(error.message);
        return json({ ok: true });
      }
      case "deleteComment": {
        check(password);
        const { error } = await supabase.from("comments").delete().eq("id", body.id);
        if (error) throw new Error(error.message);
        return json({ ok: true });
      }
      case "replyComment": {
        check(password);
        const { parent_id, nickname, message } = body;
        if (!parent_id || !nickname || !message) throw new Error("dados incompletos");
        const { error } = await supabase.from("comments").insert({
          parent_id, nickname, message, is_author: true,
        });
        if (error) throw new Error(error.message);
        return json({ ok: true });
      }
      case "editComment": {
        check(password);
        const { id, message } = body;
        const { error } = await supabase.from("comments")
          .update({ message }).eq("id", id).eq("is_author", true);
        if (error) throw new Error(error.message);
        return json({ ok: true });
      }
      case "setPinnedComment": {
        check(password);
        const id = body.id ? String(body.id) : null;
        const { error: clearError } = await supabase.from("comments").update({ is_pinned: false }).eq("is_pinned", true);
        if (clearError) throw new Error(clearError.message);
        if (id) {
          const { error } = await supabase.from("comments").update({ is_pinned: true }).eq("id", id);
          if (error) throw new Error(error.message);
        }
        return json({ ok: true });
      }
      case "createPost": {
        check(password);
        const { type, content, media_url } = body;
        const { error } = await supabase.from("posts").insert({
          type: type || "text",
          content: content || null,
          media_url: media_url || null,
        });
        if (error) throw new Error(error.message);
        return json({ ok: true });
      }
      case "updatePost": {
        check(password);
        const { id, content, media_url } = body;
        const patch: Record<string, unknown> = {};
        if (content !== undefined) patch.content = content;
        if (media_url !== undefined) patch.media_url = media_url;
        const { error } = await supabase.from("posts").update(patch).eq("id", id);
        if (error) throw new Error(error.message);
        return json({ ok: true });
      }
      case "deletePost": {
        check(password);
        const { error } = await supabase.from("posts").delete().eq("id", body.id);
        if (error) throw new Error(error.message);
        return json({ ok: true });
      }
      case "signUploadUrl": {
        check(password);
        const { filename } = body;
        const safe = String(filename || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${Date.now()}-${safe}`;
        const { data, error } = await supabase.storage.from("media").createSignedUploadUrl(path);
        if (error) throw new Error(error.message);
        const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
        return json({ path: data.path, token: data.token, publicUrl: pub.publicUrl });
      }
      case "uploadMedia": {
        check(password);
        const { filename, contentBase64, contentType } = body;
        const bytes = decodeBase64(contentBase64);
        if (bytes.length > 25 * 1024 * 1024) throw new Error("Arquivo maior que 25MB");
        const safe = String(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${Date.now()}-${safe}`;
        const { error } = await supabase.storage.from("media").upload(path, bytes, {
          contentType: contentType || "application/octet-stream",
          upsert: false,
        });
        if (error) throw new Error(error.message);
        const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
        return json({ url: pub.publicUrl });
      }
      default:
        return json({ error: "Ação desconhecida" }, 400);
    }
  } catch (e) {
    return json({ error: (e as Error).message || "erro" }, 400);
  }
});
