import { useNavigate } from "react-router-dom";
import { XCircle, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="page-shell py-20 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-red-50 shadow-inner"
      >
        <XCircle
          size={54}
          className="text-red-500"
        />
      </motion.div>

      <h1 className="font-display text-5xl font-bold text-slate-900 mb-4">
        Payment Failed
      </h1>

      <p className="text-slate-500 text-lg mb-10">
        Transaction could not be completed.
      </p>

      <div className="flex justify-center">
        <button
          onClick={() => navigate("/checkout")}
          className="btn-primary px-8 py-4"
        >
          <RefreshCcw size={18} />
          Retry Payment
        </button>
      </div>
    </div>
  );
}