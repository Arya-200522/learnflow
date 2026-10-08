import { motion } from "framer-motion";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  KeyRound,
  Mail,
  Send,
} from "lucide-react";

import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../utils/api.js";

export default function ForgotPasswordPage() {
  const [email, setEmail] =
    useState("");

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const submit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const response = await api.post(
        "/auth/forgot-password",
        {
          email,
        },
      );

      setMessage(
        response.data.message ||
          "If an account exists with this email, a password reset link has been sent.",
      );
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          "Unable to send the reset link. Please try again.",
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
                  size={30}
                />
              </span>

              <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
                Check your email
              </h1>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                {message}
              </p>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-700">
                  <Mail size={16} />

                  {email}
                </div>
              </div>

              <p className="mt-5 text-xs leading-6 text-slate-400">
                The password-reset link is
                valid for 30 minutes. Also
                check your spam folder if
                you cannot find the email.
              </p>

              <Link
                to="/login"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
              >
                <ArrowLeft size={17} />

                Return to sign in
              </Link>

              <button
                type="button"
                className="mt-4 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
                onClick={() => {
                  setMessage("");
                  setError("");
                }}
              >
                Try another email
              </button>
            </motion.div>
          ) : (
            <form onSubmit={submit}>
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                <KeyRound size={25} />
              </span>

              <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
                Forgot password?
              </h1>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Enter the email address
                connected to your account.
                We will send you a secure
                password-reset link.
              </p>

              <div className="mt-7">
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    className="field pl-11"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value,
                      )
                    }
                    required
                  />
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

                    Sending reset link...
                  </>
                ) : (
                  <>
                    <Send size={17} />

                    Send reset link
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
          For your security, the response
          will be the same even if an
          account does not exist.
        </p>
      </motion.div>
    </main>
  );
}