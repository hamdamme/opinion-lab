import { useState } from "react";
import { useDataset } from "@/hooks/useDataset";
import { Ritual } from "@/sections/Ritual";
import { Insights } from "@/sections/Insights";
import { About } from "@/sections/About";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, Compass, BarChart3, BookOpen } from "lucide-react";

type Tab = "explore" | "insights" | "about";

export default function Home() {
  const ds = useDataset();
  const [tab, setTab] = useState<Tab>("explore");

  if (ds.error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="space-y-2 text-center">
          <p className="text-lg font-semibold">Failed to load the dataset</p>
          <p className="text-sm text-muted-foreground">{ds.error}</p>
        </div>
      </div>
    );
  }
  if (!ds.dataset) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  const rated = Object.keys(ds.answers).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Pill className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold">Opinion Lab</div>
              <div className="hidden text-[10px] text-muted-foreground sm:block">
                Explore evidence. Form your opinion. Compare AI perspectives.
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block" title="Statements you have rated">
              <div className="text-[11px] font-semibold tabular-nums">
                {rated}
                <span className="text-muted-foreground"> / {ds.dataset.statements.length}</span>
              </div>
              <div className="mt-0.5 h-1 w-16 overflow-hidden rounded bg-muted">
                <div
                  className="h-1 rounded bg-emerald-600 transition-all"
                  style={{ width: `${Math.min(100, (rated / ds.dataset.statements.length) * 100)}%` }}
                />
              </div>
            </div>
            <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
              <TabsList>
                <TabsTrigger value="explore"><Compass className="mr-1.5 h-4 w-4" /><span className="hidden sm:inline">Explore</span></TabsTrigger>
                <TabsTrigger value="insights"><BarChart3 className="mr-1.5 h-4 w-4" /><span className="hidden sm:inline">Insights</span></TabsTrigger>
                <TabsTrigger value="about"><BookOpen className="mr-1.5 h-4 w-4" /><span className="hidden sm:inline">About</span></TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsContent value="explore"><Ritual ds={ds} /></TabsContent>
          <TabsContent value="insights"><Insights ds={ds} /></TabsContent>
          <TabsContent value="about"><About /></TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-5 text-center text-xs text-muted-foreground">
        {rated > 0 && <span className="mr-2">You have rated {rated} statement{rated === 1 ? "" : "s"}.</span>}
        Research and education only, not medical or nutritional advice.
      </footer>
    </div>
  );
}
