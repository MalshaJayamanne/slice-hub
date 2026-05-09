import { useEffect, useMemo, useState } from "react";
import {
  Receipt,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

import paymentAPI from "../api/paymentAPI";
import {
  WorkspaceEmptyState,
  WorkspaceErrorState,
  WorkspaceLoadingState,
  WorkspacePage,
  WorkspaceSidebar,
  WorkspaceStat,
} from "../components/WorkspaceScaffold";

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const formatDate = (value) =>
  new Date(value).toLocaleString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await paymentAPI.getPaymentHistory();
      setPayments(Array.isArray(response?.data) ? response.data : []);
    } catch (fetchError) {
      setPayments([]);
      setError(
        fetchError?.response?.data?.message ||
          "Failed to load your payment logs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const summary = useMemo(
    () => ({
      totalPaid: payments
        .filter((p) => p.paymentStatus === "paid")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0),
      count: payments.length,
      successCount: payments.filter((p) => p.paymentStatus === "paid").length,
      failedCount: payments.filter((p) => p.paymentStatus !== "paid").length,
    }),
    [payments]
  );

  const sidebarNote = loading
    ? "Synchronizing your transaction ledger with the live payment gateway records."
    : error
    ? "Payment verification is temporarily offline. Please refresh to sync."
    : payments.length > 0
    ? `You have ${summary.successCount} successful transactions recorded in your digital ledger.`
    : "Once you complete an order payment, the transaction details will appear here.";

  return (
    <WorkspacePage
      sidebar={
        <WorkspaceSidebar
          icon={CreditCard}
          title="Payments"
          subtitle="A dedicated customer workspace for tracking transaction logs, refunds, and order billing."
          note={sidebarNote}
        >
          {!loading && !error && payments.length > 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                Wallet Outflow
              </p>
              <p className="font-display mt-3 text-2xl font-bold tracking-tight text-[#FF4F40]">
                {formatCurrency(summary.totalPaid)}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Total amount successfully processed for your verified orders.
              </p>
            </div>
          ) : null}
        </WorkspaceSidebar>
      }
      eyebrow="Financial Workspace"
      title="Payment History"
      description="Review your platform transaction logs, including status updates and associated order IDs for every checkout."
    >
      {loading ? (
        <WorkspaceLoadingState
          title="Loading payment logs"
          message="Reconciling your wallet transactions with the platform order history."
        />
      ) : error ? (
        <WorkspaceErrorState
          title="Payment history unavailable"
          message={error}
          onAction={fetchPayments}
        />
      ) : payments.length === 0 ? (
        <WorkspaceEmptyState
          title="No transactions yet"
          message="Your payment logs will appear here as soon as you complete your first order checkout."
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <WorkspaceStat
              label="Total Transactions"
              value={summary.count}
              hint="Logs recorded for this account"
            />
            <WorkspaceStat
              label="Successful"
              value={summary.successCount}
              hint="Payments confirmed"
              tone="success"
            />
            <WorkspaceStat
              label="Failed/Pending"
              value={summary.failedCount}
              hint="Incomplete transactions"
              tone="warning"
            />
          </div>

          <div className="space-y-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              Transaction Ledger
            </p>

            {payments.map((payment, index) => (
              <motion.div
                key={payment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="surface-panel p-6 shadow-sm"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 flex-wrap items-center gap-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 shadow-inner">
                      <Receipt size={24} />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-display text-lg font-bold text-slate-900">
                          {payment.paymentMethod === "card"
                            ? "Credit Card Payment"
                            : "Cash on Delivery"}
                        </h4>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                            payment.paymentStatus === "paid"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {payment.paymentStatus === "paid" ? (
                            <>
                              <CheckCircle2 size={10} />
                              Confirmed
                            </>
                          ) : (
                            <>
                              <XCircle size={10} />
                              Failed
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-500">
                        TXN: {payment.transactionId}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 lg:flex lg:items-center lg:gap-12 lg:text-right">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Date
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-700 lg:justify-end">
                        <Clock size={14} className="text-slate-300" />
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Amount
                      </p>
                      <p className="mt-1 font-display text-2xl font-bold text-[#FF4F40]">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </WorkspacePage>
  );
}