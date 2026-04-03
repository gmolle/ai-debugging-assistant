function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">
          AI Debugging Assistant
        </h1>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">
        <p className="text-slate-400">
          Form and analysis UI will go here. API base:{" "}
          <code className="rounded bg-slate-900 px-1.5 py-0.5 text-sm">
            {import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"}
          </code>
        </p>
      </main>
    </div>
  );
}

export default App;
