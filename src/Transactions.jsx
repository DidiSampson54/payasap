import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Receipt,
  RefreshCw,
} from "lucide-react";

import { useEffect, useState } from "react";

function Transactions({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState(null);

  const fetchTransactions = async () => {
    const token = localStorage.getItem("payasapToken");

    if (!token) {
      setError("Please log in again.");
      setLoading(false);
      return;
    }

    if (!user?.customer?.id) {
      setError("Customer information is unavailable.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://payasap.onrender.com/customers/${user.customer.id}/transactions`,
      {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load transactions."
        );
      }

      setTransactions(data.transactions || []);
    } catch (error) {
      console.error(
        "Transaction history error:",
        error
      );

      setError(
        error.message ||
          "Failed to load transaction history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const formatAmount = (amount) => {
    return Number(amount).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionType = (transaction) => {
    if (transaction.transfer_type) {
      return transaction.transfer_type.replace(
        /_/g,
        " "
      );
    }

    if (transaction.direction === "INCOMING") {
      return "Money received";
    }

    return "Money sent";
  };

  if (selectedTransaction) {
    const transaction = selectedTransaction;

    const isIncoming =
      transaction.direction === "INCOMING";

    const isSuccessful =
      transaction.status === "SUCCESS";

    return (
      <section className="transactions-page">
        <div className="page-heading">
          <p>Transactions</p>
          <h2>Transaction details</h2>
        </div>

        <div className="transaction-details-card">
          <button
            type="button"
            className="transaction-back-button"
            onClick={() =>
              setSelectedTransaction(null)
            }
          >
            <ArrowLeft size={17} />
            Back to transactions
          </button>

          <div className="transaction-detail-header">
            <div
              className={`transaction-detail-icon ${
                isIncoming
                  ? "incoming"
                  : "outgoing"
              }`}
            >
              {isIncoming ? (
                <ArrowDownLeft size={25} />
              ) : (
                <ArrowUpRight size={25} />
              )}
            </div>

            <div>
              <p>
                {isIncoming
                  ? "Money received"
                  : "Money sent"}
              </p>

              <h3>
                {transaction.narration ||
                  getTransactionType(transaction)}
              </h3>
            </div>
          </div>

          <div className="transaction-detail-amount">
            <span>Amount</span>

            <strong
              className={
                isIncoming
                  ? "incoming-amount"
                  : "outgoing-amount"
              }
            >
              {isIncoming ? "+" : "-"}₦
              {formatAmount(transaction.amount)}
            </strong>

            <span
              className={`transaction-status ${
                isSuccessful
                  ? "success"
                  : "pending"
              }`}
            >
              {transaction.status}
            </span>
          </div>

          <div className="transaction-detail-info">
            <div className="transaction-detail-row">
              <span>Transaction ID</span>

              <strong>
                {transaction.transaction_reference ||
                  "N/A"}
              </strong>
            </div>

            <div className="transaction-detail-row">
              <span>Transaction type</span>

              <strong>
                {getTransactionType(transaction)}
              </strong>
            </div>

            <div className="transaction-detail-row">
              <span>Date</span>

              <strong>
                {formatDate(
                  transaction.created_at
                )}
              </strong>
            </div>

            <div className="transaction-detail-row">
              <span>Time</span>

              <strong>
                {formatTime(
                  transaction.created_at
                )}
              </strong>
            </div>

            {transaction.receiver_account_number && (
              <div className="transaction-detail-row">
                <span>Receiver account</span>

                <strong>
                  {
                    transaction.receiver_account_number
                  }
                </strong>
              </div>
            )}

            {transaction.receiver_bank_code && (
              <div className="transaction-detail-row">
                <span>Bank code</span>

                <strong>
                  {transaction.receiver_bank_code}
                </strong>
              </div>
            )}

            {transaction.provider_reference && (
              <div className="transaction-detail-row">
                <span>Provider reference</span>

                <strong>
                  {transaction.provider_reference}
                </strong>
              </div>
            )}

            {transaction.narration && (
              <div className="transaction-detail-row">
                <span>Narration</span>

                <strong>
                  {transaction.narration}
                </strong>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="transactions-page">
      <div className="page-heading">
        <p>Transactions</p>
        <h2>Transaction history</h2>
      </div>

      <div className="transactions-card">
        <div className="transactions-header">
          <div>
            <h3>Recent transactions</h3>

            <span>
              Your latest account activity
            </span>
          </div>

          <button
            type="button"
            className="refresh-transactions-button"
            onClick={() => {
              setLoading(true);
              setError("");
              fetchTransactions();
            }}
            title="Refresh transactions"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        {loading && (
          <div className="transactions-state">
            <RefreshCw size={22} />

            <p>
              Loading transactions...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="transactions-state error">
            <p>{error}</p>
          </div>
        )}

        {!loading &&
          !error &&
          transactions.length === 0 && (
            <div className="transactions-state">
              <Receipt size={28} />

              <h3>
                No transactions yet
              </h3>

              <p>
                Your account transactions
                will appear here.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          transactions.length > 0 && (
            <div className="transaction-list">
              {transactions.map((transaction) => {
                const isIncoming =
                  transaction.direction ===
                  "INCOMING";

                const isSuccessful =
                  transaction.status ===
                  "SUCCESS";

                return (
                  <button
                    type="button"
                    className="transaction-item"
                    key={
                      transaction.transaction_reference
                    }
                    onClick={() =>
                      setSelectedTransaction(
                        transaction
                      )
                    }
                  >
                    <div
                      className={`transaction-icon ${
                        isIncoming
                          ? "incoming"
                          : "outgoing"
                      }`}
                    >
                      {isIncoming ? (
                        <ArrowDownLeft
                          size={18}
                        />
                      ) : (
                        <ArrowUpRight
                          size={18}
                        />
                      )}
                    </div>

                    <div className="transaction-details">
                      <strong>
                        {transaction.narration ||
                          (isIncoming
                            ? "Money received"
                            : "Money sent")}
                      </strong>

                      <span>
                        {isIncoming
                          ? "Money received"
                          : "Money sent"}

                        {" • "}

                        {formatDate(
                          transaction.created_at
                        )}

                        {" • "}

                        {formatTime(
                          transaction.created_at
                        )}
                      </span>
                    </div>

                    <div className="transaction-amount-section">
                      <strong
                        className={
                          isIncoming
                            ? "incoming-amount"
                            : "outgoing-amount"
                        }
                      >
                        {isIncoming ? "+" : "-"}₦
                        {formatAmount(
                          transaction.amount
                        )}
                      </strong>

                      <span
                        className={`transaction-status ${
                          isSuccessful
                            ? "success"
                            : "pending"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
      </div>
    </section>
  );
}

export default Transactions;