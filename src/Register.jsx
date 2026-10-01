import { useState } from "react";
import { Wallet, Eye, EyeOff, ArrowLeft } from "lucide-react";
import "./Register.css";

function Register({ onRegister, onBackToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://payasap.onrender.com/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess(
        "Account created successfully! You can now log in."
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        password: "",
      });

      setTimeout(() => {
        onRegister();
      }, 1500);
    } catch (err) {
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
    <div className="register-page">
      <div className="register-card">

        <button
          className="back-login"
          onClick={onBackToLogin}
        >
          <ArrowLeft size={17} />
          Back to login
        </button>

        <div className="register-logo">
          <div className="register-logo-icon">
            <Wallet size={25} />
          </div>

          <h1>PayASAP</h1>
        </div>

        <div className="register-heading">
          <h2>Create your account</h2>

          <p>
            Join PayASAP and manage your money with ease.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="register-field">
            <label htmlFor="name">
              Full name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="phone">
              Phone number
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="address">
              Address
            </label>

            <input
              id="address"
              name="address"
              type="text"
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="password">
              Password
            </label>

            <div className="register-password">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />

              <button
                type="button"
                className="register-password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="register-error">
              {error}
            </p>
          )}

          {success && (
            <p className="register-success">
              {success}
            </p>
          )}

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        <p className="register-footer">
          Already have a PayASAP account?{" "}
          <button onClick={onBackToLogin}>
            Log in
          </button>
        </p>

      </div>
    </div>
  );
}

export default Register;