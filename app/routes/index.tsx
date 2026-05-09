import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-8 text-center">
      <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
        My Digital Corner
      </h1>
      <p className="mt-6 text-xl text-zinc-400">
        Seu canto digital está no ar! 🎉
      </p>
    </div>
  )
}
