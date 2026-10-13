import { useState } from "react";
import { useDataset } from "@/hooks/useDataset";
import { Explore } from "@/sections/Explore";
import { Leaderboard } from "@/sections/Leaderboard";
import { ModelsSection, LiveCompareDialog } from "@/sections/Models";
import { Methodology } from "@/sections/Methodology";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, Compass, BarChart3, Cpu, BookOpen } from "lucide-react";
import type { Statement } from "@/types";

type Tab = "explore" | "leaderboard" | "models" | "method";

export default function Home() {
  const ds = useDataset();
  const [tab, setTab] = useState<Tab>("explore");
  const [liveStatement, setLiveStatement] = useState<Statement | null>(null);

  if (ds.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Failed to load the dataset</p>
          <p className="text-sm text-muted-foreground">{ds.error}</p>
        </div>
      </div>
    );
  }
  if (!ds.dataset) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading 400 statements…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/60 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold leading-tight">Opinion Lab</div>
            <div className="text-[11px] text-muted-foreground leading-tight hidden sm:block">
              Dietary Supplement Opinion Lab
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:inline-flex">
              400 statements · 10 LLMs
            </Badge>
            {ds.unratedCount > 0 ? (
              <Badge variant="secondary">{ds.unratedCount} unrated</Badge>
            ) : (
              <Badge className="bg-emerald-600">All rated</Badge>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-emerald-50 to-background dark:from-emerald-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Explore evidence. Form your opinion. Compare AI perspectives.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Read a statement about dietary supplements, check its scientific source, and rate your own
            agreement — then see how ten frontier LLMs rated the same statement and where each
            model's tendencies lie.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => setTab("explore")}>
              <Compass className="mr-2 h-4 w-4" /> Start rating statements
            </Button>
            <Button variant="outline" onClick={() => setTab("leaderboard")}>
              <BarChart3 className="mr-2 h-4 w-4" /> See the leaderboard
            </Button>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="mb-6">
            <TabsTrigger value="explore"><Compass className="mr-1.5 h-4 w-4" />Explore &amp; Rate</TabsTrigger>
            <TabsTrigger value="leaderboard"><BarChart3 className="mr-1.5 h-4 w-4" />Leaderboard</TabsTrigger>
            <TabsTrigger value="models"><Cpu className="mr-1.5 h-4 w-4" />Models</TabsTrigger>
            <TabsTrigger value="method"><BookOpen className="mr-1.5 h-4 w-4" />Methodology</TabsTrigger>
          </TabsList>

          <TabsContent value="explore">
            <Explore ds={ds} onOpenLive={setLiveStatement} />
          </TabsContent>
          <TabsContent value="leaderboard">
            <Leaderboard ds={ds} />
          </TabsContent>
          <TabsContent value="models">
            <ModelsSection ds={ds} />
          </TabsContent>
          <TabsContent value="method">
            <Methodology />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Dietary Supplement Opinion Lab · built from the CS-490 master's project by Hamdam Aynazarov · for research
        and education only
      </footer>

      <LiveCompareDialog ds={ds} statement={liveStatement} onClose={() => setLiveStatement(null)} />
    </div>
  );
}
