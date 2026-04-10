
## Message Details / Statistics Page

Build a standalone, richly detailed page at `/messages/:id` that displays full analytics for a sent message, using realistic mock data.

### Layout & Sections

1. **Top Bar** — Back button, message subject, channel badge (Email/Slack/Teams), sent timestamp, and status badge ("Sent")

2. **Message Preview Card** — Subject line, preview text, sender info, distribution channel, and sent date/time

3. **Performance Summary Cards** — Row of metric cards:
   - Total Recipients (with delivered count)
   - Delivery Rate (%)
   - Open Rate (unique opens / total opens)
   - Share Rate (%)
   Each card with a small sparkline or progress indicator

4. **Engagement Over Time Chart** — Interactive time-series area/line chart (using Recharts) showing opens and shares over time, with date range toggle (7 days / 30 days / All time). Exportable as CSV.

5. **Tabs Section** with:
   - **Recipients Tab** — Searchable, sortable table showing each recipient's name, email, delivery status (delivered/bounced/unsubscribed), open count, first & last opened timestamps, and share count
   - **Content Shares Tab** — Breakdown of shared content items with title, view count, share count, and share rate
   - **Deliverability Tab** — Health metrics: unsubscribes, spam complaints, hard bounces, soft bounces with counts and percentages
   - **Unsubscribers Tab** — List of recipients who unsubscribed, with their engagement history before unsubscribing

6. **Export Actions** — Button to export recipient list and chart data as CSV

### Tech & Design
- React page with Tailwind + shadcn/ui components (Cards, Tabs, Table, Badge, Button)
- Recharts for the time-series chart
- Mock data generator with ~50 realistic recipients and engagement events
- Responsive layout that works on desktop and tablet
- Route added to App.tsx at `/messages/:id`
