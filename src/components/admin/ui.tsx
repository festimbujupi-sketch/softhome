import type { OrderStatus } from "@/db/schema";
import { orderStatusLabels } from "@/lib/format";

export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-2xl font-normal">{title}</h1>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-md border border-line bg-white ${className}`}>{children}</div>;
}

const statusColors: Record<OrderStatus, string> = {
  new: "bg-amber-100 text-amber-900",
  confirmed: "bg-sky-100 text-sky-900",
  shipped: "bg-violet-100 text-violet-900",
  delivered: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-stone-200 text-stone-600",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${statusColors[status]}`}>
      {orderStatusLabels[status]}
    </span>
  );
}
