export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl md:text-7xl font-bold tracking-tighter">
        My Digital Corner
      </h1>
      <p className="mt-6 text-2xl text-zinc-400">
        Seu canto digital está funcionando! 🚀
      </p>
      <a
        href="/admin"
        className="mt-8 text-sm text-zinc-500 hover:text-zinc-300 underline"
      >
        admin
      </a>
    </div>
  );
}
