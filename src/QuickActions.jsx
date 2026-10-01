import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  Heart,
  MoreHorizontal,
  PiggyBank,
  Smartphone,
  Wallet,
  Wifi,
  Zap,
} from "lucide-react";

import { useState } from "react";

function QuickActions({
  action,
  setAction,
  account,
  user,
  onTransferComplete,
  onAddNotification,
}) {
  const [network, setNetwork] = useState("MTN");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [period, setPeriod] = useState("daily");

  const [receiverAccount, setReceiverAccount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [narration, setNarration] = useState("");

  const [electricityProvider, setElectricityProvider] =
    useState("Ikeja Electricity");
  const [paymentItem, setPaymentItem] = useState("Prepaid");
  const [meterNumber, setMeterNumber] = useState("");

  const [bettingCompany, setBettingCompany] = useState("");
  const [userId, setUserId] = useState("");

  const [saveBoxMode, setSaveBoxMode] = useState("save");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const networks = [
    { name: "MTN", className: "mtn" },
    { name: "Airtel", className: "airtel" },
    { name: "Glo", className: "glo" },
    { name: "9mobile", className: "mobile9" },
  ];

  const airtimeAmounts = [50, 100, 200, 500, 1000, 2000];

  const dataPlans = {
    daily: [
      ["2.5GB", "1 DAY", 750],
      ["20MB", "1 DAY", 25],
      ["110MB", "1 DAY", 50],
      ["230MB", "1 DAY", 118],
      ["500MB", "1 DAY", 350],
      ["1GB", "1 DAY", 500],
    ],
    weekly: [
      ["20GB", "7 DAYS", 5000],
      ["40MB", "7 DAYS", 50],
      ["500MB", "7 DAYS", 500],
      ["1GB", "7 DAYS", 800],
      ["1.5GB", "7 DAYS", 1000],
      ["2GB", "7 DAYS", 200],
    ],
    monthly: [
      ["2GB", "30 DAYS", 1500],
      ["2.7GB", "30 DAYS", 2000],
      ["3.5GB", "30 DAYS", 2500],
      ["7GB", "30 DAYS", 3500],
      ["10GB", "30 DAYS", 4500],
      ["12GB", "30 DAYS", 5500],
    ],
  };

  const bettingCompanies = [
    "SportyBet",
    "iLotBet",
    "EasyWin",
  ];

  const bettingAmounts = [
    100,
    500,
    1000,
    2000,
    5000,
    10000,
  ];

  const electricityProviders = [
    "Ikeja Electricity",
    "Ibadan Electricity",
    "Abuja Electricity",
    "Eko Electricity",
    "Port Harcourt Electricity",
    "Aba Power",
    "Enugu Electricity",
    "Jos Electricity",
    "Kano Electricity",
  ];

  const moreItems = [
    "Fixed Savings",
    "Colab Savings",
    "Ajor",
    "Insurance",
    "Shares",
    "ASAP Loan",
  ];

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const goBack = () => {
    clearMessages();
    setAction(null);
  };

  const handleIntraBank = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!receiverAccount.trim() || !amount) {
      setError(
        "Receiver account number and amount are required."
      );
      return;
    }

    if (!/^\d{10}$/.test(receiverAccount.trim())) {
      setError(
        "Please enter a valid 10-digit account number."
      );
      return;
    }

    if (!account) {
      setError(
        "Your account information is unavailable."
      );
      return;
    }

    if (!user?.customer?.id) {
      setError(
        "Your customer information is unavailable."
      );
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
      receiverAccount.trim() ===
      account.nibss_account_number.toString()
    ) {
      setError(
        "You cannot transfer money to your own account."
      );
      return;
    }

    if (
      transferAmount > Number(account.balance)
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
              receiverAccount.trim(),
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
        "Money sent successfully to the PayASAP account."
      );

      setReceiverAccount("");
      setAmount("");
      setNarration("");

      if (onTransferComplete) {
        await onTransferComplete();
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
    } catch (error) {
      setError(
        error.message ||
          "Transfer failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInterBank = async (event) => {
    event.preventDefault();

    clearMessages();

    if (
      !bankCode.trim() ||
      !receiverAccount.trim() ||
      !amount
    ) {
      setError(
        "Bank code, account number and amount are required."
      );
      return;
    }

    if (!/^\d{10}$/.test(receiverAccount.trim())) {
      setError(
        "Please enter a valid 10-digit account number."
      );
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
      account &&
      transferAmount > Number(account.balance)
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
        "https://payasap.onrender.com/transfers/inter-bank",
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
              receiverAccount.trim(),
            receiver_bank_code:
              bankCode.trim(),
            amount: transferAmount,
            narration:
              narration.trim() ||
              "Inter-bank transfer",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Inter-bank transfer failed."
        );
      }

      setMessage(
        "Inter-bank transfer submitted successfully."
      );

      setReceiverAccount("");
      setBankCode("");
      setAmount("");
      setNarration("");

      if (onTransferComplete) {
        await onTransferComplete();
      }

      if (onAddNotification) {
        onAddNotification(
          "Inter-bank transfer successful",
          `Your transfer of ₦${transferAmount.toLocaleString(
            "en-NG",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )} to another bank was successful.`
        );
      }
    } catch (error) {
      setError(
        error.message ||
          "Inter-bank transfer failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBox = async () => {
    clearMessages();

    const saveAmount = Number(amount);

    if (
      !Number.isFinite(saveAmount) ||
      saveAmount <= 0
    ) {
      setError(
        "Please enter a valid amount to save."
      );
      return;
    }

    if (!account) {
      setError(
        "Your account information is unavailable."
      );
      return;
    }

    if (
      saveAmount > Number(account.balance)
    ) {
      setError("Insufficient funds.");
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
        "https://payasap.onrender.com/accounts/savebox",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: saveAmount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to move money to SaveBox."
        );
      }

      setAmount("");

      setMessage(
        `₦${saveAmount.toLocaleString(
          "en-NG",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )} moved to SaveBox successfully.`
      );

      if (onTransferComplete) {
        await onTransferComplete();
      }
    } catch (error) {
      setError(
        error.message ||
          "Failed to move money to SaveBox."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawFromSaveBox = async () => {
    clearMessages();

    const withdrawAmount = Number(amount);

    const saveBoxBalance = Number(
      account?.savebox_balance || 0
    );

    if (
      !Number.isFinite(withdrawAmount) ||
      withdrawAmount <= 0
    ) {
      setError(
        "Please enter a valid amount to withdraw."
      );
      return;
    }

    if (!account) {
      setError(
        "Your account information is unavailable."
      );
      return;
    }

    if (withdrawAmount > saveBoxBalance) {
      setError("Insufficient SaveBox balance.");
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
        "https://payasap.onrender.com/accounts/savebox/withdraw",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: withdrawAmount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to withdraw from SaveBox."
        );
      }

      setAmount("");

      setMessage(
        `₦${withdrawAmount.toLocaleString(
          "en-NG",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )} withdrawn from SaveBox successfully.`
      );

      if (onTransferComplete) {
        await onTransferComplete();
      }
    } catch (error) {
      setError(
        error.message ||
          "Failed to withdraw from SaveBox."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPayment = (label) => {
    clearMessages();

    if (!phone || phone.length !== 11) {
      setError(
        "Please enter an 11-digit phone number."
      );
      return;
    }

    if (!amount) {
      setError(
        "Please select or enter an amount."
      );
      return;
    }

    setMessage(
      `${label} is ready for demo checkout. No real payment was made.`
    );
  };

  const handleDataPayment = () => {
    clearMessages();

    if (!phone || phone.length !== 11) {
      setError(
        "Please enter an 11-digit phone number."
      );
      return;
    }

    if (!selectedPlan) {
      setError("Please select a data plan.");
      return;
    }

    setMessage(
      `${selectedPlan[0]} ${network} data selected for demo checkout. No real purchase was made.`
    );
  };

  const handleBettingPayment = () => {
    clearMessages();

    if (!bettingCompany) {
      setError(
        "Please select a betting company."
      );
      return;
    }

    if (!userId.trim()) {
      setError("Please enter your user ID.");
      return;
    }

    if (!amount) {
      setError(
        "Please select or enter an amount."
      );
      return;
    }

    setMessage(
      `${bettingCompany} funding is ready for demo checkout. No real payment was made.`
    );
  };

  const handleElectricityPayment = () => {
    clearMessages();

    if (!meterNumber.trim()) {
      setError(
        "Please enter your meter or account number."
      );
      return;
    }

    if (!amount) {
      setError(
        "Please select or enter an amount."
      );
      return;
    }

    setMessage(
      `${electricityProvider} payment is ready for demo checkout. No real payment was made.`
    );
  };

  if (!action) {
    return null;
  }

  const ActionHeader = ({
    title,
    subtitle,
    icon,
  }) => (
    <div className="quick-action-heading">
      <button
        type="button"
        className="quick-back-button"
        onClick={goBack}
      >
        <ArrowLeft size={18} />
      </button>

      <div className="quick-heading-icon">
        {icon}
      </div>

      <div>
        <p>PayASAP</p>
        <h2>{title}</h2>
        <span>{subtitle}</span>
      </div>
    </div>
  );

  const MessageBox = () => (
    <>
      {error && (
        <div className="quick-message error">
          {error}
        </div>
      )}

      {message && (
        <div className="quick-message success">
          <Check size={16} />
          {message}
        </div>
      )}
    </>
  );

  const NetworkSelector = () => (
    <div className="network-selector">
      {networks.map((item) => (
        <button
          type="button"
          key={item.name}
          className={`network-option ${
            network === item.name
              ? "selected"
              : ""
          }`}
          onClick={() => {
            setNetwork(item.name);
            clearMessages();
          }}
        >
          <div
            className={`network-logo ${item.className}`}
          >
            {item.name === "9mobile"
              ? "9"
              : item.name.charAt(0)}
          </div>

          <span>{item.name}</span>
        </button>
      ))}
    </div>
  );

  if (action === "send") {
    return (
      <section className="quick-action-page">
        <ActionHeader
          title="Send to PayASAP"
          subtitle="Transfer money to another PayASAP account"
          icon={<Smartphone size={22} />}
        />

        <div className="quick-action-card">
          <form onSubmit={handleIntraBank}>
            <div className="quick-form-field">
              <label>
                Receiver Account Number
              </label>

              <input
                type="text"
                inputMode="numeric"
                value={receiverAccount}
                onChange={(event) =>
                  setReceiverAccount(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10)
                  )
                }
                placeholder="Enter PayASAP account number"
                maxLength="10"
              />
            </div>

            <div className="quick-form-field">
              <label>Amount</label>

              <input
                type="number"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder="₦0.00"
                min="1"
              />
            </div>

            <div className="quick-form-field">
              <label>Narration</label>

              <input
                value={narration}
                onChange={(event) =>
                  setNarration(event.target.value)
                }
                placeholder="What is this payment for?"
              />
            </div>

            <MessageBox />

            <button
              type="submit"
              className="quick-primary-button"
              disabled={
                loading ||
                !/^\d{10}$/.test(
                  receiverAccount.trim()
                ) ||
                !amount ||
                Number(amount) <= 0
              }
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
      </section>
    );
  }

  if (action === "bank") {
    return (
      <section className="quick-action-page">
        <ActionHeader
          title="Send to Other Banks"
          subtitle="Make an inter-bank transfer"
          icon={<Building2 size={22} />}
        />

        <div className="quick-action-card">
          <form onSubmit={handleInterBank}>
            <div className="quick-form-field">
              <label>Bank Code</label>

              <input
                type="text"
                inputMode="numeric"
                value={bankCode}
                onChange={(event) =>
                  setBankCode(
                    event.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                placeholder="Enter bank code"
              />
            </div>

            <div className="quick-form-field">
              <label>Account Number</label>

              <input
                type="text"
                inputMode="numeric"
                value={receiverAccount}
                onChange={(event) =>
                  setReceiverAccount(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10)
                  )
                }
                placeholder="Enter beneficiary account number"
                maxLength="10"
              />
            </div>

            <div className="quick-form-field">
              <label>Amount</label>

              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                placeholder="₦0.00"
                minLength="1"
              />
            </div>

            <div className="quick-form-field">
              <label>Narration</label>

              <input
                value={narration}
                onChange={(event) =>
                  setNarration(event.target.value)
                }
                placeholder="Optional narration"
              />
            </div>

            <MessageBox />

            <button
              type="submit"
              className="quick-primary-button"
              disabled={
                loading ||
                !bankCode.trim() ||
                !/^\d{10}$/.test(
                  receiverAccount.trim()
                ) ||
                !amount ||
                Number(amount) <= 0
              }
            >
              {loading
                ? "Processing..."
                : "Send to Bank"}

              {!loading && (
                <ArrowRight size={17} />
              )}
            </button>
          </form>
        </div>
      </section>
    );
  }

  if (action === "savebox") {
    const mainBalance = Number(
      account?.balance || 0
    );

    const saveBoxBalance = Number(
      account?.savebox_balance || 0
    );

    const enteredAmount = Number(
      amount || 0
    );

    const isSaving = saveBoxMode === "save";

    const availableBalance = isSaving
      ? mainBalance
      : saveBoxBalance;

    return (
      <section className="quick-action-page">
        <ActionHeader
          title="SaveBox"
          subtitle={
            isSaving
              ? "Move money aside for your savings"
              : "Move your savings back to your main account"
          }
          icon={<PiggyBank size={22} />}
        />

        <div className="quick-action-card savebox-action-card">
          <div className="savebox-big-icon">
            <PiggyBank size={32} />
          </div>

          <p className="savebox-current-label">
            Current SaveBox balance
          </p>

          <h1>
            ₦
            {saveBoxBalance.toLocaleString(
              "en-NG",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </h1>

          <div className="savebox-main-balance">
            <span>Main balance</span>

            <strong>
              ₦
              {mainBalance.toLocaleString(
                "en-NG",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </strong>
          </div>

          <div className="savebox-mode-buttons">
            <button
              type="button"
              className={
                isSaving ? "active" : ""
              }
              onClick={() => {
                setSaveBoxMode("save");
                setAmount("");
                clearMessages();
              }}
            >
              Save Money
            </button>

            <button
              type="button"
              className={
                !isSaving ? "active" : ""
              }
              onClick={() => {
                setSaveBoxMode("withdraw");
                setAmount("");
                clearMessages();
              }}
            >
              Withdraw
            </button>
          </div>

          <div className="quick-form-field">
            <label>
              {isSaving
                ? "Amount to save"
                : "Amount to withdraw"}
            </label>

            <input
              type="number"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder="₦0.00"
              min="1"
              max={availableBalance}
            />
          </div>

          {enteredAmount > availableBalance &&
            enteredAmount > 0 && (
              <div className="quick-message error">
                Insufficient{" "}
                {isSaving
                  ? "funds"
                  : "SaveBox balance"}
                . Available: ₦
                {availableBalance.toLocaleString(
                  "en-NG",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
                .
              </div>
            )}

          <MessageBox />

          <button
            type="button"
            className="quick-primary-button"
            disabled={
              loading ||
              !amount ||
              enteredAmount <= 0 ||
              enteredAmount > availableBalance
            }
            onClick={
              isSaving
                ? handleSaveBox
                : handleWithdrawFromSaveBox
            }
          >
            {loading
              ? "Processing..."
              : isSaving
              ? "Move to SaveBox"
              : "Withdraw to Main Account"}

            {!loading && (
              <ArrowRight size={17} />
            )}
          </button>
        </div>
      </section>
    );
  }

  if (action === "airtime") {
    return (
      <section className="quick-action-page">
        <ActionHeader
          title="Airtime"
          subtitle="Top up your phone"
          icon={<Smartphone size={22} />}
        />

        <div className="quick-action-card">
          <NetworkSelector />

          <div className="quick-form-field">
            <label>Phone Number</label>

            <input
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 11)
                )
              }
              placeholder="Phone number"
              maxLength="11"
            />
          </div>

          <label className="quick-section-label">
            Top up airtime
          </label>

          <div className="amount-grid">
            {airtimeAmounts.map((item) => (
              <button
                type="button"
                key={item}
                className={`amount-option ${
                  amount === String(item)
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setAmount(String(item))
                }
              >
                ₦
                {item.toLocaleString("en-NG")}
              </button>
            ))}
          </div>

          <div className="custom-payment-row">
            <input
              type="number"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder="₦50 - ₦50,000"
              min="50"
              max="50000"
            />

            <button
              type="button"
              className="quick-primary-button small"
              disabled={
                !phone ||
                phone.length !== 11 ||
                !amount ||
                Number(amount) < 50 ||
                Number(amount) > 50000
              }
              onClick={() =>
                handleDemoPayment("Airtime")
              }
            >
              Pay
            </button>
          </div>

          <MessageBox />
        </div>
      </section>
    );
  }

  if (action === "data") {
    return (
      <section className="quick-action-page">
        <ActionHeader
          title="Data"
          subtitle="Choose a data plan"
          icon={<Wifi size={22} />}
        />

        <div className="quick-action-card">
          <NetworkSelector />

          <div className="quick-form-field">
            <label>Phone Number</label>

            <input
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 11)
                )
              }
              placeholder="Phone number"
              maxLength="11"
            />
          </div>

          <div className="plan-tabs">
            {[
              "daily",
              "weekly",
              "monthly",
            ].map((item) => (
              <button
                type="button"
                key={item}
                className={
                  period === item
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setPeriod(item);
                  setSelectedPlan(null);
                }}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="data-plan-grid">
            {dataPlans[period].map((plan) => (
              <button
                type="button"
                key={`${plan[0]}-${plan[2]}`}
                className={`data-plan ${
                  selectedPlan === plan
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setSelectedPlan(plan)
                }
              >
                <strong>{plan[0]}</strong>
                <span>{plan[1]}</span>
                <b>
                  ₦
                  {plan[2].toLocaleString(
                    "en-NG"
                  )}
                </b>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="quick-primary-button"
            disabled={
              !selectedPlan ||
              phone.length !== 11
            }
            onClick={handleDataPayment}
          >
            Buy Data
            <ArrowRight size={17} />
          </button>

          <MessageBox />
        </div>
      </section>
    );
  }

  if (action === "betting") {
    return (
      <section className="quick-action-page">
        <ActionHeader
          title="Betting"
          subtitle="Fund your betting wallet"
          icon={<Heart size={22} />}
        />

        <div className="quick-action-card">
          <div className="betting-grid">
            {bettingCompanies.map(
              (company) => (
                <button
                  type="button"
                  key={company}
                  className={`betting-company ${
                    bettingCompany === company
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => {
                    setBettingCompany(company);
                    setAmount("");
                    clearMessages();
                  }}
                >
                  <div className="betting-logo">
                    {company
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <span>{company}</span>
                </button>
              )
            )}
          </div>

          <div className="quick-form-field">
            <label>User ID</label>

            <input
              value={userId}
              onChange={(event) =>
                setUserId(event.target.value)
              }
              placeholder={
                bettingCompany
                  ? `${bettingCompany} phone number`
                  : "Select a company first"
              }
              disabled={!bettingCompany}
            />
          </div>

          <label className="quick-section-label">
            Select Amount
          </label>

          <div className="amount-grid">
            {bettingAmounts.map((item) => (
              <button
                type="button"
                key={item}
                className={`amount-option ${
                  amount === String(item)
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setAmount(String(item))
                }
                disabled={!bettingCompany}
              >
                ₦
                {item.toLocaleString("en-NG")}
              </button>
            ))}
          </div>

          <div className="custom-payment-row">
            <input
              type="number"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder="₦100 - ₦1,000,000"
              min="100"
              max="1000000"
              disabled={!bettingCompany}
            />

            <button
              type="button"
              className="quick-primary-button small"
              disabled={
                !bettingCompany ||
                !userId.trim() ||
                !amount ||
                Number(amount) < 100 ||
                Number(amount) > 1000000
              }
              onClick={handleBettingPayment}
            >
              Pay
            </button>
          </div>

          <MessageBox />
        </div>
      </section>
    );
  }

  if (action === "electricity") {
    return (
      <section className="quick-action-page">
        <ActionHeader
          title="Electricity"
          subtitle="Pay your electricity bill"
          icon={<Zap size={22} />}
        />

        <div className="quick-action-card">
          <div className="quick-form-field">
            <label>Electricity Provider</label>

            <div className="select-wrapper">
              <select
                value={electricityProvider}
                onChange={(event) =>
                  setElectricityProvider(
                    event.target.value
                  )
                }
              >
                {electricityProviders.map(
                  (provider) => (
                    <option
                      key={provider}
                      value={provider}
                    >
                      {provider}
                    </option>
                  )
                )}
              </select>

              <ChevronDown size={17} />
            </div>
          </div>

          <div className="quick-form-field">
            <label>Payment Item</label>

            <div className="select-wrapper">
              <select
                value={paymentItem}
                onChange={(event) =>
                  setPaymentItem(
                    event.target.value
                  )
                }
              >
                <option value="Prepaid">
                  Prepaid
                </option>

                <option value="Postpaid">
                  Postpaid
                </option>
              </select>

              <ChevronDown size={17} />
            </div>
          </div>

          <div className="quick-form-field">
            <label>
              Meter / Account Number
            </label>

            <input
              value={meterNumber}
              onChange={(event) =>
                setMeterNumber(
                  event.target.value
                )
              }
              placeholder="Enter Meter / Account Number"
            />
          </div>

          <label className="quick-section-label">
            Select Amount
          </label>

          <div className="amount-grid">
            {[
              1000,
              2000,
              3000,
              5000,
              10000,
              50000,
            ].map((item) => (
              <button
                type="button"
                key={item}
                className={`amount-option ${
                  amount === String(item)
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setAmount(String(item))
                }
              >
                ₦
                {item.toLocaleString("en-NG")}
              </button>
            ))}
          </div>

          <div className="custom-payment-row">
            <input
              type="number"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder="₦100 - ₦50,000"
              min="100"
              max="50000"
            />

            <button
              type="button"
              className="quick-primary-button small"
              disabled={
                !meterNumber.trim() ||
                !amount ||
                Number(amount) < 100 ||
                Number(amount) > 50000
              }
              onClick={
                handleElectricityPayment
              }
            >
              Pay
            </button>
          </div>

          <MessageBox />
        </div>
      </section>
    );
  }

  if (action === "more") {
    return (
      <section className="quick-action-page">
        <ActionHeader
          title="More"
          subtitle="Explore more PayASAP services"
          icon={<MoreHorizontal size={22} />}
        />

        <div className="more-services-grid">
          {moreItems.map((item) => (
            <button
              type="button"
              className="more-service-card"
              key={item}
              onClick={() => {
                clearMessages();

                setMessage(
                  `${item} is available in the PayASAP service menu.`
                );
              }}
            >
              <div className="more-service-icon">
                {item === "Fixed Savings" && (
                  <PiggyBank size={21} />
                )}

                {item === "Colab Savings" && (
                  <Wallet size={21} />
                )}

                {item === "Ajor" && (
                  <Heart size={21} />
                )}

                {item === "Insurance" && (
                  <Check size={21} />
                )}

                {item === "Shares" && (
                  <CreditCard size={21} />
                )}

                {item === "ASAP Loan" && (
                  <ArrowRight size={21} />
                )}
              </div>

              <strong>{item}</strong>

              <ArrowRight size={16} />
            </button>
          ))}
        </div>

        <MessageBox />
      </section>
    );
  }

  return null;
}

export default QuickActions;