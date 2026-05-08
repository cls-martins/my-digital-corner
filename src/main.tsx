import { RootRoute, Router } from '@tanstack/react-router'
import RootLayout from './routes/__root'
import IndexRoute from './routes/index'

const rootRoute = new RootRoute({
  component: RootLayout,
})

const indexRoute = new RootRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexRoute,
})

const routeTree = rootRoute.addChildren([indexRoute])

export const router = new Router({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import './index.css'

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
}
