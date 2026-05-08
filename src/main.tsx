import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter, RootRoute, Route } from '@tanstack/react-router'
import './index.css'

// Root component
function RootComponent() {
  return <div id="app" />
}

// Create root route
const rootRoute = new RootRoute({
  component: RootComponent,
})

// Index route
function Index() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🚀 My Digital Corner
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Bem-vindo ao seu site hospedado na Vercel!
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ TanStack React Start</p>
          <p>✅ TypeScript</p>
          <p>✅ Tailwind CSS</p>
          <p>✅ Vercel Deployment</p>
        </div>
      </div>
    </div>
  )
}

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index,
})

const routeTree = rootRoute.addChildren([indexRoute])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
}
