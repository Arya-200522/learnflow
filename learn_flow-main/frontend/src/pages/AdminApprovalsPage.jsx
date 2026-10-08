import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  Check,
  CheckCircle2,
  Clock3,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext.jsx";

import Loading from "../components/Loading.jsx";

import api from "../utils/api.js";

export default function AdminApprovalsPage() {
  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [users, setUsers] =
    useState([]);

  const [summary, setSummary] =
    useState({
      pendingUsers: 0,
      verifiedUsers: 0,
      totalUsers: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [busyId, setBusyId] =
    useState("");

  const [error, setError] =
    useState("");

  const loadData =
    useCallback(async ({
      silent = false,
    } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const [
          summaryResponse,
          usersResponse,
        ] = await Promise.all([
          api.get(
            "/admin/summary",
          ),

          api.get(
            "/admin/pending-users",
          ),
        ]);

        setSummary(
          summaryResponse.data,
        );

        setUsers(
          usersResponse.data.users,
        );
      } catch (requestError) {
        setError(
          requestError.response
            ?.data?.message ||
            "Failed to load approval requests",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const approveUser =
    async (userId) => {
      setBusyId(userId);
      setError("");

      try {
        await api.patch(
          `/admin/users/${userId}/approve`,
        );

        setUsers((current) =>
          current.filter(
            (item) =>
              item._id !== userId,
          ),
        );

        setSummary((current) => ({
          ...current,

          pendingUsers:
            Math.max(
              current.pendingUsers -
                1,
              0,
            ),

          verifiedUsers:
            current.verifiedUsers +
            1,
        }));
      } catch (requestError) {
        setError(
          requestError.response
            ?.data?.message ||
            "Failed to approve user",
        );
      } finally {
        setBusyId("");
      }
    };

  const removeUser =
    async (userId) => {
      const confirmed =
        window.confirm(
          "Remove this pending user permanently?",
        );

      if (!confirmed) {
        return;
      }

      setBusyId(userId);
      setError("");

      try {
        await api.delete(
          `/admin/users/${userId}`,
        );

        setUsers((current) =>
          current.filter(
            (item) =>
              item._id !== userId,
          ),
        );

        setSummary((current) => ({
          ...current,

          pendingUsers:
            Math.max(
              current.pendingUsers -
                1,
              0,
            ),

          totalUsers:
            Math.max(
              current.totalUsers - 1,
              0,
            ),
        }));
      } catch (requestError) {
        setError(
          requestError.response
            ?.data?.message ||
            "Failed to remove user",
        );
      } finally {
        setBusyId("");
      }
    };

  const handleLogout =
    async () => {
      await logout();

      navigate("/login", {
        replace: true,
      });
    };

  if (loading) {
    return (
      <Loading label="Loading approval requests" />
    );
  }

  const summaryCards = [
    {
      label:
        "Pending requests",

      value:
        summary.pendingUsers,

      icon: Clock3,

      iconClass:
        "bg-amber-50 text-amber-600",
    },

    {
      label:
        "Verified users",

      value:
        summary.verifiedUsers,

      icon: CheckCircle2,

      iconClass:
        "bg-emerald-50 text-emerald-600",
    },

    {
      label:
        "Total users",

      value:
        summary.totalUsers,

      icon: Users,

      iconClass:
        "bg-indigo-50 text-indigo-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-600 text-white">
              <ShieldCheck
                size={22}
              />
            </span>

            <div>
              <h1 className="font-bold text-slate-950">
                LearnFlow Admin
              </h1>

              <p className="text-xs text-slate-500">
                Account approvals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {user.name}
              </p>

              <p className="text-xs text-slate-500">
                {user.email}
              </p>
            </div>

            <button
              className="secondary-button"
              onClick={
                handleLogout
              }
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-600">
              Administration
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              User approvals
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Review new registrations
              before allowing course
              access.
            </p>
          </div>

          <button
            className="secondary-button"
            disabled={refreshing}
            onClick={() =>
              loadData({
                silent: true,
              })
            }
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {summaryCards.map(
            ({
              label,
              value,
              icon: Icon,
              iconClass,
            }) => (
              <motion.div
                key={label}
                className="panel flex items-center gap-4 p-5"
                initial={{
                  opacity: 0,
                  y: 14,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
              >
                <span
                  className={`grid h-12 w-12 place-items-center rounded-2xl ${iconClass}`}
                >
                  <Icon size={21} />
                </span>

                <div>
                  <strong className="block text-2xl text-slate-950">
                    {value}
                  </strong>

                  <span className="text-sm text-slate-500">
                    {label}
                  </span>
                </div>
              </motion.div>
            ),
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="panel mt-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="font-bold text-slate-950">
                Pending registrations
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {users.length} user
                {users.length === 1
                  ? ""
                  : "s"}{" "}
                waiting for approval
              </p>
            </div>

            <UserCheck className="text-indigo-600" />
          </div>

          {!users.length ? (
            <div className="px-5 py-14 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <Check
                  size={26}
                />
              </span>

              <h4 className="mt-4 font-bold text-slate-950">
                All caught up
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                There are no pending
                registrations.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <AnimatePresence
                initial={false}
              >
                {users.map(
                  (
                    pendingUser,
                    index,
                  ) => (
                    <motion.div
                      key={
                        pendingUser._id
                      }
                      layout
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: 30,
                      }}
                      transition={{
                        delay:
                          index *
                          0.03,
                      }}
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                        {pendingUser.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </span>

                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-bold text-slate-900">
                          {
                            pendingUser.name
                          }
                        </h4>

                        <p className="truncate text-sm text-slate-500">
                          {
                            pendingUser.email
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Registered{" "}
                          {new Date(
                            pendingUser.createdAt,
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="primary-button flex-1 sm:flex-none"
                          disabled={
                            busyId ===
                            pendingUser._id
                          }
                          onClick={() =>
                            approveUser(
                              pendingUser._id,
                            )
                          }
                        >
                          <Check
                            size={16}
                          />

                          Approve
                        </button>

                        <button
                          className="secondary-button flex-1 text-red-600 hover:border-red-200 hover:text-red-700 sm:flex-none"
                          disabled={
                            busyId ===
                            pendingUser._id
                          }
                          onClick={() =>
                            removeUser(
                              pendingUser._id,
                            )
                          }
                        >
                          <Trash2
                            size={16}
                          />

                          Remove
                        </button>
                      </div>
                    </motion.div>
                  ),
                )}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}