import { useState } from "react";
import { request } from "../utilFun/request";
export default function FirstLogin({ user, FirstChangePass }) {
  const [freshPassword, createNewPassword] = useState("");
  const [toConfirm, createConfirm] = useState("");
  const [firstloginmsg, createMSG] = useState("");
  // It forces the user to change their initial password.
  async function submitLogin(e) {
    e.preventDefault();
    createMSG("");
    // Check if two passwords match
    if (freshPassword !== toConfirm) {
      return createMSG("New password does not match the confirmation.");
    }

    try {
      await request("/api/firstloginpassword", "POST", {
        nextPassword: freshPassword,
      });

      createMSG("Password reset. Try login again.");

      localStorage.removeItem("token");
      setTimeout(() => {
        FirstChangePass();
      }, 1000);
      // Network or server error handling
    } catch (err) {
      createMSG(err.message || "Cannot connect to Network.");
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h3>This is your first Login, Please update your password</h3>
        <p>
          Hello {user?.email}. change your password in order to use the system.
        </p>

        <form onSubmit={submitLogin}>
          <strong>New Password</strong>
          <input
            type="password"
            value={freshPassword}
            onChange={(e) => createNewPassword(e.target.value)}
            required
          />

          <strong>Confirm Your Password</strong>
          <input
            type="password"
            value={toConfirm}
            onChange={(e) => createConfirm(e.target.value)}
            required
          />
          <div>
            <button className="btn" style={{ marginTop: "30px" }}>
              Update Password
            </button>
          </div>
        </form>

        {firstloginmsg && (
          <p
            style={{
              color: firstloginmsg.includes("reset") ? "green" : "red",
              marginTop: "30px",
            }}
          >
            {firstloginmsg}
          </p>
        )}
      </div>
    </div>
  );
}
