// Types
export type Channel = "email" | "slack" | "teams";
export type DeliveryStatus = "delivered" | "bounced" | "unsubscribed";
export type BounceType = "hard" | "soft";
export type SocialNetwork = "linkedin" | "twitter" | "facebook" | "instagram" | "whatsapp" | "other";
export type BenchmarkRating = "excellent" | "good" | "fair" | "poor";

export interface Recipient {
  id: string;
  name: string;
  email: string;
  deliveryStatus: DeliveryStatus;
  bounceType?: BounceType;
  openCount: number;
  firstOpened: string | null;
  lastOpened: string | null;
  shareCount: number;
  unsubscribedAt?: string;
}

export interface ContentShareStats {
  clicks: number;
  impressions: number;
  reactions: number;
  comments: number;
  reshares: number;
  emv: number;
}

export interface ContentShare {
  id: string;
  title: string;
  type: "article" | "video" | "infographic" | "document";
  viewCount: number;
  shareCount: number;
  shareRate: number;
  campaignStats: ContentShareStats;
  globalShareCount: number;
}

/** Individual share event: who shared what to which network */
export interface ShareEvent {
  id: string;
  recipientId: string;
  recipientName: string;
  contentId: string;
  contentTitle: string;
  network: SocialNetwork;
  sharedAt: string;
  /** Stats from this individual share */
  clicks: number;
  impressions: number;
  reactions: number;
}

export interface EngagementDataPoint {
  date: string;
  opens: number;
  shares: number;
  clicks: number;
}

export interface DeliverabilityHealth {
  totalSent: number;
  delivered: number;
  unsubscribes: number;
  spamComplaints: number;
  hardBounces: number;
  softBounces: number;
}

export interface CampaignTotals {
  totalClicks: number;
  totalImpressions: number;
  totalReactions: number;
  totalComments: number;
  totalReshares: number;
  totalEMV: number;
  contentEngagementRate: number;
}

export interface BenchmarkData {
  metric: string;
  value: number;
  accountAvg: number;
  industryAvg: number;
  rating: BenchmarkRating;
}

export interface MessageData {
  id: string;
  subject: string;
  previewText: string;
  senderName: string;
  senderEmail: string;
  channel: Channel;
  status: "sent";
  sentAt: string;
  recipients: Recipient[];
  contentShares: ContentShare[];
  shareEvents: ShareEvent[];
  engagementTimeline: EngagementDataPoint[];
  deliverability: DeliverabilityHealth;
  campaignTotals: CampaignTotals;
  benchmarks: BenchmarkData[];
}

// Helpers
const firstNames = [
  "James", "Sarah", "Michael", "Emma", "David", "Olivia", "Daniel", "Sophia",
  "Alex", "Isabella", "William", "Mia", "Ethan", "Charlotte", "Benjamin",
  "Amelia", "Lucas", "Harper", "Mason", "Evelyn", "Logan", "Abigail",
  "Jacob", "Emily", "Liam", "Elizabeth", "Noah", "Avery", "Owen", "Ella",
  "Ryan", "Scarlett", "Nathan", "Grace", "Caleb", "Lily", "Jack", "Chloe",
  "Henry", "Zoey", "Samuel", "Nora", "Sebastian", "Riley", "Andrew", "Layla",
  "Joseph", "Penelope", "Gabriel", "Hannah",
];

const lastNames = [
  "Anderson", "Baker", "Chen", "Davis", "Evans", "Foster", "Garcia", "Hughes",
  "Ibrahim", "Johnson", "Kim", "Lee", "Martinez", "Nguyen", "O'Brien",
  "Patel", "Quinn", "Robinson", "Smith", "Taylor", "Ueda", "Vargas",
  "Wilson", "Xu", "Young", "Zhang", "Murphy", "Clark", "Lewis", "Walker",
  "Hall", "Allen", "King", "Wright", "Scott", "Green", "Adams", "Nelson",
  "Hill", "Ramirez", "Campbell", "Mitchell", "Roberts", "Carter", "Phillips",
  "Turner", "Parker", "Collins", "Edwards", "Stewart",
];

const domains = ["acme.com", "globex.io", "initech.co", "umbrella.org", "waynetech.com", "stark.industries", "cyberdyne.net", "aperture.science"];
const networks: SocialNetwork[] = ["linkedin", "twitter", "facebook", "instagram", "whatsapp"];

function randomDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString();
}

