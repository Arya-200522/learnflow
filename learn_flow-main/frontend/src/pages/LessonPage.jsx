import { Bookmark, Check, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import HlsPlayer from "../components/HlsPlayer.jsx";
import Loading from "../components/Loading.jsx";
import api from "../utils/api.js";
import { formatDuration } from "../utils/format.js";

export default function LessonPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [tab, setTab] = useState("overview");
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(true);
  const playerRef = useRef(null);
  const lastSaved = useRef(0);

  useEffect(() => {
    setData(null);
    setProgress(null);
    setNoteSaved(true);
    Promise.all([
      api.get(`/catalog/lessons/${id}`),
      api.get(`/progress/lessons/${id}`),
      api.get("/bookmarks/status", { params: { kind: "lesson", resourceId: id } }),
      api.get(`/notes/lessons/${id}`),
    ]).then(([lessonResponse, progressResponse, bookmarkResponse, noteResponse]) => {
      setData(lessonResponse.data);
      setProgress(progressResponse.data.progress);
      setBookmarked(bookmarkResponse.data.bookmarked);
      setNote(noteResponse.data.note?.content || "");
      setNoteSaved(true);
    });
  }, [id]);

  useEffect(() => {
    if (noteSaved) return undefined;
    const timer = setTimeout(async () => {
      await api.put(`/notes/lessons/${id}`, { content: note });
      setNoteSaved(true);
    }, 700);
    return () => clearTimeout(timer);
  }, [note, noteSaved, id]);

  const saveProgress = useCallback(async (currentTime, duration, force = false) => {
    const now = Date.now();
    if (!force && now - lastSaved.current < 10000) return;
    lastSaved.current = now;
    await api.put(`/progress/lessons/${id}`, { currentTime, duration });
  }, [id]);

  if (!data) return <Loading label="Loading lesson" />;
  const index = data.siblings.findIndex((lesson) => lesson._id === id);
  const previous = data.siblings[index - 1];
  const next = data.siblings[index + 1];

  const toggleBookmark = async () => {
    const { data: result } = await api.post("/bookmarks/toggle", { kind: "lesson", resourceId: id });
    setBookmarked(result.bookmarked);
  };

  const complete = async () => {
    const state = playerRef.current?.getState() || { currentTime: data.lesson.durationSec, duration: data.lesson.durationSec };
    await api.put(`/progress/lessons/${id}`, { ...state, completed: true });
    setProgress({ ...(progress || {}), completed: true });
  };

  return (
    <div>
      <p className="text-sm text-slate-500">{data.lesson.courseName} / {data.lesson.section}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{data.lesson.title}</h1>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <HlsPlayer ref={playerRef} lesson={data.lesson} startTime={progress?.currentTime || 0} onProgress={saveProgress} />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {previous ? <Link className="secondary-button" to={`/lessons/${previous._id}`}><ChevronLeft size={17} />Previous</Link> : <span />}
            <button className="primary-button" onClick={complete}><Check size={17} />{progress?.completed ? "Completed" : "Mark completed"}</button>
            <button className="secondary-button" onClick={toggleBookmark}><Bookmark size={17} fill={bookmarked ? "currentColor" : "none"} />{bookmarked ? "Bookmarked" : "Bookmark"}</button>
            {next && <Link className="secondary-button ml-auto" to={`/lessons/${next._id}`}>Next<ChevronRight size={17} /></Link>}
          </div>
        </div>

        <aside className="panel max-h-[650px] overflow-hidden">
          <div className="border-b border-slate-200 p-5"><h2 className="font-bold text-slate-950">Course content</h2><p className="mt-1 text-sm text-slate-500">{data.lesson.section}</p></div>
          <div className="max-h-[570px] overflow-y-auto p-2">{data.siblings.map((lesson) => <Link key={lesson._id} to={`/lessons/${lesson._id}`} className={`flex items-center gap-3 rounded-xl p-3 text-sm transition ${lesson._id === id ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${lesson._id === id ? "bg-indigo-600 text-white" : "bg-slate-100"}`}>{lesson._id === id ? "▶" : <FileText size={15} />}</span><span className="min-w-0 flex-1"><strong className="block truncate font-semibold">{lesson.title}</strong><small className="text-slate-400">{formatDuration(lesson.durationSec)}</small></span></Link>)}</div>
        </aside>
      </div>

      <section className="panel mt-6 overflow-hidden">
        <div className="flex border-b border-slate-200 px-5">{["overview", "notes", "resources"].map((item) => <button key={item} onClick={() => setTab(item)} className={`border-b-2 px-4 py-4 text-sm font-semibold capitalize ${tab === item ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500"}`}>{item}</button>)}</div>
        <div className="min-h-48 p-6">{tab === "overview" && <div><h2 className="text-xl font-bold text-slate-950">{data.lesson.title}</h2><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3"><div><dt className="text-slate-400">Course</dt><dd className="mt-1 font-semibold">{data.lesson.courseName}</dd></div><div><dt className="text-slate-400">Section</dt><dd className="mt-1 font-semibold">{data.lesson.section}</dd></div><div><dt className="text-slate-400">Duration</dt><dd className="mt-1 font-semibold">{formatDuration(data.lesson.durationSec)}</dd></div></dl></div>}{tab === "notes" && <div><div className="mb-2 text-right text-xs text-slate-400">{noteSaved ? "Saved" : "Saving..."}</div><textarea className="field min-h-36 resize-y" value={note} onChange={(event) => { setNote(event.target.value); setNoteSaved(false); }} placeholder="Write your lesson notes..." /></div>}{tab === "resources" && <p className="text-sm text-slate-500">Course-level PDFs are available from the PDF Resources tab on the course page.</p>}</div>
      </section>
    </div>
  );
}
