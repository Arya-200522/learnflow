import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  ChevronDown,
  Clock3,
  FileText,
  Play,
  Video,
} from "lucide-react";
import AccessExpiryBadge from "../components/AccessExpiryBadge";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import Loading from "../components/Loading.jsx";
import api from "../utils/api.js";
import { courseTone, formatDuration } from "../utils/format.js";
import { useAuth } from "../context/AuthContext";
export default function CourseDetailPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("videos");
  const [openSection, setOpenSection] = useState(null);
  const [continueItem, setContinueItem] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      api.get(`/catalog/courses/${slug}`),
      api.get("/progress/continue"),
    ]).then(([courseResponse, progressResponse]) => {
      setData(courseResponse.data);
      const match = progressResponse.data.progress.find(
        (item) => item.lesson?.courseSlug === slug,
      );
      setContinueItem(match || null);
      if (courseResponse.data.sections[0])
        setOpenSection(courseResponse.data.sections[0].name);
    });
  }, [slug]);

  const tones = useMemo(
    () => (data ? courseTone(data.course.name) : ["#30227b", "#3656d8"]),
    [data],
  );
  if (!data) return <Loading label="Loading course" />;

  return (
    <div>
<div
  className="course-pattern relative overflow-hidden rounded-3xl p-7 text-white md:p-10"
  style={{
    "--card-from": tones[0],
    "--card-to": tones[1],
  }}
>
  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
    <div className="min-w-0">
      <p className="text-sm text-white/75">
        All Courses / {data.course.name}
      </p>

      <h1 className="mt-6 text-3xl font-bold md:text-4xl">
        {data.course.name}
      </h1>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
        <span className="inline-flex items-center gap-2">
          <Video size={17} />

          {data.course.videoCount.toLocaleString()} videos
        </span>

        <span className="inline-flex items-center gap-2">
          <FileText size={17} />

          {data.course.pdfCount.toLocaleString()} PDFs
        </span>
      </div>
    </div>

    {user?.role === "user" &&
      user?.accessExpiresAt && (
        <AccessExpiryBadge
          expiresAt={user.accessExpiresAt}
          className="shrink-0 bg-white shadow-lg"
        />
      )}
  </div>

  {continueItem && (
    <Link
      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-800"
      to={`/lessons/${continueItem.lesson._id}`}
    >
      <Play size={17} fill="currentColor" />
      Continue course
    </Link>
  )}
</div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">
        <section className="panel overflow-hidden">
          <div className="flex gap-2 border-b border-slate-200 p-4">
            <button
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === "videos" ? "bg-indigo-600 text-white" : "text-slate-500"}`}
              onClick={() => setTab("videos")}
            >
              Videos
            </button>
            <button
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === "pdfs" ? "bg-indigo-600 text-white" : "text-slate-500"}`}
              onClick={() => setTab("pdfs")}
            >
              PDF Resources
            </button>
          </div>
          {tab === "videos" ? (
            <div className="divide-y divide-slate-100">
              {data.sections.map((section, index) => (
                <div key={section.name}>
                  <button
                    className="flex w-full items-center gap-3 p-5 text-left"
                    onClick={() =>
                      setOpenSection(
                        openSection === section.name ? null : section.name,
                      )
                    }
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 font-semibold text-slate-900">
                      {section.name}
                    </span>
                    <span className="text-sm text-slate-500">
                      {section.lessons.length} lessons
                    </span>
                    <ChevronDown
                      size={18}
                      className={`transition ${openSection === section.name ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {openSection === section.name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-50/80"
                      >
                        <div className="divide-y divide-slate-100">
                          {section.lessons.map((lesson) => (
                            <Link
                              key={lesson._id}
                              to={`/lessons/${lesson._id}`}
                              className="flex items-center gap-3 px-5 py-3.5 text-sm transition hover:bg-indigo-50"
                            >
                              <Play size={15} className="text-indigo-600" />
                              <span className="min-w-0 flex-1 truncate font-medium text-slate-700">
                                {lesson.title}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                                <Clock3 size={13} />
                                {formatDuration(lesson.durationSec)}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          ) : data.pdfs.length ? (
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {data.pdfs.map((pdf) => (
                <Link
                  key={pdf._id}
                  to={`/pdfs/${pdf._id}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-500">
                    <FileText size={19} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
                    {pdf.title}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <EmptyState
                title="No PDFs in this course"
                text="PDF resources will appear here after import."
              />
            </div>
          )}
        </section>

        <aside>
          {continueItem ? (
            <div className="panel p-5">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-indigo-600">
                Saved from your last session
              </p>
              <h2 className="mt-3 font-bold text-slate-950">
                {continueItem.lesson.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {continueItem.lesson.section}
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{
                    width: `${Math.min((continueItem.currentTime / (continueItem.duration || continueItem.lesson.durationSec || 1)) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {formatDuration(continueItem.currentTime)} of{" "}
                {formatDuration(
                  continueItem.duration || continueItem.lesson.durationSec,
                )}
              </p>
              <Link
                className="primary-button mt-5 w-full"
                to={`/lessons/${continueItem.lesson._id}`}
              >
                <Play size={16} />
                Resume lesson
              </Link>
            </div>
          ) : (
            <div className="panel p-5">
              <Bookmark className="text-indigo-600" />
              <h2 className="mt-4 font-bold text-slate-950">Ready to begin?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Open any lesson and your progress will be saved automatically.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
