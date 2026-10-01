import { useState } from "react";
import {
  ShieldCheck,
  Wallet,
  RefreshCw,
} from "lucide-react";
import "./onboarding.css";

function Onboarding({ onVerified }) {
  const [verificationType, setVerificationType] = useState("nin");
  const [verificationNumber, setVerificationNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const generateDemoIdentity = async () => {
    setError("");
    setSuccess("");
    setGenerating(true);

    try {
      const token = localStorage.getItem("payasapToken");

      if (!token) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      const endpoint =
        verificationType === "nin"
          ? "https://payasap.onrender.com/demo-identity/nin"
          : "https://payasap.onrender.com/demo-identity/bvn";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("Demo identity response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to generate demo identity"
        );
      }

      const generatedNumber =
        verificationType === "nin"
          ? data.customer?.demo_nin || data.demo_nin
          : data.customer?.demo_bvn || data.demo_bvn;

      if (!generatedNumber) {
        console.error(
          "Backend response did not contain the expected demo identity:",
          data
        );

        throw new Error(
          `The server did not return a demo ${
            verificationType === "nin" ? "NIN" : "BVN"
          }.`
        );
      }

      setVerificationNumber(generatedNumber);

      setSuccess(
        `Demo ${verificationType.toUpperCase()} is ready.`
      );
    } catch (err) {
      console.error("Demo identity error:", err);

      setError(
        err.message === "Failed to fetch"
          ? "Unable to connect to the server. Please check that your backend is running."
          : err.message
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleVerificationTypeChange = (type) => {
    setVerificationType(type);
    setVerificationNumber("");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!verificationNumber) {
      setError(
        `Please enter or generate your demo ${
          verificationType === "nin" ? "NIN" : "BVN"
        }.`
      );
      return;
    }

    if (!dateOfBirth) {
      setError("Please select your date of birth.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("payasapToken");

      if (!token) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      const verificationBody =
        verificationType === "nin"
          ? {
              nin: verificationNumber,
              dob: dateOfBirth,
            }
          : {
              bvn: verificationNumber,
              dob: dateOfBirth,
            };

      const verificationResponse = await fetch(
        "https://payasap.onrender.com/onboarding",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(verificationBody),
        }
      );

      const verificationData =
        await verificationResponse.json();

      console.log(
        "Verification response:",
        verificationData
      );

      if (!verificationResponse.ok) {
        throw new Error(
          verificationData.message ||
            "Identity verification failed"
        );
      }

      setSuccess(
        "Identity verified! Creating your PayASAP account..."
      );

      const accountResponse = await fetch(
        "https://payasap.onrender.com/accounts",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const accountData = await accountResponse.json();

      console.log(
        "Account creation response:",
        accountData
      );

      if (!accountResponse.ok) {
        throw new Error(
          accountData.message ||
            "Identity verified, but account creation failed"
        );
      }

      setSuccess(
        "Your PayASAP bank account has been created successfully!"
      );

      setTimeout(() => {
        onVerified(accountData.account);
      }, 1200);
    } catch (err) {
      console.error("Onboarding error:", err);

      setError(
        err.message === "Failed to fetch"
          ? "Unable to connect to the server. Please check that your backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <div className="onboarding-logo">
          <div className="onboarding-logo-icon">
            <Wallet size={25} />
          </div>

          <h1>PayASAP</h1>
        </div>

        <div className="onboarding-icon">
          <ShieldCheck size={30} />
        </div>

        <div className="onboarding-heading">
          <h2>Verify your identity</h2>

          <p>
            Complete a quick identity verification before
            opening your PayASAP bank account.
          </p>
        </div>

        <div className="demo-notice">
          <strong>Portfolio Demo</strong>

          <p>
            This is a demonstration banking application.
            Do not enter your real NIN or BVN. You can
            generate a demo identity below.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="verification-options">
            <button
              type="button"
              className={
                verificationType === "nin"
                  ? "verification-option active"
                  : "verification-option"
              }
              onClick={() =>
                handleVerificationTypeChange("nin")
              }
              disabled={loading || generating}
            >
              NIN
            </button>

            <button
              type="button"
              className={
                verificationType === "bvn"
                  ? "verification-option active"
                  : "verification-option"
              }
              onClick={() =>
                handleVerificationTypeChange("bvn")
              }
              disabled={loading || generating}
            >
              BVN
            </button>
          </div>

          <div className="onboarding-field">
            <label htmlFor="verificationNumber">
              Demo{" "}
              {verificationType === "nin" ? "NIN" : "BVN"}
            </label>

            <div className="demo-number-row">
              <input
                id="verificationNumber"
                type="text"
                inputMode="numeric"
                placeholder={`Enter or generate your demo ${
                  verificationType === "nin"
                    ? "NIN"
                    : "BVN"
                }`}
                value={verificationNumber}
                onChange={(e) =>
                  setVerificationNumber(e.target.value)
                }
                disabled={loading}
              />

              <button
                type="button"
                className="generate-button"
                onClick={generateDemoIdentity}
                disabled={loading || generating}
              >
                <RefreshCw
                  size={17}
                  className={
                    generating ? "spinning" : ""
                  }
                />

                {generating
                  ? "Generating..."
                  : verificationNumber
                  ? "Get Again"
                  : "Generate"}
              </button>
            </div>
          </div>

          <div className="onboarding-field">
            <label htmlFor="dateOfBirth">
              Date of birth
            </label>

            <input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) =>
                setDateOfBirth(e.target.value)
              }
              disabled={loading}
              required
            />
          </div>

          {error && (
            <p className="onboarding-error">{error}</p>
          )}

          {success && (
            <p className="onboarding-success">{success}</p>
          )}

          <button
            type="submit"
            className="onboarding-submit"
            disabled={
              loading ||
              generating ||
              !verificationNumber ||
              !dateOfBirth
            }
          >
            {loading
              ? "Setting up your account..."
              : "Verify & Open Account"}
          </button>
        </form>

        <p className="onboarding-note">
          Demo identities are generated specifically for
          this portfolio application and are not real
          government-issued identification numbers.
        </p>
      </div>
    </div>
  );
}

export default Onboarding;