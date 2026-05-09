import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Receipt, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const payment = state?.payment;
  const order = state?.order;

  return (
    <div className="page-shell py-20 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-emerald-50 shadow-inner"
      >
        <CheckCircle2
          size={54}
          className="text-emerald-500"
        />
      </motion.div>

      <h1 className="font-display text-5xl font-bold text-slate-900 mb-4">
        Payment Successful
      </h1>

      <p className="text-slate-500 text-lg mb-10">
        Your payment was completed successfully.
      </p>

      <div className="surface-panel max-w-2xl mx-auto p-8 text-left">
        <div className="space-y-5">

          <div className="flex justify-between">
            <span className="text-slate-500">
              Order ID
            </span>
            <span className="font-bold">
              {order?._id}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">
              Transaction ID
            </span>
            <span className="font-bold">
              {payment?.transactionId}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">
              Payment Method
            </span>
            <span className="font-bold capitalize">
              {payment?.paymentMethod}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">
              Payment Status
            </span>
            <span className="font-bold text-emerald-600">
              Paid
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">
              Total Amount
            </span>
            <span className="font-bold text-[#FF4F40]">
              Rs. {payment?.amount?.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <button
            onClick={() => navigate("/orders")}
            className="btn-primary py-4"
          >
            <Receipt size={18} />
            View Orders
          </button>

          <button
            onClick={() => navigate("/restaurants")}
            className="rounded-2xl border border-slate-200 py-4 font-bold hover:bg-slate-50 transition"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}