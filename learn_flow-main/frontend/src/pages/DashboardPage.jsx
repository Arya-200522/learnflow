import {
  BookOpen,
  Clock3,
  FileText,
  Play,
  Video,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AccessExpiryBadge from "../components/AccessExpiryBadge.jsx";
import CourseCard from "../components/CourseCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Loading from "../components/Loading.jsx";

import { useAuth } from "../context/AuthContext.jsx";

import api from "../utils/api.js";
import {
  formatDuration,
} from "../utils/format.js";

export default function DashboardPage() {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/catalog/summary"),
      api.get("/catalog/courses"),
      api.get("/progress/continue"),
    ])
      .then(
        ([
          summaryResponse,
          coursesResponse,
          progressResponse,
        ]) => {
          setData({
            summary: summaryResponse.data,
            courses:
              coursesResponse.data.courses,
            progress:
              progressResponse.data.progress,
          });
        },
      )
      .catch((requestError) => {
        setError(
          requestError.response?.data?.message ||
            "Unable to load dashboard",
        );
      });
      console.log("Dashboard data fetched");
  }, []);

  if (!data && !error) {
    return (
      <Loading label="Loading your library" />
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Dashboard unavailable"
        text={error}
      />
    );
  }

  const latest = data.progress[0];

  const summaryCards = [
    [
      BookOpen,
      data.summary.courses,
      "Courses",
    ],
    [
      Video,
      data.summary.lessons.toLocaleString(),
      "Video lessons",
    ],
    [
      FileText,
      data.summary.pdfs.toLocaleString(),
      "PDF resources",
    ],
    [
      Clock3,
      Math.round(
        data.summary.hours,
      ).toLocaleString(),
      "Course hours",
    ],
  ];

  const firstName =
    user?.name?.split(" ")[0] || "Learner";

  return (
    <div>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-600">
            Welcome back
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Keep learning,{" "}
            <span className="text-indigo-600">
              {firstName}
            </span>
          </h1>

          <p className="mt-2 text-slate-500">
            Pick up where you left off or
            explore the course library.
          </p>
        </div>

        {user?.role === "user" &&
          user?.accessExpiresAt && (
            <AccessExpiryBadge
              expiresAt={
                user.accessExpiresAt
              }
              className="shrink-0"
            />
          )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(
          ([Icon, value, label]) => (
            <div
              key={label}
              className="panel flex items-center gap-4 p-5"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Icon size={22} />
              </span>

              <div>
                <strong className="block text-2xl text-slate-950">
                  {value}
                </strong>

                <span className="text-sm text-slate-500">
                  {label}
                </span>
              </div>
            </div>
          ),
        )}
      </div>

      <section className="mt-7">
        {latest ? (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#241777] via-indigo-700 to-[#146b83] p-7 text-white shadow-xl shadow-indigo-200 md:p-9">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-2xl" />

            <div className="relative max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-200">
                Saved from your last
                session
              </p>

              <h2 className="mt-4 text-2xl font-bold md:text-3xl">
                {latest.lesson.title}
              </h2>

              <p className="mt-2 text-indigo-100">
                {latest.lesson.courseName} ·{" "}
                {latest.lesson.section}
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm text-indigo-100">
                <Clock3 size={16} />

                {formatDuration(
                  latest.currentTime,
                )}{" "}
                of{" "}
                {formatDuration(
                  latest.duration ||
                    latest.lesson
                      .durationSec,
                )}
              </div>

              <Link
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-800"
                to={`/lessons/${latest.lesson._id}`}
              >
                <Play
                  size={17}
                  fill="currentColor"
                />

                Resume lesson
              </Link>
            </div>
          </div>
        ) : (
          <EmptyState
            title="Choose your first lesson"
            text="Once you start a video, LearnFlow will save your playback position automatically."
            action={
              <Link
                className="primary-button"
                to="/courses"
              >
                Browse courses
              </Link>
            }
          />
        )}
      </section>

      <section className="mt-9">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-950">
            Browse courses
          </h2>

          <Link
            className="text-sm font-semibold text-indigo-600"
            to="/courses"
          >
            View all
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {data.courses
            .slice(0, 4)
            .map((course, index) => (
              <CourseCard
                key={course._id}
                course={course}
                index={index}
              />
            ))}
        </div>
      </section>
    </div>
  );
}