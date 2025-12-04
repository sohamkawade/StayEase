import { MoveRight, CreditCard, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
import { getUserTransactions } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";

const Payment = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userId = user?.id || user?.userId;
        if (!userId) {
          setLoading(false);
          return;
        }

        const response = await getUserTransactions(userId);
        if (response?.status >= 200 && response?.status < 400) {
          const data = response?.data?.data || response?.data || [];
          setTransactions(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const getPaymentStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return <CheckCircle className="text-green-600" size={20} />;
      case "PENDING":
        return <Clock className="text-yellow-600" size={20} />;
      case "FAILED":
        return <XCircle className="text-red-600" size={20} />;
      case "REFUNDED":
        return <RefreshCw className="text-blue-600" size={20} />;
      default:
        return <Clock className="text-gray-600" size={20} />;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-gray-500">Loading transactions...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center mb-3 sm:mb-4 gap-2">
        <NavLink to="/">
          <span className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 transition-all duration-300">
            back to home
          </span>
        </NavLink>
        <MoveRight className="text-gray-500 -rotate-180" size={12} />
        <span className="text-xs sm:text-sm font-semibold">Payments</span>
      </div>

      <div className="flex flex-col w-full bg-gray-200 text-gray-800 p-4 sm:p-6 md:p-10 lg:p-14 rounded-2xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-gray-900 tracking-wide">
            Payment Transactions
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Your payment history</p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {transactions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-4 sm:p-6 text-center text-gray-500 text-sm">
              No transactions found.
            </div>
          ) : (
            transactions.map((txn) => (
              <div
                key={txn.id}
                className="bg-white rounded-2xl shadow p-4 sm:p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="bg-black text-white p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                      <CreditCard size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-black text-sm sm:text-base truncate">
                        {txn.hotelName || "Hotel Booking"}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        {txn.roomType} - Room {txn.roomNumber}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        Transaction ID: {txn.transactionId || "N/A"}
                      </p>
                      {txn.date && (
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          on {formatDate(txn.date)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="text-lg sm:text-xl font-bold text-gray-900">
                      ₹{txn.amount?.toLocaleString() || 0}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${getPaymentStatusColor(
                        txn.paymentStatus
                      )}`}
                    >
                      {getPaymentStatusIcon(txn.paymentStatus)}
                      {txn.paymentStatus || "PENDING"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Payment;
