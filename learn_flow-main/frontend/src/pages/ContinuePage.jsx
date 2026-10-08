import { Clock3, Play, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import Loading from "../components/Loading.jsx";
import api from "../utils/api.js";
import { formatDuration } from "../utils/format.js";

export default function ContinuePage() {
  const [items, setItems] = useState(null);
  useEffect(() => { api.get("/progress/continue").then(({ data }) => setItems(data.progress)); }, []);
  const remove = async (lessonId) => { await api.delete(`/progress/lessons/${lessonId}`); setItems((current) => current.filter((item) => item.lesson._id !== lessonId)); };
  if (!items) return <Loading label="Loading saved progress" />;
  return <div><p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-600">Your study history</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">Continue Learning</h1><p className="mt-2 text-slate-500">Only lessons with real saved playback progress appear here.</p>{items.length ? <div className="mt-7 grid gap-4">{items.map((item) => { const total = item.duration || item.lesson.durationSec || 1; return <article key={item._id} className="panel flex flex-col gap-5 p-5 md:flex-row md:items-center"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white"><Play fill="currentColor" /></div><div className="min-w-0 flex-1"><h2 className="truncate text-lg font-bold text-slate-950">{item.lesson.title}</h2><p className="mt-1 text-sm text-slate-500">{item.lesson.courseName} · {item.lesson.section}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${Math.min((item.currentTime / total) * 100, 100)}%` }} /></div><p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500"><Clock3 size={13} />{formatDuration(item.currentTime)} of {formatDuration(total)}</p></div><div className="flex gap-2"><Link className="primary-button" to={`/lessons/${item.lesson._id}`}><Play size={16} />Resume</Link><button className="secondary-button" aria-label="Remove from history" onClick={() => remove(item.lesson._id)}><Trash2 size={16} /></button></div></article>; })}</div> : <div className="mt-7"><EmptyState title="No saved lessons yet" text="Start any video and your playback position will appear here automatically." action={<Link className="primary-button" to="/courses">Browse courses</Link>} /></div>}</div>;
}
