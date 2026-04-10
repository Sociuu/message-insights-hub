import { MousePointerClick, Eye, Heart, MessageCircle, Repeat2, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ContentShare } from "@/data/mockMessageData";

interface ContentPerformanceTabProps {
  contentShares: ContentShare[];
}

const typeColors: Record<string, string> = {
  article: "bg-blue-50 text-blue-700 border-blue-200",
  video: "bg-purple-50 text-purple-700 border-purple-200",
  infographic: "bg-pink-50 text-pink-700 border-pink-200",
  document: "bg-amber-50 text-amber-700 border-amber-200",
};

export function ContentPerformanceTab({ contentShares }: ContentPerformanceTabProps) {
  return (
    <div className="space-y-4">
      {/* Detailed content table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Content Breakdown</CardTitle>
          <CardDescription>Performance of each content piece shared through this message</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <TooltipProvider>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="min-w-[200px]">Content</TableHead>
                    <TableHead className="text-center">
                      <HeaderWithIcon icon={Eye} label="Views" />
                    </TableHead>
                    <TableHead className="text-center">
                      <HeaderWithIcon icon={Repeat2} label="Shares" />
                    </TableHead>
                    <TableHead className="text-center">
                      <HeaderWithIcon icon={MousePointerClick} label="Clicks" />
                    </TableHead>
                    <TableHead className="text-center">
                      <HeaderWithIcon icon={Eye} label="Impressions" />
                    </TableHead>
                    <TableHead className="text-center">
                      <HeaderWithIcon icon={Heart} label="Reactions" />
                    </TableHead>
                    <TableHead className="text-center">
                      <HeaderWithIcon icon={MessageCircle} label="Comments" />
                    </TableHead>
                    <TableHead className="text-center">
                      <HeaderWithIcon icon={TrendingUp} label="Eng. Rate" />
                    </TableHead>
                    <TableHead className="text-center">
                      <HeaderWithIcon icon={DollarSign} label="EMV" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentShares.map(cs => {
                    const engRate = cs.campaignStats.impressions > 0
                      ? (((cs.campaignStats.clicks + cs.campaignStats.reactions + cs.campaignStats.comments) / cs.campaignStats.impressions) * 100).toFixed(1)
                      : "0";
                    return (
                      <TableRow key={cs.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium text-sm leading-tight">{cs.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 capitalize ${typeColors[cs.type] || ""}`}>
                                  {cs.type}
                                </Badge>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span className="text-[10px] text-muted-foreground">
                                      {cs.globalShareCount} total shares globally
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">This content has {cs.globalShareCount} shares across all messages. {cs.shareCount} came from this message.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">{cs.viewCount.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold">{cs.shareCount}</span>
                          <span className="text-[10px] text-muted-foreground ml-1">({cs.shareRate}%)</span>
                        </TableCell>
                        <TableCell className="text-center font-medium">{cs.campaignStats.clicks.toLocaleString()}</TableCell>
                        <TableCell className="text-center font-medium">{cs.campaignStats.impressions.toLocaleString()}</TableCell>
                        <TableCell className="text-center font-medium">{cs.campaignStats.reactions}</TableCell>
                        <TableCell className="text-center font-medium">{cs.campaignStats.comments}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-semibold">{engRate}%</Badge>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-emerald-700">${cs.campaignStats.emv.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}

function HeaderWithIcon({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center justify-center gap-1">
      <Icon className="h-3 w-3 text-muted-foreground" />
      <span>{label}</span>
    </div>
  );
}
