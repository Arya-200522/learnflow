import { motion } from "framer-motion";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
} from "lucide-react";

import { useState } from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import api from "../utils/api.js";

export default function ResetPasswordPage() {
  const { token } = useParams();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const updateField = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (form.password.length < 8) {
      setError(
        "Password must contain at least 8 characters.",
      );

      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Password and confirm password do not match.",
      );

      return;
    }

    if (!token) {
      setError(
        "Password reset link is invalid.",
      );

      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post(
        `/auth/reset-password/${token}`,
        {
          password: form.password,
          confirmPassword:
            form.confirmPassword,
        },
      );

      setMessage(
        response.data.message ||
          "Your password has been reset successfully.",
      );

      setForm({
        password: "",
        confirmPassword: "",
      });
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Unable to reset your password. Please request a new reset link.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f4f6fb] px-5 py-10">
      <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />

      <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-cyan-200/50 blur-3xl" />

      <motion.div
        initial={{
          opacity: 0,
          y: 22,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.4,
        }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-7 flex items-center justify-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-200">
            <BookOpen size={23} />
          </span>

          <div>
            <p className="font-bold text-slate-950">
              LearnFlow Academy
            </p>

            <p className="text-xs text-slate-500">
              Learn. Practice. Progress.
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white bg-white/90 p-7 shadow-[0_24px_80px_rgba(30,41,59,0.12)] backdrop-blur-xl sm:p-9">
          {message ? (
            <motion.div
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="text-center"
            >
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2
                  size={31}
                />
              </span>

              <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
                Password updated
              </h1>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                {message}
              </p>

              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
                Your previous device
                sessions have been signed
                out for security.
              </div>

              <Link
                to="/login"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
              >
                Sign in with new password
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={submit}>
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                <KeyRound size={25} />
              </span>

              <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
                Create new password
              </h1>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Choose a strong password
                that you have not used
                previously.
              </p>

              <div className="mt-7 space-y-4">
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    New password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      name="password"
                      className="field px-11"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Minimum 8 characters"
                      minLength={8}
                      autoComplete="new-password"
                      value={
                        form.password
                      }
                      onChange={
                        updateField
                      }
                      required
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current,
                        )
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Confirm new password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      className="field px-11"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter password again"
                      minLength={8}
                      autoComplete="new-password"
                      value={
                        form.confirmPassword
                      }
                      onChange={
                        updateField
                      }
                      required
                    />

                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) =>
                            !current,
                        )
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                whileTap={{
                  scale: 0.99,
                }}
                disabled={submitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Updating password...
                  </>
                ) : (
                  <>
                    <KeyRound size={17} />

                    Reset password
                  </>
                )}
              </motion.button>

              <Link
                to="/login"
                className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
              >
                <ArrowLeft size={16} />

                Back to sign in
              </Link>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          The reset link can be used only
          once and expires after 30 minutes.
        </p>
      </motion.div>
    </main>
  );
}