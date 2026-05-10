// Admin API edge function — replaces the previous TanStack Start server fns.
// Single endpoint with `action` discriminator. Uses service role to bypass RLS.
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