function generateRecipients(): Recipient[] {
  const sentDate = new Date("2026-03-15T10:00:00Z");
  const now = new Date("2026-04-10T12:00:00Z");

  return Array.from({ length: 50 }, (_, i) => {
    const first = firstNames[i];
    const last = lastNames[i];
    const domain = domains[i % domains.length];
    const email = `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`;
    
    let deliveryStatus: DeliveryStatus;
    let bounceType: BounceType | undefined;
    let unsubscribedAt: string | undefined;

    if (i >= 46) {
      deliveryStatus = "bounced";
      bounceType = i >= 49 ? "soft" : "hard";
    } else if (i >= 40) {
      deliveryStatus = "unsubscribed";
      unsubscribedAt = randomDate(sentDate, now);
    } else {
      deliveryStatus = "delivered";
    }

    const wasDelivered = deliveryStatus !== "bounced";
    const openCount = wasDelivered ? (Math.random() > 0.3 ? Math.floor(Math.random() * 8) + 1 : 0) : 0;
    const firstOpened = openCount > 0 ? randomDate(sentDate, new Date(sentDate.getTime() + 3 * 86400000)) : null;
    const lastOpened = openCount > 1 ? randomDate(new Date(firstOpened!), now) : firstOpened;
    const shareCount = openCount > 0 ? (Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0) : 0;

    return {
      id: `r-${i + 1}`,
      name: `${first} ${last}`,
      email,
      deliveryStatus,
      bounceType,
      openCount,
      firstOpened,
      lastOpened,
      shareCount,
      unsubscribedAt,
    };
  });
}

function generateShareEvents(recipients: Recipient[], contentShares: ContentShare[]): ShareEvent[] {
  const sentDate = new Date("2026-03-15T10:00:00Z");
  const now = new Date("2026-04-10T12:00:00Z");
  const events: ShareEvent[] = [];
  let eventId = 1;

  for (const r of recipients) {
    if (r.shareCount === 0) continue;
    // Each share is a random content piece to a random network
    for (let s = 0; s < r.shareCount; s++) {
      const content = contentShares[Math.floor(Math.random() * contentShares.length)];
      const network = networks[Math.floor(Math.random() * networks.length)];
      events.push({
        id: `se-${eventId++}`,
        recipientId: r.id,
        recipientName: r.name,
        contentId: content.id,
        contentTitle: content.title,
        network,
        sharedAt: randomDate(sentDate, now),
        clicks: Math.floor(Math.random() * 50) + 5,
        impressions: Math.floor(Math.random() * 500) + 50,
        reactions: Math.floor(Math.random() * 30),
      });
    }
  }

  return events.sort((a, b) => new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime());
}

function generateEngagementTimeline(): EngagementDataPoint[] {
  const start = new Date("2026-03-15");
  return Array.from({ length: 26 }, (_, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const dayFactor = Math.max(0, 1 - i * 0.06);
    const opens = Math.floor((Math.random() * 15 + 5) * dayFactor);
    const shares = Math.floor((Math.random() * 4 + 1) * dayFactor);
    const clicks = Math.floor((Math.random() * 20 + 8) * dayFactor);
    return { date: date.toISOString().split("T")[0], opens, shares, clicks };
  });
}

function generateContentShares(): ContentShare[] {
  return [
    {
      id: "cs-1", title: "Q1 2026 Company Performance Report", type: "document",
      viewCount: 142, shareCount: 28, shareRate: 19.7, globalShareCount: 112,
      campaignStats: { clicks: 487, impressions: 3240, reactions: 156, comments: 42, reshares: 28, emv: 4850 },
    },
    {
      id: "cs-2", title: "Product Roadmap Update Video", type: "video",
      viewCount: 98, shareCount: 15, shareRate: 15.3, globalShareCount: 67,
      campaignStats: { clicks: 312, impressions: 2180, reactions: 98, comments: 27, reshares: 15, emv: 3120 },
    },
    {
      id: "cs-3", title: "Employee Benefits Infographic", type: "infographic",
      viewCount: 201, shareCount: 45, shareRate: 22.4, globalShareCount: 189,
      campaignStats: { clicks: 892, impressions: 5670, reactions: 312, comments: 89, reshares: 45, emv: 8940 },
    },
    {
      id: "cs-4", title: "New Office Locations Announcement", type: "article",
      viewCount: 76, shareCount: 8, shareRate: 10.5, globalShareCount: 43,
      campaignStats: { clicks: 156, impressions: 890, reactions: 45, comments: 12, reshares: 8, emv: 1230 },
    },
    {
      id: "cs-5", title: "Leadership Team Welcome Message", type: "video",
      viewCount: 165, shareCount: 22, shareRate: 13.3, globalShareCount: 95,
      campaignStats: { clicks: 410, impressions: 2890, reactions: 187, comments: 53, reshares: 22, emv: 5210 },
    },
  ];
}

