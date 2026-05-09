import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "carlos martins" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: () => (
    <div style={{ padding: 24, color: "#fff", background: "#070014", minHeight: "100vh" }}>
      <h1>404</h1>
      <a href="/" style={{ color: "#9af" }}>voltar</a>
    </div>
  ),
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
