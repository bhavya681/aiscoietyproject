"use client";

import { useState } from "react";

type PaymentCardProps = {
  maintenanceId?: string;
  amount: number;
  onSuccess?: () => void;
};

export default function PaymentCard({
  maintenanceId,
  amount,
  onSuccess,
}: PaymentCardProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to pay ₹${amount.toLocaleString(
        "en-IN"
      )}?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/maintenance/pay/${maintenanceId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Payment failed."
        );
      }

      setMessage(
        data.message || "Payment successful."
      );

      onSuccess?.();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">
        Amount to pay
      </p>

      <p className="mt-2 text-3xl font-bold text-zinc-900">
        ₹{amount.toLocaleString("en-IN")}
      </p>

      <button
        onClick={handlePayment}
        disabled={loading || amount <= 0}
        className="mt-6 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay Maintenance"}
      </button>

      {message && (
        <p className="mt-4 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
          {message}
        </p>
      )}
    </div>
  );
}