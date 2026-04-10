import { Users, Eye, Share2, MousePointerClick } from "lucide-react";
import type { ShareEvent, SocialNetwork } from "@/data/mockMessageData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const networkConfig: Record<SocialNetwork, { label: string; color: string }> = {
  linkedin: { label: "LinkedIn", color: "bg-blue-100 text-blue-800" },
  twitter: { label: "X / Twitter", color: "bg-slate-100 text-slate-800" },
  facebook: { label: "Facebook", color: "bg-indigo-100 text-indigo-800" },
  instagram: { label: "Instagram", color: "bg-pink-100 text-pink-800" },
  whatsapp: { label: "WhatsApp", color: "bg-green-100 text-green-800" },
  other: { label: "Other", color: "bg-gray-100 text-gray-800" },
};

interface ContentSharesTabProps {
  shareEvents: ShareEvent[];
  viewContacts?: (filter: string) => void;
}

export function ContentSharesSection({ shareEvents, viewContacts }: ContentSharesTabProps) {
  // Summary by network
  const byNetwork = shareEvents.reduce((acc, ev) => {
    if (!acc[ev.network]) acc[ev.network] = { count: 0, clicks: 0, impressions: 0, reactions: 0 };
    acc[ev.network].count++;
    acc[ev.network].clicks += ev.clicks;
    acc[ev.network].impressions += ev.impressions;
    acc[ev.network].reactions += ev.reactions;
    return acc;
  }, {} as Record<string, { count: number; clicks: number; impressions: number; reactions: number }>);

  // Summary by content
  const byContent = shareEvents.reduce((acc, ev) => {
    if (!acc[ev.contentId]) acc[ev.contentId] = { title: ev.contentTitle, count: 0, clicks: 0, impressions: 0 };
    acc[ev.contentId].count++;
    acc[ev.contentId].clicks += ev.clicks;
    acc[ev.contentId].impressions += ev.impressions;
    return acc;
  }, {} as Record<string, { title: string; count: number; clicks: number; impressions: number }>);

  return (
    <div className="space-y-6">
      {/* Network breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Share2 className="h-4 w-4 text-muted-foreground" />
            Shares by Network
          </CardTitle>
          <CardDescription>Where recipients shared your content from this message</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(byNetwork)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([network, data]) => {
                const cfg = networkConfig[network as SocialNetwork];
                return (
                  <div key={network} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>
                      <span className="text-lg font-bold">{data.count}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div className="flex flex-col items-center">
                        <MousePointerClick className="h-3 w-3 mb-0.5" />
                        <span className="font-medium text-foreground">{data.clicks.toLocaleString()}</span>
                        <span>clicks</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Eye className="h-3 w-3 mb-0.5" />
                        <span className="font-medium text-foreground">{data.impressions.toLocaleString()}</span>
                        <span>impr.</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-sm mb-0.5">❤️</span>
                        <span className="font-medium text-foreground">{data.reactions}</span>
                        <span>reactions</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Content breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Content Shared</CardTitle>
          <CardDescription>Performance of each content piece shared from this message</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Content</TableHead>
                <TableHead className="text-center">Shares</TableHead>
                <TableHead className="text-center">Clicks</TableHead>
                <TableHead className="text-center">Impressions</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(byContent)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([contentId, data]) => (
                  <TableRow key={contentId}>
                    <TableCell className="font-medium text-sm">{data.title}</TableCell>
                    <TableCell className="text-center font-semibold">{data.count}</TableCell>
                    <TableCell className="text-center">{data.clicks.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{data.impressions.toLocaleString()}</TableCell>
                    <TableCell>
                      {viewContacts && (
                        <button
                          onClick={() => viewContacts(contentId)}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <Users className="h-3 w-3" /> View contacts
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Individual share events */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Share Activity Feed</CardTitle>
          <CardDescription>Individual shares: who shared what content to which network</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Person</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Shared</TableHead>
                  <TableHead className="text-center">Clicks</TableHead>
                  <TableHead className="text-center">Impressions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shareEvents.slice(0, 30).map(ev => (
                  <TableRow key={ev.id}>
                    <TableCell className="font-medium text-sm">{ev.recipientName}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{ev.contentTitle}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={networkConfig[ev.network].color + " text-[10px]"}>
                        {networkConfig[ev.network].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(ev.sharedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </TableCell>
                    <TableCell className="text-center text-sm">{ev.clicks}</TableCell>
                    <TableCell className="text-center text-sm">{ev.impressions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
