import { motion } from "framer-motion";

export default function Loading({ label = "Loading" }) {
  return (
    <div className="grid min-h-[280px] place-items-center text-slate-500">
      <div className="flex flex-col items-center gap-3">
        <motion.div
          className="h-9 w-9 rounded-full border-4 border-indigo-100 border-t-indigo-600"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}
