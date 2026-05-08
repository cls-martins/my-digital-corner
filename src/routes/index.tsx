import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ 
  component: Index,
})

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
