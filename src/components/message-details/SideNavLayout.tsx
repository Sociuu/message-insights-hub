import { useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, Users, CheckCircle, Eye, Share2, AlertTriangle, ShieldAlert, XCircle, ArrowDownCircle, Search, TrendingUp, DollarSign, ArrowLeft, Mail, MessageSquare, Hash, BarChart3, FileText, UserX, Send } from "lucide-react";
import { mockMessage, getMessageMetrics, type MessageData, type BenchmarkData } from "@/data/mockMessageData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricCard } from "@/components/message-details/MetricCard";
import { HealthCard } from "@/components/message-details/HealthCard";
import { CampaignStatsCard } from "@/components/message-details/CampaignStatsCard";
import { BenchmarkBadge } from "@/components/message-details/BenchmarkBadge";
import { ContentSharesSection } from "@/components/message-details/ContentSharesSection";

type Section = "overview" | "deliverability" | "opens" | "content" | "recipients" | "unsubscribers";

interface SideNavLayoutProps {
  msg: MessageData;
  onBack: () => void;
}

const channelConfig = {
  email: { label: "Email", icon: Mail, color: "bg-blue-100 text-blue-800" },
  slack: { label: "Slack", icon: Hash, color: "bg-purple-100 text-purple-800" },
  teams: { label: "Teams", icon: MessageSquare, color: "bg-indigo-100 text-indigo-800" },
};

