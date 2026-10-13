import { useMemo, useState } from "react";
import type { DatasetState } from "@/hooks/useDataset";
import type { ReferenceMode } from "@/types";
import { computeStats, pct } from "@/lib/stats";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";

type Category = "all" | "Consumer" | "Professional" | "Positive" | "Negative";

export function Leaderboard({ ds }: { ds: DatasetState }) {
  const { dataset, answers } = ds;
  const [category, setCategory] = useState<Category>("all");
  const [mode, setMode] = useState<ReferenceMode>("study");

  const subset = useMemo(() => {
    if (!dataset) return [];
    return dataset.statements.filter((s) => {
      if (category === "all") return true;
      return s.audience === category || s.bias === category;
    });
  }, [dataset, category]);

  const stats = useMemo(() => {
    if (!dataset) return [];
    return computeStats(
      subset,
      dataset.llms.map((l) => l.name),
      (s) => (mode === "study" ? s.reference : (answers[s.id] ?? null))
    ).sort((a, b) => b.exact - a.exact || a.mae - b.mae);
  }, [dataset, subset, mode, answers]);

  const chartData = useMemo(
    () =>
      stats.map((s) => ({
        name: s.name.replace(/ (Turbo|Mini|Flash|Large|Saba|70B|10B|7B|R1|Deep.*)$/, ""),
        "Exact match": +(s.exact * 100).toFixed(1),
        "Within ±1": +(s.within1 * 100).toFixed(1),
      })),
    [stats]
  );

  const biasChart = useMemo(
    () =>
      [...stats]
        .sort((a, b) => a.bias - b.bias)
        .map((s) => ({
          name: s.name.replace(/ (Turbo|Mini|Flash|Large|Saba|70B|10B|7B|R1|Deep.*)$/, ""),
          "Mean signed error": +s.bias.toFixed(3),
        })),
    [stats]
  );

  if (!dataset) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All 400 statements</SelectItem>
            <SelectItem value="Consumer">Consumer audience</SelectItem>
            <SelectItem value="Professional">Professional audience</SelectItem>
            <SelectItem value="Positive">Pro-supplement bias</SelectItem>
            <SelectItem value="Negative">Anti-supplement bias</SelectItem>
          </SelectContent>
        </Select>
        <Select value={mode} onValueChange={(v) => setMode(v as ReferenceMode)}>
          <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="study">Reference: study rater</SelectItem>
            <SelectItem value="me">Reference: my ratings ({Object.keys(answers).length} rated)</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline">{subset.length} statements in scope</Badge>
      </div>

      {mode === "me" && Object.keys(answers).length === 0 && (
        <p className="text-sm text-amber-600">
          You haven't rated any statements yet — head to Explore first, or switch back to the study rater.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Agreement with reference rater</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} fontSize={11} />
                <YAxis unit="%" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Exact match" fill="#059669" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Within ±1" fill="#a3a3a3" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tendency bias (mean signed error)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={biasChart} margin={{ top: 5, right: 10, left: -20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="Mean signed error" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground -mt-2">
              Positive values = the LLM tends to rate statements more agreeably than the reference rater.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Full metrics</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>LLM</TableHead>
                <TableHead className="text-right">Exact match</TableHead>
                <TableHead className="text-right">Within ±1</TableHead>
                <TableHead className="text-right">MAE</TableHead>
                <TableHead className="text-right">Bias</TableHead>
                <TableHead className="text-right">Over-rates</TableHead>
                <TableHead className="text-right">Under-rates</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((s, i) => (
                <TableRow key={s.name}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-right">{pct(s.exact)}</TableCell>
                  <TableCell className="text-right">{pct(s.within1)}</TableCell>
                  <TableCell className="text-right">{s.mae.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <span className={s.bias > 0.05 ? "text-emerald-600 font-medium" : s.bias < -0.05 ? "text-red-500 font-medium" : ""}>
                      {s.bias > 0 ? "+" : ""}{s.bias.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{pct(s.over)}</TableCell>
                  <TableCell className="text-right">{pct(s.under)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
