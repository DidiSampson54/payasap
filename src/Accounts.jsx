
import {
  Wallet,
  Copy,
  Check,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

import { useState } from "react";

function Accounts({ account, user }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!account?.account_number) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        account.nibss_account_number.toString()
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy account number:", error);
    }
  };

  if (!account) {
    return (
      <section className="accounts-page">
        <div className="page-heading">
          <p>Accounts</p>
          <h2>Your account</h2>
        </div>

        <div className="account-loading-card">
          <Wallet size={28} />
          <h3>Account information unavailable</h3>
          <span>
            Your account details could not be loaded.
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="accounts-page">

      <div className="page-heading">
        <p>Accounts</p>
        <h2>Your account</h2>
      </div>

      <div className="account-main-card">

        <div className="account-card-top">

          <div className="account-card-icon">
            <Wallet size={25} />
          </div>

          <span className="account-status">
            <span></span>
            Active
          </span>

        </div>

        <div className="account-balance">
          <span>Available Balance</span>

          <h1>
            ₦
            {Number(account.balance).toLocaleString(
              "en-NG",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </h1>
        </div>

        <div className="account-number-section">

          <span>Account Number</span>

          <div className="account-number-large">

            <strong>{account.nibss_account_number}</strong>

            <button
              type="button"
              onClick={handleCopy}
              title={
                copied
                  ? "Copied"
                  : "Copy account number"
              }
            >
              {copied ? (
                <Check size={17} />
              ) : (
                <Copy size={17} />
              )}
            </button>

          </div>

          {copied && (
            <small>
              Account number copied
            </small>
          )}

        </div>

      </div>

      <div className="account-info-grid">

        <div className="account-info-card">

          <div className="info-icon">
            <CreditCard size={20} />
          </div>

          <div>
            <span>Account Type</span>
            <strong>Savings Account</strong>
          </div>

        </div>

        <div className="account-info-card">

          <div className="info-icon">
            <ShieldCheck size={20} />
          </div>

          <div>
            <span>Account Status</span>
            <strong>Active</strong>
          </div>

        </div>

      </div>

      <div className="account-holder-card">

        <div>
          <span>Account Holder</span>
          <strong>{user?.customer?.name}</strong>
        </div>

        <div>
          <span>Email</span>
          <strong>{user?.customer?.email}</strong>
        </div>

      </div>

    </section>
  );
}

export default Accounts;