const statusColors: Record<string, string> = {
  delivered: "bg-emerald-100 text-emerald-800",
  bounced: "bg-red-100 text-red-800",
  unsubscribed: "bg-amber-100 text-amber-800",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [headers.join(","), ...data.map(row => headers.map(h => `"${row[h] ?? ""}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const navItems: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "deliverability", label: "Deliverability", icon: Send },
  { key: "opens", label: "Opens", icon: Eye },
  { key: "content", label: "Content & Shares", icon: Share2 },
  { key: "recipients", label: "Recipients", icon: Users },
  { key: "unsubscribers", label: "Unsubscribers", icon: UserX },
];

export function SideNavLayout({ msg, onBack }: SideNavLayoutProps) {
  const metrics = getMessageMetrics(msg);
  const channel = channelConfig[msg.channel];
  const ChannelIcon = channel.icon;
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("all");
  const [recipientSearch, setRecipientSearch] = useState("");

  const filteredTimeline = useMemo(() => {
    if (timeRange === "all") return msg.engagementTimeline;
    const days = timeRange === "7d" ? 7 : 30;
    return msg.engagementTimeline.slice(0, days);
  }, [timeRange, msg.engagementTimeline]);

  const filteredRecipients = useMemo(() => {
    const q = recipientSearch.toLowerCase();
    return msg.recipients.filter(r => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q));
  }, [recipientSearch, msg.recipients]);

  const unsubscribers = msg.recipients.filter(r => r.deliveryStatus === "unsubscribed");
  const d = msg.deliverability;

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={Users} label="Delivered" value={metrics.delivered} sub={`${metrics.deliveryRate.toFixed(1)}% rate`} progress={metrics.deliveryRate} />
              <MetricCard icon={Eye} label="Open Rate" value={`${metrics.openRate.toFixed(1)}%`} sub={`${metrics.uniqueOpens} unique`} progress={metrics.openRate} />
              <MetricCard icon={Share2} label="Share Rate" value={`${metrics.shareRate.toFixed(1)}%`} sub={`${metrics.totalShares} shares`} progress={metrics.shareRate} />
              <MetricCard icon={DollarSign} label="EMV" value={`$${msg.campaignTotals.totalEMV.toLocaleString()}`} sub={`${msg.campaignTotals.contentEngagementRate.toFixed(1)}% eng.`} progress={msg.campaignTotals.contentEngagementRate} />
            </div>

            {/* Benchmarks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Performance Benchmarks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {msg.benchmarks.map(b => (
                    <div key={b.metric} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{b.metric}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-0.5">
                          <span>This message: <span className="font-semibold text-foreground">{b.value.toFixed(1)}{b.metric.includes("EMV") ? "" : "%"}</span></span>
                          <span>Account avg: {b.accountAvg.toFixed(1)}{b.metric.includes("EMV") ? "" : "%"}</span>
                          <span>Industry: {b.industryAvg.toFixed(1)}{b.metric.includes("EMV") ? "" : "%"}</span>
                        </div>
                      </div>
                      <BenchmarkBadge rating={b.rating} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Campaign Totals */}
            <CampaignStatsCard totals={msg.campaignTotals} />

            {/* Chart */}
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">Engagement Over Time</CardTitle>
                  <CardDescription>Opens, shares & clicks</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-md border">
                    {(["7d", "30d", "all"] as const).map(range => (
                      <button key={range} onClick={() => setTimeRange(range)}
                        className={`px-3 py-1 text-xs font-medium transition-colors ${timeRange === range ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                      >{range === "all" ? "All" : range}</button>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadCSV(filteredTimeline as unknown as Record<string, unknown>[], "engagement-data.csv")}>
                    <Download className="mr-1 h-3 w-3" /> Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredTimeline}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", fontSize: 12 }} />
                      <Legend />
                      <Area type="monotone" dataKey="opens" stroke="hsl(215, 70%, 55%)" fill="hsl(215, 70%, 55%, 0.15)" strokeWidth={2} name="Opens" />
                      <Area type="monotone" dataKey="clicks" stroke="hsl(280, 60%, 55%)" fill="hsl(280, 60%, 55%, 0.15)" strokeWidth={2} name="Clicks" />
                      <Area type="monotone" dataKey="shares" stroke="hsl(150, 60%, 45%)" fill="hsl(150, 60%, 45%, 0.15)" strokeWidth={2} name="Shares" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "deliverability":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Deliverability</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <HealthCard icon={CheckCircle} label="Delivered" count={d.delivered} total={d.totalSent} color="text-emerald-600" />
              <HealthCard icon={XCircle} label="Unsubscribes" count={d.unsubscribes} total={d.totalSent} color="text-amber-600" />
              <HealthCard icon={ShieldAlert} label="Spam Complaints" count={d.spamComplaints} total={d.totalSent} color="text-red-600" />
              <HealthCard icon={AlertTriangle} label="Bounces" count={d.hardBounces + d.softBounces} total={d.totalSent} color="text-red-500" />
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Hard Bounces</p>
                    <p className="text-2xl font-bold text-red-600">{d.hardBounces}</p>
                    <button className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"><Users className="h-3 w-3" /> View contacts</button>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Soft Bounces</p>
                    <p className="text-2xl font-bold text-orange-500">{d.softBounces}</p>
                    <button className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"><Users className="h-3 w-3" /> View contacts</button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "opens":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Opens</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card><CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Unique Opens</p>
                <p className="text-3xl font-bold">{metrics.uniqueOpens}</p>
                <p className="text-xs text-muted-foreground mt-1">{metrics.openRate.toFixed(1)}% open rate</p>
                <button className="text-xs text-primary hover:underline flex items-center gap-1 mt-2 mx-auto"><Users className="h-3 w-3" /> View openers</button>
              </CardContent></Card>
              <Card><CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Total Opens</p>
                <p className="text-3xl font-bold">{metrics.totalOpens}</p>
                <p className="text-xs text-muted-foreground mt-1">Including repeats</p>
              </CardContent></Card>
              <Card><CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Didn't Open</p>
                <p className="text-3xl font-bold">{metrics.delivered - metrics.uniqueOpens}</p>
                <button className="text-xs text-primary hover:underline flex items-center gap-1 mt-2 mx-auto"><Users className="h-3 w-3" /> View non-openers</button>
              </CardContent></Card>
            </div>
          </div>
        );

      case "content":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Content & Shares</h2>
            <ContentSharesSection shareEvents={msg.shareEvents} />
          </div>
        );

      case "recipients":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Recipients</h2>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search recipients..." value={recipientSearch} onChange={e => setRecipientSearch(e.target.value)} className="pl-9" />
              </div>
              <Button variant="outline" size="sm" onClick={() => downloadCSV(
                filteredRecipients.map(r => ({ name: r.name, email: r.email, status: r.deliveryStatus, opens: r.openCount, shares: r.shareCount })),
                "recipients.csv"
              )}><Download className="mr-1 h-3 w-3" /> Export</Button>
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Opens</TableHead>
                    <TableHead>First Opened</TableHead>
                    <TableHead className="text-center">Shares</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecipients.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[r.deliveryStatus]}>
                          {r.deliveryStatus}{r.bounceType ? ` (${r.bounceType})` : ""}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">{r.openCount}</TableCell>
                      <TableCell className="text-sm">{formatDate(r.firstOpened)}</TableCell>
                      <TableCell className="text-center font-medium">{r.shareCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        );

      case "unsubscribers":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Unsubscribers</h2>
            <Card>
              {unsubscribers.length === 0 ? (
                <CardContent className="py-12 text-center text-muted-foreground">No unsubscribers.</CardContent>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Unsubscribed</TableHead>
                      <TableHead className="text-center">Opens</TableHead>
                      <TableHead className="text-center">Shares</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unsubscribers.map(r => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="font-medium">{r.name}</div>
                          <div className="text-xs text-muted-foreground">{r.email}</div>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(r.unsubscribedAt ?? null)}</TableCell>
                        <TableCell className="text-center">{r.openCount}</TableCell>
                        <TableCell className="text-center">{r.shareCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">{msg.subject}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatDate(msg.sentAt)}</span>
              <span>·</span>
              <span>{msg.contentShares.length} content pieces</span>
            </div>
          </div>
          <Badge className={channel.color} variant="outline"><ChannelIcon className="mr-1 h-3 w-3" />{channel.label}</Badge>
          <Badge className="bg-emerald-100 text-emerald-800" variant="outline">Sent</Badge>
        </div>
      </header>

      {/* Side nav + content */}
      <div className="container flex gap-0 min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r bg-muted/20 py-6 pr-4 hidden md:block">
          <div className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors text-left ${
                  activeSection === item.key
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Quick stats in sidebar */}
          <div className="mt-8 space-y-3 px-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Quick Stats</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Delivered</span><span className="font-semibold">{metrics.delivered}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Open Rate</span><span className="font-semibold">{metrics.openRate.toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Share Rate</span><span className="font-semibold">{metrics.shareRate.toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">EMV</span><span className="font-semibold text-emerald-700">${msg.campaignTotals.totalEMV.toLocaleString()}</span></div>
            </div>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden border-b w-full overflow-x-auto">
          <nav className="flex gap-0 px-2">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`px-3 py-3 text-xs font-medium border-b-2 whitespace-nowrap ${
                  activeSection === item.key ? "border-primary text-primary" : "border-transparent text-muted-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 py-8 pl-0 md:pl-8 min-w-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
