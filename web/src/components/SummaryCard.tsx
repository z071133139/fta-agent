interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function SummaryCard({ title, value, subtitle }: SummaryCardProps) {
  return (
    <div className="rounded-lg bg-surface p-4">
      <p className="text-sm text-muted">{title}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
    </div>
  );
}
