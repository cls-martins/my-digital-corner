import { createRootRoute } from '@tanstack/react-router'
import { Outlet, ScrollRestoration } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>My Digital Corner</title>
      </head>
      <body className="min-h-screen bg-zinc-950 text-white antialiased">
        <ScrollRestoration />
        <Outlet />
      </body>
    </html>
  )
}
