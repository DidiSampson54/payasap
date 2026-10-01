import "./App.css";

import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Receipt,
  Send,
  Plus,
  PiggyBank,
  Bell,
  UserRound,
  Wifi,
  Smartphone,
  ArrowRight,
  CreditCard,
  Heart,
  Zap,
  MoreHorizontal,
  Copy,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

import { useState, useEffect } from "react";

import Login from "./Login";
import Register from "./Register";
import Onboarding from "./Onboarding";
import Accounts from "./Accounts";
import Transfer from "./Transfer";
import Transactions from "./Transactions";
import QuickActions from "./QuickActions";

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationPopup, setNotificationPopup] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [quickAction, setQuickAction] = useState(null);
  const [showMainBalance, setShowMainBalance] = useState(true);
  const [showSaveBoxBalance, setShowSaveBoxBalance] = useState(true);

  const [profile, setProfile] = useState(null);
const [showBvn, setShowBvn] = useState(false);
const [showNin, setShowNin] = useState(false);

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  ).length;

  useEffect(() => {
    const savedUser = localStorage.getItem("payasapUser");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to restore user:", error);
        localStorage.removeItem("payasapUser");
        localStorage.removeItem("payasapToken");
      }
    }
  }, []);

  const fetchProfile = async () => {
  const token = localStorage.getItem("payasapToken");

  if (!token) {
    return;
  }

  try {
    const response = await fetch(
      "https://payasap.onrender.com/customers/profile",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch profile"
      );
    }

    setProfile(data.customer);
  } catch (error) {
    console.error("Profile fetch error:", error);
  }
};

  const fetchAccount = async () => {
    const token = localStorage.getItem("payasapToken");

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        "https://payasap.onrender.com/accounts/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 404) {
        setAccount(null);
        setShowOnboarding(true);
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch account"
        );
      }

      setAccount(data.account);
      setShowOnboarding(false);
    } catch (error) {
      console.error("Account fetch error:", error);
    }
  };

  const fetchTransactions = async () => {
    const token = localStorage.getItem("payasapToken");

    if (!token || !user?.customer?.id) {
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
          data.message || "Failed to fetch transactions"
        );
      }

      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Transaction fetch error:", error);
    }
  };

