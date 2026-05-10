// Pure-client admin API wrappers — call the `admin-api` Supabase Edge Function.
// Signatures kept identical to the previous server-fn versions so the UI
// can keep calling them as `adminLogin({ data: { ... } })`.
import { supabase } from "@/integrations/supabase/client";

async function call<T = unknown>(action: string, payload: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-api", {
    body: { action, ...payload },
  });
  if (error) throw new Error(error.message || "Falha na requisição");
  if (data && (data as { error?: string }).error) {
    throw new Error((data as { error: string }).error);
  }
  return data as T;
}

export const adminLogin = ({ data }: { data: { password: string } }) =>
  call<{ ok: true }>("login", { password: data.password });

export const updateProfile = ({ data }: { data: { password: string; patch: Record<string, unknown> } }) =>
  call<{ ok: true }>("updateProfile", { password: data.password, patch: data.patch });

export const upsertLink = ({
  data,
}: {
  data: {
    password: string;
    link: { id?: string; label: string; url: string; icon: string; type: string; position: number };
  };
}) => call<{ ok: true }>("upsertLink", { password: data.password, link: data.link });

export const deleteLink = ({ data }: { data: { password: string; id: string } }) =>
  call<{ ok: true }>("deleteLink", { password: data.password, id: data.id });

export const deleteComment = ({ data }: { data: { password: string; id: string } }) =>
  call<{ ok: true }>("deleteComment", { password: data.password, id: data.id });

export const uploadMedia = ({
  data,
}: {
  data: { password: string; filename: string; contentBase64: string; contentType: string };
}) =>
  call<{ url: string }>("uploadMedia", {
    password: data.password,
    filename: data.filename,
    contentBase64: data.contentBase64,
    contentType: data.contentType,
  });
