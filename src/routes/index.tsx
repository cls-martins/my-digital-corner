import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="flex min-h-[90vh] flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl md:text-7xl font-bold tracking-tighter">
        My Digital Corner
      </h1>
      <p className="mt-6 text-2xl text-zinc-400">
        Seu canto digital está funcionando! 🚀
      </p>
    </div>
  )
}
