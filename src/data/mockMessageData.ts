// Types
export type Channel = "email" | "slack" | "teams";
export type DeliveryStatus = "delivered" | "bounced" | "unsubscribed";
export type BounceType = "hard" | "soft";

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

export interface ContentShare {
  id: string;
  title: string;
  type: "article" | "video" | "infographic" | "document";
  viewCount: number;
  shareCount: number;
  shareRate: number;
}

export interface EngagementDataPoint {
  date: string;
  opens: number;
  shares: number;
}

export interface DeliverabilityHealth {
  totalSent: number;
  delivered: number;
  unsubscribes: number;
  spamComplaints: number;
  hardBounces: number;
  softBounces: number;
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
  engagementTimeline: EngagementDataPoint[];
  deliverability: DeliverabilityHealth;
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
    
    // 80% delivered, 8% bounced, 12% unsubscribed (but were delivered first)
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

function generateEngagementTimeline(): EngagementDataPoint[] {
  const start = new Date("2026-03-15");
  return Array.from({ length: 26 }, (_, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    // Peak on first few days, then tapering
    const dayFactor = Math.max(0, 1 - i * 0.06);
    const opens = Math.floor((Math.random() * 15 + 5) * dayFactor);
    const shares = Math.floor((Math.random() * 4 + 1) * dayFactor);
    return {
      date: date.toISOString().split("T")[0],
      opens,
      shares,
    };
  });
}

function generateContentShares(): ContentShare[] {
  return [
    { id: "cs-1", title: "Q1 2026 Company Performance Report", type: "document", viewCount: 142, shareCount: 28, shareRate: 19.7 },
    { id: "cs-2", title: "Product Roadmap Update Video", type: "video", viewCount: 98, shareCount: 15, shareRate: 15.3 },
    { id: "cs-3", title: "Employee Benefits Infographic", type: "infographic", viewCount: 201, shareCount: 45, shareRate: 22.4 },
    { id: "cs-4", title: "New Office Locations Announcement", type: "article", viewCount: 76, shareCount: 8, shareRate: 10.5 },
  ];
}

// Main mock data
const recipients = generateRecipients();

const delivered = recipients.filter(r => r.deliveryStatus !== "bounced").length;
const bounced = recipients.filter(r => r.deliveryStatus === "bounced");

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
  contentShares: generateContentShares(),
  engagementTimeline: generateEngagementTimeline(),
  deliverability: {
    totalSent: 50,
    delivered,
    unsubscribes: recipients.filter(r => r.deliveryStatus === "unsubscribed").length,
    spamComplaints: 1,
    hardBounces: bounced.filter(b => b.bounceType === "hard").length,
    softBounces: bounced.filter(b => b.bounceType === "soft").length,
  },
};

// Computed metrics
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
