import { motion } from "framer-motion";
import { BookOpen, FileText, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { courseTone } from "../utils/format.js";

export default function CourseCard({ course, index = 0 }) {
  const [from, to] = courseTone(course.name);
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -4 }}
      className="panel overflow-hidden"
    >
      <div
        className="course-pattern flex h-36 items-end p-5 text-white"
        style={{ "--card-from": from, "--card-to": to }}
      >
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
          <BookOpen size={24} />
        </div>
      </div>
      <div className="p-5">
        <h3 className="min-h-12 font-bold leading-6 text-slate-900">{course.name}</h3>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5"><Play size={14} />{course.videoCount.toLocaleString()} videos</span>
          <span className="inline-flex items-center gap-1.5"><FileText size={14} />{course.pdfCount.toLocaleString()} PDFs</span>
        </div>
        <Link to={`/courses/${course.slug}`} className="secondary-button mt-5 w-full">View course</Link>
      </div>
    </motion.article>
  );
}
