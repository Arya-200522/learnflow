import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CourseCard from "../components/CourseCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Loading from "../components/Loading.jsx";
import api from "../utils/api.js";

const categories = [["all", "All"], ["dsa", "DSA"], ["development", "Development"], ["aptitude", "Aptitude"], ["live", "Live Sessions"]];

export default function CoursesPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState("all");
  const [courses, setCourses] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      api.get("/catalog/courses", { params: { q: query || undefined, category } }).then(({ data }) => setCourses(data.courses));
      setParams(query ? { q: query } : {}, { replace: true });
    }, 250);
    return () => clearTimeout(timer);
  }, [query, category, setParams]);

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-600">Course library</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">All Courses</h1>
      <p className="mt-2 text-slate-500">Browse every video and PDF from your imported catalog.</p>
      <div className="mt-7 flex flex-col gap-3 xl:flex-row xl:items-center">
        <label className="flex h-12 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4"><Search size={18} className="text-slate-400" /><input className="w-full outline-none" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses..." /></label>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">{categories.map(([value, label]) => <button key={value} onClick={() => setCategory(value)} className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition ${category === value ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:text-indigo-600"}`}>{label}</button>)}</div>
      </div>
      {!courses ? <Loading label="Loading courses" /> : courses.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{courses.map((course, index) => <CourseCard key={course._id} course={course} index={index} />)}</div> : <div className="mt-6"><EmptyState title="No courses found" text="Try a different search or category." /></div>}
    </div>
  );
}
