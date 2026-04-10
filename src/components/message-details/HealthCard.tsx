import { Card, CardContent } from "@/components/ui/card";

interface HealthCardProps {
  icon: React.ElementType;
  label: string;
  count: number;
  total: number;
  color: string;
}

export function HealthCard({ icon: Icon, label, count, total, color }: HealthCardProps) {
  const pct = ((count / total) * 100).toFixed(1);
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <Icon className={`h-6 w-6 ${color}`} />
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{count}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{pct}% of {total} sent</p>
      </CardContent>
    </Card>
  );
}
