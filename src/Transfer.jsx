import {
  Send,
  UserRound,
  Wallet,
  ArrowRight,
} from "lucide-react";

import { useState } from "react";

function Transfer({
  account,
  user,
  onTransferComplete,
  onAddNotification,
}) {
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleTransfer = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!accountNumber || !amount) {
      setError(
        "Receiver account number and amount are required."
      );
      return;
    }

    if (!account) {
      setError("Your account information is unavailable.");
      return;
    }

    if (!user?.customer?.id) {
      setError("Your customer information is unavailable.");
      return;
    }

    const transferAmount = Number(amount);

    if (
      !Number.isFinite(transferAmount) ||
      transferAmount <= 0
    ) {
      setError("Please enter a valid amount.");
      return;
    }

    if (
      accountNumber.trim() ===
      account.nibss_account_number.toString()
    ) {
      setError(
        "You cannot transfer money to your own account."
      );
      return;
    }

    if (
      transferAmount >
      Number(account.balance)
    ) {
      setError("Insufficient balance.");
      return;
    }

    const token =
      localStorage.getItem("payasapToken");

    if (!token) {
      setError("Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://payasap.onrender.com/transfers/intra-bank",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customer_id: user.customer.id,
            sender_account_number:
              account.nibss_account_number,
            receiver_account_number:
              accountNumber.trim(),
            amount: transferAmount,
            narration:
              narration.trim() ||
              "PayASAP transfer",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Transfer failed."
        );
      }

      setMessage(
        "Transfer completed successfully."
      );

      if (onTransferComplete) {
        onTransferComplete();
      }

      if (onAddNotification) {
        onAddNotification(
          "Transfer successful",
          `Your transfer of ₦${transferAmount.toLocaleString(
            "en-NG",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )} was successful.`
        );
      }

      setAccountNumber("");
      setAmount("");
      setNarration("");
    } catch (error) {
      console.error(
        "Transfer error:",
        error
      );

      setError(
        error.message ||
          "Transfer failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="transfer-page">
      <div className="page-heading">
        <p>Transfer</p>

        <h2>
          Send money
        </h2>
      </div>

      <div className="transfer-layout">
        <div className="transfer-card">
          <div className="transfer-card-header">
            <div className="transfer-icon">
              <Send size={23} />
            </div>

            <div>
              <h3>
                Send to PayASAP
              </h3>

              <p>
                Transfer money to another
                PayASAP account.
              </p>
            </div>
          </div>

          <form onSubmit={handleTransfer}>
            <div className="transfer-field">
              <label>
                Receiver Account Number
              </label>

              <div className="input-with-icon">
                <UserRound size={18} />

                <input
                  type="text"
                  value={accountNumber}
                  onChange={(event) =>
                    setAccountNumber(
                      event.target.value
                    )
                  }
                  placeholder="Enter account number"
                  maxLength="10"
                />
              </div>
            </div>

            <div className="transfer-field">
              <label>
                Amount
              </label>

              <div className="input-with-icon">
                <span className="currency-symbol">
                  ₦
                </span>

                <input
                  type="number"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value
                    )
                  }
                  placeholder="0.00"
                  min="1"
                  step="1"
                />
              </div>
            </div>

            <div className="transfer-field">
              <label>
                Narration

                <span>
                  Optional
                </span>
              </label>

              <input
                className="transfer-input"
                type="text"
                value={narration}
                onChange={(event) =>
                  setNarration(
                    event.target.value
                  )
                }
                placeholder="What is this payment for?"
              />
            </div>

            {error && (
              <div className="transfer-message error">
                {error}
              </div>
            )}

            {message && (
              <div className="transfer-message success">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="send-money-button"
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : "Send Money"}

              {!loading && (
                <ArrowRight size={17} />
              )}
            </button>
          </form>
        </div>

        <div className="transfer-balance-card">
          <div className="transfer-balance-icon">
            <Wallet size={22} />
          </div>

          <span>
            Available Balance
          </span>

          <h3>
            ₦
            {account
              ? Number(
                  account.balance
                ).toLocaleString(
                  "en-NG",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )
              : "0.00"}
          </h3>

          <p>
            Money will be deducted from
            your PayASAP account.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Transfer;