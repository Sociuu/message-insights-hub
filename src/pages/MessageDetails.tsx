import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Mail, MessageSquare, Hash, Users, CheckCircle, Eye, Share2, AlertTriangle, ShieldAlert, XCircle, ArrowDownCircle, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { mockMessage, getMessageMetrics, type EngagementDataPoint } from "@/data/mockMessageData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/message-details/MetricCard";
import { HealthCard } from "@/components/message-details/HealthCard";
import { CampaignStatsCard } from "@/components/message-details/CampaignStatsCard";
import { ContentPerformanceTab } from "@/components/message-details/ContentPerformanceTab";

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
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MessageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const msg = mockMessage;
  const metrics = getMessageMetrics(msg);
  const channel = channelConfig[msg.channel];
  const ChannelIcon = channel.icon;

  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("all");
  const filteredTimeline = useMemo(() => {
    if (timeRange === "all") return msg.engagementTimeline;
    const days = timeRange === "7d" ? 7 : 30;
    return msg.engagementTimeline.slice(0, days);
  }, [timeRange, msg.engagementTimeline]);

  const [recipientSearch, setRecipientSearch] = useState("");
  const filteredRecipients = useMemo(() => {
    const q = recipientSearch.toLowerCase();
    return msg.recipients.filter(r => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q));
  }, [recipientSearch, msg.recipients]);

  const unsubscribers = msg.recipients.filter(r => r.deliveryStatus === "unsubscribed");
  const { deliverability: d } = msg;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">{msg.subject}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatDate(msg.sentAt)}</span>
              <span>·</span>
              <span>{msg.contentShares.length} content pieces</span>
            </div>
          </div>
          <Badge className={channel.color} variant="outline">
            <ChannelIcon className="mr-1 h-3 w-3" />
            {channel.label}
          </Badge>
          <Badge className="bg-emerald-100 text-emerald-800" variant="outline">Sent</Badge>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Message Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Message Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div><span className="font-medium text-muted-foreground">Subject:</span> <span>{msg.subject}</span></div>
              <div><span className="font-medium text-muted-foreground">From:</span> <span>{msg.senderName} ({msg.senderEmail})</span></div>
              <div><span className="font-medium text-muted-foreground">Channel:</span> <span className="capitalize">{msg.channel}</span></div>
              <div><span className="font-medium text-muted-foreground">Sent:</span> <span>{formatDate(msg.sentAt)}</span></div>
            </div>
            <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground italic">
              "{msg.previewText}"
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={Users} label="Total Recipients" value={metrics.totalRecipients} sub={`${metrics.delivered} delivered`} progress={metrics.deliveryRate} />
          <MetricCard icon={CheckCircle} label="Delivery Rate" value={`${metrics.deliveryRate.toFixed(1)}%`} sub={`${metrics.totalRecipients - metrics.delivered} failed`} progress={metrics.deliveryRate} />
          <MetricCard icon={Eye} label="Open Rate" value={`${metrics.openRate.toFixed(1)}%`} sub={`${metrics.uniqueOpens} unique · ${metrics.totalOpens} total`} progress={metrics.openRate} />
          <MetricCard icon={Share2} label="Share Rate" value={`${metrics.shareRate.toFixed(1)}%`} sub={`${metrics.totalShares} total shares`} progress={metrics.shareRate} />
        </div>

        {/* Campaign Performance */}
        <CampaignStatsCard totals={msg.campaignTotals} />

        {/* Engagement Chart */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">Engagement Over Time</CardTitle>
              <CardDescription>Opens, shares & clicks activity</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-md border">
                {(["7d", "30d", "all"] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${timeRange === range ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    {range === "all" ? "All" : range}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => downloadCSV(filteredTimeline as unknown as Record<string, unknown>[], "engagement-data.csv")}>
                <Download className="mr-1 h-3 w-3" /> Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredTimeline}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", fontSize: 12 }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="opens" stroke="hsl(215, 70%, 55%)" fill="hsl(215, 70%, 55%, 0.15)" strokeWidth={2} name="Opens" />
                  <Area type="monotone" dataKey="clicks" stroke="hsl(280, 60%, 55%)" fill="hsl(280, 60%, 55%, 0.15)" strokeWidth={2} name="Clicks" />
                  <Area type="monotone" dataKey="shares" stroke="hsl(150, 60%, 45%)" fill="hsl(150, 60%, 45%, 0.15)" strokeWidth={2} name="Shares" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="content">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="content">Content Performance</TabsTrigger>
              <TabsTrigger value="recipients">Recipients</TabsTrigger>
              <TabsTrigger value="deliverability">Deliverability</TabsTrigger>
              <TabsTrigger value="unsubscribers">Unsubscribers</TabsTrigger>
            </TabsList>
          </div>

          {/* Content Performance Tab */}
          <TabsContent value="content">
            <ContentPerformanceTab contentShares={msg.contentShares} />
          </TabsContent>

          {/* Recipients Tab */}
          <TabsContent value="recipients" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search recipients..." value={recipientSearch} onChange={e => setRecipientSearch(e.target.value)} className="pl-9" />
              </div>
              <Button variant="outline" size="sm" onClick={() => downloadCSV(
                filteredRecipients.map(r => ({ name: r.name, email: r.email, status: r.deliveryStatus, opens: r.openCount, firstOpened: r.firstOpened ?? "", lastOpened: r.lastOpened ?? "", shares: r.shareCount })),
                "recipients.csv"
              )}>
                <Download className="mr-1 h-3 w-3" /> Export
              </Button>
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Opens</TableHead>
                    <TableHead>First Opened</TableHead>
                    <TableHead>Last Opened</TableHead>
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
                      <TableCell className="text-sm">{formatDate(r.lastOpened)}</TableCell>
                      <TableCell className="text-center font-medium">{r.shareCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Deliverability Tab */}
          <TabsContent value="deliverability">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <HealthCard icon={XCircle} label="Unsubscribes" count={d.unsubscribes} total={d.totalSent} color="text-amber-600" />
              <HealthCard icon={ShieldAlert} label="Spam Complaints" count={d.spamComplaints} total={d.totalSent} color="text-red-600" />
              <HealthCard icon={AlertTriangle} label="Hard Bounces" count={d.hardBounces} total={d.totalSent} color="text-red-500" />
              <HealthCard icon={ArrowDownCircle} label="Soft Bounces" count={d.softBounces} total={d.totalSent} color="text-orange-500" />
            </div>
          </TabsContent>

          {/* Unsubscribers Tab */}
          <TabsContent value="unsubscribers">
            <Card>
              {unsubscribers.length === 0 ? (
                <CardContent className="py-12 text-center text-muted-foreground">No unsubscribers for this message.</CardContent>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Unsubscribed At</TableHead>
                      <TableHead className="text-center">Opens Before</TableHead>
                      <TableHead className="text-center">Shares Before</TableHead>
                      <TableHead>Last Opened</TableHead>
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
                        <TableCell className="text-sm">{formatDate(r.lastOpened)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