useEffect(() => {
  if (user) {
    fetchAccount();
    fetchTransactions();
    fetchProfile();
  }
}, [user]);

  const handleLogin = (data) => {
    localStorage.setItem("payasapToken", data.token);

    localStorage.setItem(
      "payasapUser",
      JSON.stringify(data)
    );

    setUser(data);
    setShowRegister(false);
    setShowOnboarding(false);
    setActivePage("dashboard");
    setQuickAction(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("payasapToken");
    localStorage.removeItem("payasapUser");

    setUser(null);
    setAccount(null);
    setTransactions([]);

    setShowRegister(false);
    setShowOnboarding(false);
    setCopied(false);
    setQuickAction(null);
    setActivePage("dashboard");
  };

  const handleRegister = () => {
    setShowRegister(false);
  };

  const handleOnboardingComplete = (newAccount) => {
    setAccount(newAccount);
    setShowOnboarding(false);
    setActivePage("dashboard");

    fetchTransactions();
  };

  const handleTransferComplete = async () => {
    await fetchAccount();
    await fetchTransactions();
  };

  const handleCopyAccountNumber = async () => {
    if (!account?.nibss_account_number) {
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
      console.error(
        "Failed to copy account number:",
        error
      );
    }
  };

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

  const getTransactionTitle = (transaction) => {
    if (transaction.narration) {
      return transaction.narration;
    }

    if (transaction.transfer_type === "INTRA_BANK") {
      return "PayASAP transfer";
    }

    if (transaction.transfer_type === "INTER_BANK") {
      return "Bank transfer";
    }

    return "Transaction";
  };

  const openQuickAction = (action) => {
    setQuickAction(action);
    setActivePage("quick-action");
  };

  const addNotification = (title, message) => {
    const notification = {
      id: Date.now(),
      title,
      message,
      read: false,
      createdAt: new Date(),
    };

    setNotifications((currentNotifications) => [
      notification,
      ...currentNotifications,
    ]);

    setNotificationPopup(notification);

    setTimeout(() => {
      setNotificationPopup(null);
    }, 5000);
  };

  const openNotification = (notificationId) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  if (showRegister) {
    return (
      <Register
        onRegister={handleRegister}
        onBackToLogin={() => setShowRegister(false)}
      />
    );
  }

  if (!user) {
    return (
      <Login
        onLogin={handleLogin}
        onCreateAccount={() => setShowRegister(true)}
      />
    );
  }

  if (showOnboarding) {
    return (
      <Onboarding
        onVerified={handleOnboardingComplete}
      />
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">PayASAP</div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-item ${
              activePage === "dashboard" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("dashboard");
              setQuickAction(null);
            }}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`nav-item ${
              activePage === "accounts" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("accounts");
              setQuickAction(null);
            }}
          >
            <Wallet size={20} />
            <span>Accounts</span>
          </button>

          <button
            type="button"
            className={`nav-item ${
              activePage === "transfer" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("transfer");
              setQuickAction(null);
            }}
          >
            <ArrowLeftRight size={20} />
            <span>Transfer</span>
          </button>

          <button
            type="button"
            className={`nav-item ${
              activePage === "transactions" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("transactions");
              setQuickAction(null);
            }}
          >
            <Receipt size={20} />
            <span>Transactions</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className={`nav-item ${
              activePage === "notifications" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("notifications");
              setQuickAction(null);
            }}
          >
            <Bell size={20} />
            <span>Notifications</span>
          </button>

          <button
            type="button"
            className={`nav-item ${
              activePage === "profile" ? "active" : ""
            }`}
            onClick={() => {
              setActivePage("profile");
              setQuickAction(null);
            }}
          >
            <UserRound size={20} />
            <span>Profile</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        {notificationPopup && (
          <div className="notification-popup">
            <div className="notification-popup-icon">
              <Bell size={18} />
            </div>

            <div className="notification-popup-content">
              <strong>{notificationPopup.title}</strong>
              <p>{notificationPopup.message}</p>
            </div>

            <button
              type="button"
              className="notification-popup-close"
              onClick={() => setNotificationPopup(null)}
            >
              ×
            </button>
          </div>
        )}

        <header className="header">
          <div>
            <p className="welcome-text">Welcome back,</p>

            <h1>{user.customer.name} 👋</h1>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="notification-btn"
              onClick={() => {
                setActivePage("notifications");
                setQuickAction(null);
              }}
            >
              <Bell size={21} />

              {unreadNotifications > 0 && (
                <span className="notification-count">
                  {unreadNotifications}
                </span>
              )}
            </button>

            <div className="profile">
              <div className="profile-avatar">
                {user.customer.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="profile-info">
                <strong>
                  {user.customer.name}
                </strong>

                <span>Personal Account</span>
              </div>

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        {activePage === "dashboard" && (
          <section className="dashboard-content">
            <div className="top-cards">
              <div className="balance-card">
                <div className="balance-content">
                  <div className="card-top">
                    <div>
                      <p className="card-label">
                        Available Balance
                      </p>

                      <div
                        className={`balance-display ${
                          showMainBalance
                            ? "balance-visible"
                            : "balance-hidden"
                        }`}
                      >
                        <h2
                          className={`balance-value ${
                            showMainBalance
                              ? "balance-value-visible"
                              : "balance-value-hidden"
                          }`}
                        >
                          {account
                            ? showMainBalance
                              ? `₦${formatAmount(
                                  account.balance
                                )}`
                              : "₦••••••••"
                            : "Loading balance..."}
                        </h2>

                        {account && (
                          <button
                            type="button"
                            className={`balance-visibility-button ${
                              showMainBalance
                                ? "visibility-visible"
                                : "visibility-hidden"
                            }`}
                            onClick={() =>
                              setShowMainBalance(
                                (current) => !current
                              )
                            }
                            title={
                              showMainBalance
                                ? "Hide balance"
                                : "Show balance"
                            }
                            aria-label={
                              showMainBalance
                                ? "Hide balance"
                                : "Show balance"
                            }
                          >
                            {showMainBalance ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="wallet-icon">
                      <Wallet size={24} />
                    </div>
                  </div>

                  <div className="account-details">
                    <div>
                      <span>Account Number</span>

                      <div className="account-number-row">
                        <strong>
                          {account
                            ? account.nibss_account_number
                            : "Loading account..."}
                        </strong>

                        {account && (
                          <button
                            type="button"
                            className="copy-account-button"
                            onClick={
                              handleCopyAccountNumber
                            }
                            title={
                              copied
                                ? "Copied"
                                : "Copy account number"
                            }
                          >
                            {copied ? (
                              <Check size={14} />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        )}
                      </div>

                      {copied && (
                        <span className="copy-message">
                          Account number copied
                        </span>
                      )}
                    </div>

                    <div>
                      <span>Account Type</span>

                      <strong>
                        Savings Account
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="fund-button"
                  >
                    <Plus size={18} />
                    Fund Account
                  </button>
                </div>
              </div>

              <div className="savebox-card">
                <div className="savebox-header">
                  <div className="savebox-icon">
                    <PiggyBank size={23} />
                  </div>

                  <div>
                    <p className="card-label">
                      SaveBox
                    </p>

                    <div
                      className={`savebox-balance-display ${
                        showSaveBoxBalance
                          ? "balance-visible"
                          : "balance-hidden"
                      }`}
                    >
                      <h3
                        className={`balance-value ${
                          showSaveBoxBalance
                            ? "balance-value-visible"
                            : "balance-value-hidden"
                        }`}
                      >
                        {account
                          ? showSaveBoxBalance
                            ? `₦${formatAmount(
                                account.savebox_balance ||
                                  0
                              )}`
                            : "₦••••••••"
                          : "Loading..."}
                      </h3>

                      {account && (
                        <button
                          type="button"
                          className={`balance-visibility-button savebox-visibility-button ${
                            showSaveBoxBalance
                              ? "visibility-visible"
                              : "visibility-hidden"
                          }`}
                          onClick={() =>
                            setShowSaveBoxBalance(
                              (current) => !current
                            )
                          }
                          title={
                            showSaveBoxBalance
                              ? "Hide SaveBox balance"
                              : "Show SaveBox balance"
                          }
                          aria-label={
                            showSaveBoxBalance
                              ? "Hide SaveBox balance"
                              : "Show SaveBox balance"
                          }
                        >
                          {showSaveBoxBalance ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <p className="savebox-text">
                  Put money aside and build your
                  savings effortlessly.
                </p>

                <button
                  type="button"
                  className="savebox-button"
                  onClick={() =>
                    openQuickAction("savebox")
                  }
                >
                  Start Saving
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>

            <section className="section">
              <div className="section-header">
                <div>
                  <h2>Quick Actions</h2>

                  <p>What would you like to do?</p>
                </div>
              </div>

              <div className="quick-actions">
                <button
                  type="button"
                  className="action-card"
                  onClick={() =>
                    openQuickAction("data")
                  }
                >
                  <div className="action-icon">
                    <Wifi size={22} />
                  </div>

                  <span>Data</span>
                </button>

                <button
                  type="button"
                  className="action-card"
                  onClick={() =>
                    openQuickAction("airtime")
                  }
                >
                  <div className="action-icon">
                    <Smartphone size={22} />
                  </div>

                  <span>Airtime</span>
                </button>

                <button
                  type="button"
                  className="action-card"
                  onClick={() =>
                    openQuickAction("send")
                  }
                >
                  <div className="action-icon">
                    <Send size={22} />
                  </div>

                  <span>Send to PayASAP</span>
                </button>

                <button
                  type="button"
                  className="action-card"
                  onClick={() =>
                    openQuickAction("bank")
                  }
                >
                  <div className="action-icon">
                    <CreditCard size={22} />
                  </div>

                  <span>Send to other banks</span>
                </button>

                <button
                  type="button"
                  className="action-card"
                  onClick={() =>
                    openQuickAction("savebox")
                  }
                >
                  <div className="action-icon">
                    <PiggyBank size={22} />
                  </div>

                  <span>SaveBox</span>
                </button>

                <button
                  type="button"
                  className="action-card"
                  onClick={() =>
                    openQuickAction("electricity")
                  }
                >
                  <div className="action-icon">
                    <Zap size={22} />
                  </div>

                  <span>Electricity</span>
                </button>

                <button
                  type="button"
                  className="action-card"
                  onClick={() =>
                    openQuickAction("betting")
                  }
                >
                  <div className="action-icon">
                    <Heart size={22} />
                  </div>

                  <span>Betting</span>
                </button>

                <button
                  type="button"
                  className="action-card"
                  onClick={() =>
                    openQuickAction("more")
                  }
                >
                  <div className="action-icon">
                    <MoreHorizontal size={22} />
                  </div>

                  <span>More</span>
                </button>
              </div>
            </section>

            <section className="section recent-section">
              <div className="section-header">
                <div>
                  <h2>Recent Activity</h2>

                  <p>Your latest transactions</p>
                </div>

                <button
                  type="button"
                  className="view-all"
                  onClick={() =>
                    setActivePage("transactions")
                  }
                >
                  View all
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="transactions-card">
                {transactions.length === 0 ? (
                  <div className="transaction-empty">
                    <Receipt size={24} />

                    <p>No transactions yet</p>

                    <span>
                      Your recent transactions will
                      appear here.
                    </span>
                  </div>
                ) : (
                  transactions
                    .slice(0, 4)
                    .map((transaction) => {
                      const isIncoming =
                        transaction.direction ===
                        "INCOMING";

                      return (
                        <div
                          className="transaction"
                          key={
                            transaction.transaction_reference
                          }
                        >
                          <div className="transaction-left">
                            <div
                              className={`transaction-icon ${
                                isIncoming
                                  ? "received"
                                  : "sent"
                              }`}
                            >
                              {isIncoming ? (
                                <ArrowLeftRight
                                  size={19}
                                />
                              ) : (
                                <ArrowRight
                                  size={19}
                                />
                              )}
                            </div>

                            <div>
                              <strong>
                                {getTransactionTitle(
                                  transaction
                                )}
                              </strong>

                              <span>
                                {isIncoming
                                  ? "Money received"
                                  : "Money sent"}
                                {" • "}
                                {formatDate(
                                  transaction.created_at
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="transaction-right">
                            <strong
                              className={`amount ${
                                isIncoming
                                  ? "positive"
                                  : "negative"
                              }`}
                            >
                              {isIncoming
                                ? "+"
                                : "-"}
                              ₦
                              {formatAmount(
                                transaction.amount
                              )}
                            </strong>

                            <span>
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </section>
          </section>
        )}

        {activePage === "accounts" && (
          <Accounts
            account={account}
            user={user}
          />
        )}

        {activePage === "transfer" && (
          <Transfer
            account={account}
            user={user}
            onTransferComplete={
              handleTransferComplete
            }
            onAddNotification={addNotification}
          />
        )}

        {activePage === "transactions" && (
          <Transactions user={user} />
        )}

        {activePage === "quick-action" && (
          <QuickActions
            action={quickAction}
            setAction={(action) => {
              setQuickAction(action);

              if (action === null) {
                setActivePage("dashboard");
              }
            }}
            account={account}
            user={user}
            onTransferComplete={
              handleTransferComplete
            }
            onAddNotification={addNotification}
          />
        )}

        {activePage === "profile" && (
  <section className="dashboard-content">
    <div className="profile-page">
      <div className="page-heading">
        <p>Profile</p>

        <h2>My profile</h2>
      </div>

      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-large-avatar">
            {profile?.name
              ?.charAt(0)
              .toUpperCase() ||
              user.customer.name
                .charAt(0)
                .toUpperCase()}
          </div>

          <div>
            <h3>
              {profile?.name ||
                user.customer.name}
            </h3>

            <p>Personal Account</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="profile-detail">
            <span>Full Name</span>

            <strong>
              {profile?.name || "Loading..."}
            </strong>
          </div>

          <div className="profile-detail">
            <span>Email Address</span>

            <strong>
              {profile?.email || "Loading..."}
            </strong>
          </div>

          <div className="profile-detail">
            <span>Phone Number</span>

            <strong>
              {profile?.phone || "Loading..."}
            </strong>
          </div>

          <div className="profile-detail">
            <span>Address</span>

            <strong>
              {profile?.address || "Loading..."}
            </strong>
          </div>

          <div className="profile-detail">
            <span>BVN</span>

            <div className="profile-sensitive-value">
              <strong>
                {profile?.demo_bvn
                  ? showBvn
                    ? profile.demo_bvn
                    : `${profile.demo_bvn.slice(
                        0,
                        3
                      )}********`
                  : "Loading..."}
              </strong>

              {profile?.demo_bvn && (
                <button
                  type="button"
                  onClick={() =>
                    setShowBvn(
                      (current) => !current
                    )
                  }
                  className="profile-visibility-button"
                  aria-label={
                    showBvn
                      ? "Hide BVN"
                      : "Show BVN"
                  }
                >
                  {showBvn ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="profile-detail">
            <span>NIN</span>

            <div className="profile-sensitive-value">
              <strong>
                {profile?.demo_nin
                  ? showNin
                    ? profile.demo_nin
                    : `${profile.demo_nin.slice(
                        0,
                        3
                      )}********`
                  : "Loading..."}
              </strong>

              {profile?.demo_nin && (
                <button
                  type="button"
                  onClick={() =>
                    setShowNin(
                      (current) => !current
                    )
                  }
                  className="profile-visibility-button"
                  aria-label={
                    showNin
                      ? "Hide NIN"
                      : "Show NIN"
                  }
                >
                  {showNin ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="profile-detail">
            <span>Account Number</span>

            <strong>
              {account?.nibss_account_number ||
                "No account"}
            </strong>
          </div>

          <div className="profile-detail">
            <span>Account Type</span>

            <strong>Savings Account</strong>
          </div>
        </div>
      </div>
    </div>
  </section>
)}

        {activePage === "notifications" && (
          <section className="dashboard-content">
            <div className="section">
              <div className="section-header">
                <div>
                  <h2>Notifications</h2>

                  <p>
                    Your PayASAP notifications will
                    appear here.
                  </p>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="notifications-empty">
                  <Bell size={28} />

                  <h3>No notifications</h3>

                  <p>
                    You are all caught up.
                  </p>
                </div>
              ) : (
                <div className="notifications-list">
                  {notifications.map(
                    (notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        className={`notification-item ${
                          notification.read
                            ? "read"
                            : "unread"
                        }`}
                        onClick={() =>
                          openNotification(
                            notification.id
                          )
                        }
                      >
                        <div className="notification-item-icon">
                          <Bell size={18} />
                        </div>

                        <div className="notification-item-content">
                          <strong>
                            {notification.title}
                          </strong>

                          <p>
                            {notification.message}
                          </p>
                        </div>

                        {!notification.read && (
                          <span className="notification-unread-dot"></span>
                        )}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        <nav className="mobile-bottom-nav">
          <button
            type="button"
            className={`mobile-nav-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActivePage("dashboard");
              setQuickAction(null);
            }}
          >
            <LayoutDashboard size={21} />
            <span>Home</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-item ${
              activePage === "accounts"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActivePage("accounts");
              setQuickAction(null);
            }}
          >
            <Wallet size={21} />
            <span>Accounts</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-item ${
              activePage === "transfer"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActivePage("transfer");
              setQuickAction(null);
            }}
          >
            <ArrowLeftRight size={21} />
            <span>Transfer</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-item ${
              activePage === "transactions"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActivePage("transactions");
              setQuickAction(null);
            }}
          >
            <Receipt size={21} />
            <span>Activity</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-item ${
              activePage === "profile"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActivePage("profile");
              setQuickAction(null);
            }}
          >
            <UserRound size={21} />
            <span>Profile</span>
          </button>
        </nav>
      </main>
    </div>
  );
}

export default App;