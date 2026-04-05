import { forwardRef } from "react";

export const AppHeader = forwardRef<HTMLElement>(function AppHeader(_, ref) {
  return (
    <header
      ref={ref}
      className="sticky top-0 z-20 border-b border-zinc-800/50 bg-zinc-950 px-6 py-5 backdrop-blur-md"
    >
      <div className="mx-auto flex w-full max-w-7xl min-[2100px]:max-w-[min(120rem,100%)] flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          AI Debugging Assistant
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
          Paste a stack trace and the related code — get root cause, context,
          and copy-ready fixes.
        </p>
      </div>
    </header>
  );
});
