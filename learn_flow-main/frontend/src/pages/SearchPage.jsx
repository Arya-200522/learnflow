import { Clock3, Play, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import Loading from "../components/Loading.jsx";
import api from "../utils/api.js";
import { formatDuration } from "../utils/format.js";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const q = params.get("q") || "";
    setQuery(q);
    if (!q) return setResult({ lessons: [], total: 0, page: 1, pages: 0 });
    setResult(null);
    api.get("/catalog/lessons", { params: { q, limit: 50 } }).then(({ data }) => setResult(data));
  }, [params]);

  const submit = (event) => {
    event.preventDefault();
    setParams(query.trim() ? { q: query.trim() } : {});
  };

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-600">Catalog search</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">Find a lesson</h1>
      <form className="mt-6 flex max-w-3xl gap-2" onSubmit={submit}>
        <label className="flex h-12 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4"><Search size={18} className="text-slate-400" /><input className="w-full outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search lesson, section or course..." /></label>
        <button className="primary-button" type="submit">Search</button>
      </form>
      {!result ? <Loading label="Searching lessons" /> : result.lessons.length ? <div className="panel mt-6 divide-y divide-slate-100 overflow-hidden">{result.lessons.map((lesson) => <Link key={lesson._id} to={`/lessons/${lesson._id}`} className="flex items-center gap-4 p-4 transition hover:bg-indigo-50"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Play size={17} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-slate-900">{lesson.title}</strong><small className="mt-1 block truncate text-slate-500">{lesson.courseName} · {lesson.section}</small></span><span className="hidden items-center gap-1 text-xs text-slate-400 sm:inline-flex"><Clock3 size={13} />{formatDuration(lesson.durationSec)}</span></Link>)}</div> : <div className="mt-6"><EmptyState title={params.get("q") ? "No matching lessons" : "Search your library"} text={params.get("q") ? "Try another title, topic, section or course name." : "Enter a lesson, section or course name above."} /></div>}
    </div>
  );
}
