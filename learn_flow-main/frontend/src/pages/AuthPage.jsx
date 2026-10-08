import { AnimatePresence, motion } from "framer-motion";

import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  PlayCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useEffect, useState } from "react";

import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

const PENDING_ACCESS_MESSAGE =
  "Your registration has been received. After payment verification, your course access will usually be activated within 24 hours. You can sign in once the admin approves your account.";

const benefits = [
  {
    icon: PlayCircle,
    title: "Structured video lessons",
    text: "Continue every lesson from where you stopped.",
  },
  {
    icon: FileText,
    title: "PDF study resources",
    text: "Keep videos and learning resources organized.",
  },
  {
    icon: ShieldCheck,
    title: "Private course access",
    text: "Secure access after administrator approval.",
  },
];

function StatusMessage({ type, message }) {
  const isNotice = type === "notice";

  return (
    <motion.div
      key={`${type}-${message}`}
      initial={{
        opacity: 0,
        y: 8,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: -6,
      }}
      className={`mt-5 flex items-start gap-3 rounded-2xl border px-4 py-4 ${
        isNotice ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50"
      }`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
          isNotice ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
        }`}
      >
        {isNotice ? <Clock3 size={19} /> : <ShieldCheck size={19} />}
      </span>

      <div>
        <p
          className={`text-sm font-bold ${
            isNotice ? "text-amber-950" : "text-red-900"
          }`}
        >
          {isNotice ? "Approval pending" : "Unable to continue"}
        </p>

        <p
          className={`mt-1 text-sm leading-6 ${
            isNotice ? "text-amber-700" : "text-red-600"
          }`}
        >
          {message}
        </p>
      </div>
    </motion.div>
  );
}

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";

  const { user, login, register } = useAuth();

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const [notice, setNotice] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm({
      name: "",
      email: "",
      password: "",
    });

    setError("");
    setNotice("");
    setShowPassword(false);
  }, [mode]);

  useEffect(() => {
    if (isRegister) {
      return;
    }

    const authMessage = sessionStorage.getItem("learnflow_auth_message");

    if (authMessage) {
      setError(authMessage);

      sessionStorage.removeItem("learnflow_auth_message");
    }
  }, [isRegister]);

  if (user) {
    return (
      <Navigate to={user.role === "admin" ? "/admin/approvals" : "/"} replace />
    );
  }

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      if (isRegister) {
        const result = await register(form);

        if (result?.pending) {
          setNotice(PENDING_ACCESS_MESSAGE);

          setForm({
            name: "",
            email: "",
            password: "",
          });

          return;
        }

        setNotice(result?.message || PENDING_ACCESS_MESSAGE);

        return;
      }

      const loggedInUser = await login({
        email: form.email,
        password: form.password,
      });

      if (loggedInUser?.role === "admin") {
        navigate("/admin/approvals", {
          replace: true,
        });
      } else {
        navigate("/", {
          replace: true,
        });
      }
    } catch (requestError) {
      const code = requestError.response?.data?.code;

      if (code === "ACCOUNT_PENDING") {
        setNotice(PENDING_ACCESS_MESSAGE);

        return;
      }

      setError(
        requestError.response?.data?.message ||
          "Unable to continue. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f6fb]">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_.92fr]">
        <section className="relative hidden overflow-hidden bg-[#10182f] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20 xl:py-14">
          <div className="absolute -right-36 -top-28 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />

          <div className="absolute -bottom-28 -left-24 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />

          <div className="absolute left-[45%] top-[42%] h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />

          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="relative z-10 flex items-center gap-3"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-950/40">
              <BookOpen size={24} />
            </span>

            <div>
              <p className="text-xl font-bold tracking-tight">
                LearnFlow Academy
              </p>

              <p className="text-xs text-slate-400">
                Learn. Practice. Progress.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="relative z-10 max-w-xl"
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.55,
              delay: 0.1,
            }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[.18em] text-indigo-200 backdrop-blur">
              <Sparkles size={14} />
              Your private learning workspace
            </div>

            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight xl:text-6xl">
              Study with focus.
              <span className="block bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                Continue without losing progress.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-slate-300 xl:text-lg">
              Access videos, PDF resources, bookmarks and saved progress from
              one distraction-free learning platform.
            </p>

            <div className="mt-9 grid gap-4">
              {benefits.map(({ icon: Icon, title, text }, index) => (
                <motion.div
                  key={title}
                  initial={{
                    opacity: 0,
                    x: -18,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.25 + index * 0.1,
                  }}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-400/15 text-indigo-200">
                    <Icon size={19} />
                  </span>

                  <div>
                    <p className="text-sm font-bold text-white">{title}</p>

                    <p className="mt-1 text-sm leading-5 text-slate-400">
                      {text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="relative z-10 flex items-center gap-2 text-sm text-slate-400">
            <CheckCircle2 size={16} className="text-emerald-400" />
            Built for focused, distraction-free study.
          </div>
        </section>

        <section className="relative grid place-items-center overflow-hidden px-5 py-10 sm:px-8 md:px-12">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-indigo-100/60 blur-3xl" />

          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-100/60 blur-3xl" />

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className="relative z-10 w-full max-w-md"
          >
            <div className="mb-7 flex items-center justify-center gap-3 lg:hidden">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-200">
                <BookOpen size={22} />
              </span>

              <div>
                <p className="font-bold text-slate-950">LearnFlow Academy</p>

                <p className="text-xs text-slate-500">
                  Learn. Practice. Progress.
                </p>
              </div>
            </div>

            <motion.form
              onSubmit={submit}
              className="rounded-[28px] border border-white bg-white/90 p-6 shadow-[0_24px_80px_rgba(30,41,59,0.12)] backdrop-blur-xl sm:p-9"
              initial={{
                opacity: 0,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
            >
              <div className="mb-8">
                <span className="mb-4 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[.15em] text-indigo-600">
                  {isRegister ? "New learner" : "Learner access"}
                </span>

                <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                  {isRegister ? "Create your account" : "Welcome back"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {isRegister
                    ? "Register your details. Course access will be enabled after payment verification and admin approval."
                    : "Enter your account details to continue studying."}
                </p>
              </div>

              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {isRegister && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                    >
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Full name
                      </label>

                      <input
                        id="name"
                        name="name"
                        className="field"
                        type="text"
                        placeholder="Enter your full name"
                        autoComplete="name"
                        value={form.name}
                        onChange={updateField}
                        required
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    className="field"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={form.email}
                    onChange={updateField}
                    required
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    {!isRegister && (
                      <Link
                        to="/forgot-password"
                        className="text-xs font-bold text-indigo-600 transition hover:text-indigo-800 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      className="field pr-12"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      minLength={8}
                      autoComplete={
                        isRegister ? "new-password" : "current-password"
                      }
                      value={form.password}
                      onChange={updateField}
                      required
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      onClick={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {error && <StatusMessage type="error" message={error} />}

                {!error && notice && (
                  <StatusMessage type="notice" message={notice} />
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                whileHover={
                  submitting
                    ? undefined
                    : {
                        y: -1,
                      }
                }
                whileTap={
                  submitting
                    ? undefined
                    : {
                        scale: 0.99,
                      }
                }
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Please wait...
                  </>
                ) : isRegister ? (
                  "Create account"
                ) : (
                  "Sign in"
                )}
              </motion.button>

              {isRegister && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-500">
                  <Clock3
                    size={15}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />
                  Access is generally activated within 24 hours after payment
                  verification.
                </div>
              )}

              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200" />

                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Or
                </span>

                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <p className="text-center text-sm text-slate-500">
                {isRegister ? "Already have an account?" : "New to LearnFlow?"}{" "}
                <Link
                  className="font-bold text-indigo-600 transition hover:text-indigo-800"
                  to={isRegister ? "/login" : "/register"}
                >
                  {isRegister ? "Sign in" : "Create account"}
                </Link>
              </p>
            </motion.form>

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              By continuing, you agree to follow the course access and
              account-sharing policies.
            </p>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
