import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          🚀 My Digital Corner
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Bem-vindo! Seu site está rodando na Vercel!
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ React 19</p>
          <p>✅ Vite</p>
          <p>✅ Tailwind CSS</p>
          <p>✅ Vercel Deploy</p>
        </div>
      </div>
    </div>
  )
}

const rootElement = document.getElementById('root')
if (rootElement && !rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
