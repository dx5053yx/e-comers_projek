export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="chat-window border border-[var(--border)] max-w-sm mb-8 shadow-sm">
        <div className="bubble bubble--outgoing">
          <div className="bubble__sender">siPandu Bot</div>
          {description}
        </div>
      </div>
      <p className="font-bold text-lg text-[var(--foreground)]">{title}</p>
    </div>
  );
}
