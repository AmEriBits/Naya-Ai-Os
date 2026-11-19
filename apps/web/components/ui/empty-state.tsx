import { ArrowRight, Sparkles } from "lucide-react";

import type { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="empty-state">
      <div className="empty-illustration">
        <span className="empty-blob" />
        <Icon size={24} />
        <Sparkles className="empty-spark" size={13} />
      </div>
      <h4>{title}</h4>
      <p>{body}</p>
      <button className="button button-light" onClick={onAction}>
        {action} <ArrowRight size={14} />
      </button>
    </div>
  );
}
