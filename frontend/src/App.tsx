import { AnalysisOutputSection } from "./components/AnalysisOutputSection";
import { AnalyzeErrorBanner } from "./components/AnalyzeErrorBanner";
import { AnalyzeInputSection } from "./components/AnalyzeInputSection";
import { AppHeader } from "./components/AppHeader";
import { HistorySidebar } from "./components/HistorySidebar";
import { useAiDebuggingApp } from "./hooks/useAiDebuggingApp";

export default function App() {
  const {
    shellRef,
    headerRef,
    liveRegionMessage,
    onSubmit,
    inputSectionProps,
    analyzeError,
    onUseSuggestedLanguage,
    result,
    language,
    historySidebarProps,
  } = useAiDebuggingApp();

  return (
    <div
      ref={shellRef}
      className="min-h-screen bg-zinc-950 bg-[radial-gradient(ellipse_120%_50%_at_50%_-5%,rgb(245_158_11_/_0.075),transparent_55%)] bg-fixed text-zinc-100"
    >
      <AppHeader ref={headerRef} />

      <div className="mx-auto grid w-full max-w-7xl min-[2100px]:max-w-[min(120rem,calc(100%-3rem))] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_22rem] min-[2100px]:grid-cols-[minmax(0,1fr)_26rem] min-[2600px]:grid-cols-[minmax(0,1fr)_30rem]">
        <main className="min-w-0 px-6 py-10 xl:min-h-0 xl:pl-0 xl:pr-6">
          <form onSubmit={onSubmit}>
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {liveRegionMessage}
            </p>
            <div className="flex flex-col gap-10">
              <AnalyzeInputSection {...inputSectionProps} />

              {analyzeError != null && (
                <AnalyzeErrorBanner
                  message={analyzeError.message}
                  suggestedLanguage={analyzeError.suggestedLanguage}
                  onUseSuggestedLanguage={onUseSuggestedLanguage}
                />
              )}

              {result != null && (
                <AnalysisOutputSection result={result} language={language} />
              )}
            </div>
          </form>
        </main>

        <HistorySidebar {...historySidebarProps} />
      </div>
    </div>
  );
}
