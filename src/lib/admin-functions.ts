import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ADMIN_PASSWORD = "admin@martins#";

function checkPassword(password: string) {
  if (password !== ADMIN_PASSWORD) {
    throw new Error("Senha incorreta");
  }
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    return { ok: true };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; patch: Record<string, unknown> }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const { data: existing } = await supabaseAdmin.from("profile").select("id").limit(1).single();
    if (!existing) throw new Error("Profile not found");
    const { error } = await supabaseAdmin.from("profile").update(data.patch).eq("id", existing.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertLink = createServerFn({ method: "POST" })
  .inputValidator((d: {
    password: string;
    link: { id?: string; label: string; url: string; icon: string; type: string; position: number };
  }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    if (data.link.id) {
      const { error } = await supabaseAdmin.from("links").update({
        label: data.link.label, url: data.link.url, icon: data.link.icon,
        type: data.link.type, position: data.link.position,
      }).eq("id", data.link.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("links").insert({
        label: data.link.label, url: data.link.url, icon: data.link.icon,
        type: data.link.type, position: data.link.position,
      });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteLink = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const { error } = await supabaseAdmin.from("links").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteComment = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const { error } = await supabaseAdmin.from("comments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const uploadMedia = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; filename: string; contentBase64: string; contentType: string }) => d)
  .handler(async ({ data }) => {
    checkPassword(data.password);
    const buf = Buffer.from(data.contentBase64, "base64");
    if (buf.length > 25 * 1024 * 1024) throw new Error("Arquivo maior que 25MB");
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}-${safe}`;
    const { error } = await supabaseAdmin.storage.from("media").upload(path, buf, {
      contentType: data.contentType, upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data: pub } = supabaseAdmin.storage.from("media").getPublicUrl(path);
    return { url: pub.publicUrl };
  });