function computeCampaignTotals(content: ContentShare[]): CampaignTotals {
  const totalClicks = content.reduce((s, c) => s + c.campaignStats.clicks, 0);
  const totalImpressions = content.reduce((s, c) => s + c.campaignStats.impressions, 0);
  const totalReactions = content.reduce((s, c) => s + c.campaignStats.reactions, 0);
  const totalComments = content.reduce((s, c) => s + c.campaignStats.comments, 0);
  const totalReshares = content.reduce((s, c) => s + c.campaignStats.reshares, 0);
  const totalEMV = content.reduce((s, c) => s + c.campaignStats.emv, 0);
  const contentEngagementRate = totalImpressions > 0
    ? ((totalClicks + totalReactions + totalComments) / totalImpressions) * 100
    : 0;
  return { totalClicks, totalImpressions, totalReactions, totalComments, totalReshares, totalEMV, contentEngagementRate };
}

function ratingFromPercentile(value: number, avg: number): BenchmarkRating {
  const ratio = value / avg;
  if (ratio >= 1.5) return "excellent";
  if (ratio >= 1.0) return "good";
  if (ratio >= 0.7) return "fair";
  return "poor";
}

// Main mock data
const recipients = generateRecipients();
const contentShares = generateContentShares();
const shareEvents = generateShareEvents(recipients, contentShares);

const delivered = recipients.filter(r => r.deliveryStatus !== "bounced").length;
const bounced = recipients.filter(r => r.deliveryStatus === "bounced");
const uniqueOpens = recipients.filter(r => r.openCount > 0).length;
const openRate = (uniqueOpens / delivered) * 100;
const totalShares = recipients.reduce((sum, r) => sum + r.shareCount, 0);
const shareRate = (totalShares / delivered) * 100;
const deliveryRate = (delivered / recipients.length) * 100;
const totals = computeCampaignTotals(contentShares);

export const mockMessage: MessageData = {
  id: "msg-8f42b1c3",
  subject: "🚀 Q1 2026 Company Update — Big Wins & What's Next",
  previewText: "Check out our Q1 highlights, upcoming product launches, and updated employee benefits...",
  senderName: "Corporate Communications",
  senderEmail: "comms@acme.com",
  channel: "email",
  status: "sent",
  sentAt: "2026-03-15T10:30:00Z",
  recipients,
  contentShares,
  shareEvents,
  engagementTimeline: generateEngagementTimeline(),
  deliverability: {
    totalSent: 50,
    delivered,
    unsubscribes: recipients.filter(r => r.deliveryStatus === "unsubscribed").length,
    spamComplaints: 1,
    hardBounces: bounced.filter(b => b.bounceType === "hard").length,
    softBounces: bounced.filter(b => b.bounceType === "soft").length,
  },
  campaignTotals: totals,
  benchmarks: [
    { metric: "Delivery Rate", value: deliveryRate, accountAvg: 94.2, industryAvg: 92.1, rating: ratingFromPercentile(deliveryRate, 94.2) },
    { metric: "Open Rate", value: openRate, accountAvg: 52.3, industryAvg: 45.8, rating: ratingFromPercentile(openRate, 52.3) },
    { metric: "Share Rate", value: shareRate, accountAvg: 18.5, industryAvg: 12.4, rating: ratingFromPercentile(shareRate, 18.5) },
    { metric: "Engagement Rate", value: totals.contentEngagementRate, accountAvg: 22.1, industryAvg: 18.7, rating: ratingFromPercentile(totals.contentEngagementRate, 22.1) },
    { metric: "EMV per Share", value: totals.totalEMV / (totals.totalReshares || 1), accountAvg: 165, industryAvg: 120, rating: "excellent" },
  ],
};

export function getMessageMetrics(msg: MessageData) {
  const totalRecipients = msg.recipients.length;
  const delivered = msg.deliverability.delivered;
  const deliveryRate = (delivered / totalRecipients) * 100;
  const uniqueOpens = msg.recipients.filter(r => r.openCount > 0).length;
  const totalOpens = msg.recipients.reduce((sum, r) => sum + r.openCount, 0);
  const openRate = (uniqueOpens / delivered) * 100;
  const totalShares = msg.recipients.reduce((sum, r) => sum + r.shareCount, 0);
  const shareRate = (totalShares / delivered) * 100;
  return { totalRecipients, delivered, deliveryRate, uniqueOpens, totalOpens, openRate, totalShares, shareRate };
}
