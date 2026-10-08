import { FileText, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import Loading from "../components/Loading.jsx";
import api from "../utils/api.js";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState(null);
  useEffect(() => { api.get("/bookmarks").then(({ data }) => setBookmarks(data.bookmarks)); }, []);
  if (!bookmarks) return <Loading label="Loading bookmarks" />;
  return <div><p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-600">Saved resources</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">Bookmarks</h1><p className="mt-2 text-slate-500">Lessons and PDFs you saved for later.</p>{bookmarks.length ? <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{bookmarks.map((bookmark) => { const resource = bookmark.lesson || bookmark.pdf; const to = bookmark.kind === "lesson" ? `/lessons/${resource._id}` : `/pdfs/${resource._id}`; return <Link to={to} key={bookmark._id} className="panel flex items-center gap-4 p-5 transition hover:border-indigo-300"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">{bookmark.kind === "lesson" ? <Play size={20} /> : <FileText size={20} />}</span><span className="min-w-0"><strong className="block truncate text-slate-900">{resource.title}</strong><small className="mt-1 block truncate text-slate-500">{resource.courseName}</small></span></Link>; })}</div> : <div className="mt-7"><EmptyState title="No bookmarks yet" text="Use the bookmark button on any lesson or PDF to save it here." action={<Link className="primary-button" to="/courses">Browse courses</Link>} /></div>}</div>;
}
