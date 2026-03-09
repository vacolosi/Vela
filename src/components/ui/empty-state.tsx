import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-12 h-12 rounded-full bg-cream border border-parchment mb-4" />
      <h3 className="font-serif text-lg text-ink mb-2">{title}</h3>
      <p className="font-sans text-xs text-clay font-light leading-relaxed max-w-[240px] mb-4">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="font-sans text-xs text-vela-blue font-normal"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
