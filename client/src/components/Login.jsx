import { useState } from "react";
import Message1 from "./message1";
import Unauthenticated from "./unauthenticated";
// Login component for user authentication
export default function Login({ ifLogin }) {
  // Store user input for email
  const [loginEmail, buildloginEmail] = useState("");
  const [loginPassword, buildloginPassword] = useState("");
  const [message1, tellMsg] = useState("");
  const [presentGuest, makepresentGuest] = useState(false);
  const [loading, setLoading] = useState(false);
 // Handle login form submission
  async function loginFirst(e) {
    e.preventDefault();

    const email = loginEmail.trim();
    const password = loginPassword.trim();

    if (!email || !password) {
      tellMsg("Please enter both username/email and password.");
      return;
    }

    setLoading(true);
    tellMsg("");
    localStorage.removeItem("token");

    try {
      const Loginrequest = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginEmail: email,
          loginPassword: password,
        }),
      });

      let logindata;
      try {
        logindata = await Loginrequest.json();
      } catch {
        throw new Error("Server response is invalid.");
      }

      if (!Loginrequest.ok || !logindata.success) {
        tellMsg(logindata.message || "Login failed.");
      } else {
        localStorage.setItem("token", logindata.token);
        ifLogin(logindata);
      }
    } catch (err) {
      tellMsg("Cannot connect to the server.");
    } finally {
      setLoading(false);
    }
  }
    // Text displayed on login button
  let loadingText;
  if (loading) {
    loadingText = "Logging in...";
  } else {
    loadingText = "Login";
  }
  let browseingText;

  if (presentGuest) {
    browseingText = "Hide Visitor View";
  } else {
    browseingText = "Browse";
  }

  return (
    <div className="container" style={{ marginTop: "80px" }}>
      <div className="card">
        <h2>Course Management System</h2>
        <p style={{ marginTop: "10px", marginBottom: "20px" }}>
          Browse sign-up sheets without login or login to manage courses,
          members and grading.
        </p>
      </div>

      <div className="card">
        <h3>Login</h3>

        <Message1 content1={message1} color="red" shut1={() => tellMsg("")} />

        <form onSubmit={loginFirst}>
          <strong>Email or Student Username</strong>
          <input
            type="text"
            value={loginEmail}
            placeholder="admin@uwo.ca"
            onChange={(e) => buildloginEmail(e.target.value)}
            required
          />

          <strong>Password</strong>
          <input
            type="password"
            value={loginPassword}
            placeholder="admin123"
            onChange={(e) => buildloginPassword(e.target.value)}
            required
          />

          <div>
            <button
              className="btn"
              style={{ marginTop: "30px" }}
              disabled={loading}
            >
              {loadingText}
            </button>
          </div>
        </form>

        <button
          className="nbtn"
          style={{ marginTop: "25px" }}
          onClick={() => makepresentGuest(!presentGuest)}
        >
          {browseingText}
        </button>
      </div>

      {presentGuest && <Unauthenticated />}
    </div>
  );
}
