import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Bookmark,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PlaySquare,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  ["/", "Overview", LayoutDashboard],
  ["/courses", "All Courses", BookOpen],
  ["/continue", "Continue Learning", PlaySquare],
  ["/bookmarks", "Bookmarks", Bookmark],
];

function Sidebar({ close }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <aside className="flex h-full flex-col bg-[#111b34] px-4 py-6 text-white">
      <button className="mb-8 flex items-center gap-3 px-2 text-xl font-bold" onClick={() => navigate("/")}>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400"><GraduationCap size={22} /></span>
        LearnFlow
      </button>
      <nav className="space-y-2">
        {links.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={close}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                isActive ? "bg-indigo-500/25 text-white shadow-[inset_3px_0_0_#8b7cff]" : "text-slate-300 hover:bg-white/8 hover:text-white"
              }`
            }
          >
            <Icon size={18} />{label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={async () => { await logout(); navigate("/login"); }}
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
      >
        <LogOut size={18} /> Sign out
      </button>
    </aside>
  );
}

export default function AppShell() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const submitSearch = (event) => {
    event.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-60 lg:block"><Sidebar /></div>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              aria-label="Close menu"
              className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
            >
              <Sidebar close={() => setMobileOpen(false)} />
              <button aria-label="Close menu" className="absolute right-3 top-3 text-white" onClick={() => setMobileOpen(false)}><X /></button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:px-7">
          <button className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
          <form onSubmit={submitSearch} className="flex h-11 max-w-xl flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4">
            <Search size={17} className="text-slate-400" />
            <input className="w-full bg-transparent text-sm outline-none" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search lessons, sections or courses..." />
          </form>
          <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600"><Bell size={18} /></button>
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-sm font-bold text-white">{user?.name?.slice(0, 2).toUpperCase()}</span>
            <span className="hidden text-sm font-semibold text-slate-800 sm:block">{user?.name}</span>
          </div>
        </header>
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="mx-auto max-w-[1440px] p-4 md:p-7"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
