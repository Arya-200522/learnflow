import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock3,
} from "lucide-react";

export default function AccessExpiryBadge({
  expiresAt,
  className = "",
}) {
  if (!expiresAt) {
    return null;
  }

  const expiryDate = new Date(expiresAt);

  if (Number.isNaN(expiryDate.getTime())) {
    return null;
  }

  const remainingMilliseconds =
    expiryDate.getTime() - Date.now();

  const remainingDays = Math.max(
    0,
    Math.ceil(
      remainingMilliseconds /
        (1000 * 60 * 60 * 24),
    ),
  );

  const isExpired = remainingMilliseconds <= 0;
  const isExpiringSoon =
    !isExpired && remainingDays <= 30;

  const formattedDate =
    expiryDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });

  let badgeStyles =
    "border-emerald-200 bg-emerald-50 text-emerald-700";

  if (isExpiringSoon) {
    badgeStyles =
      "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (isExpired) {
    badgeStyles =
      "border-red-200 bg-red-50 text-red-700";
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 6,
        scale: 0.97,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.25,
      }}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm ${badgeStyles} ${className}`}
      title={`${remainingDays} days of access remaining`}
    >
      {isExpiringSoon || isExpired ? (
        <Clock3 className="h-3.5 w-3.5" />
      ) : (
        <CalendarDays className="h-3.5 w-3.5" />
      )}

      <span>
        {isExpired
          ? `Expired on ${formattedDate}`
          : `Access until ${formattedDate}`}
      </span>

      {!isExpired && (
        <span className="opacity-70">
          · {remainingDays} days left
        </span>
      )}
    </motion.div>
  );
}