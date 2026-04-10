import { MousePointerClick, Eye, Heart, MessageCircle, Repeat2, DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { CampaignTotals } from "@/data/mockMessageData";

interface CampaignStatsCardProps {
  totals: CampaignTotals;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

function formatCurrency(n: number): string {
  return `$${n.toLocaleString()}`;
}

const stats = (totals: CampaignTotals) => [
  { icon: MousePointerClick, label: "Total Clicks", value: formatNumber(totals.totalClicks), color: "text-blue-600 bg-blue-50" },
  { icon: Eye, label: "Impressions", value: formatNumber(totals.totalImpressions), color: "text-violet-600 bg-violet-50" },
  { icon: TrendingUp, label: "Engagement Rate", value: `${totals.contentEngagementRate.toFixed(1)}%`, color: "text-emerald-600 bg-emerald-50" },
  { icon: DollarSign, label: "Est. Media Value", value: formatCurrency(totals.totalEMV), color: "text-amber-600 bg-amber-50" },
  { icon: Heart, label: "Reactions", value: formatNumber(totals.totalReactions), color: "text-rose-600 bg-rose-50" },
  { icon: MessageCircle, label: "Comments", value: formatNumber(totals.totalComments), color: "text-sky-600 bg-sky-50" },
  { icon: Repeat2, label: "Reshares", value: formatNumber(totals.totalReshares), color: "text-teal-600 bg-teal-50" },
];

export function CampaignStatsCard({ totals }: CampaignStatsCardProps) {
  const items = stats(totals);
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base">Campaign Performance</CardTitle>
            <CardDescription>Results from content shared via this message</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {items.map(({ icon: Icon, label, value, color }) => {
            const [textColor, bgColor] = color.split(" ");
            return (
              <div key={label} className="flex flex-col items-center rounded-lg border p-3 text-center transition-colors hover:bg-muted/50">
                <div className={`rounded-full p-2 ${bgColor} mb-2`}>
                  <Icon className={`h-4 w-4 ${textColor}`} />
                </div>
                <span className="text-lg font-bold tracking-tight">{value}</span>
                <span className="text-[11px] font-medium text-muted-foreground leading-tight mt-0.5">{label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
