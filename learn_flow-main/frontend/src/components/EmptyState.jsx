import { BookOpen } from "lucide-react";

export default function EmptyState({ title, text, action }) {
  return (
    <div className="panel grid min-h-[260px] place-items-center p-8 text-center">
      <div>
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
          <BookOpen size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{text}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
