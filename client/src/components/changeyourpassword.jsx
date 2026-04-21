import { useState } from "react";
import Message1 from "./message1";
import { request } from "../utilFun/request";
// Component for changing user password
export default function Changeyourpassword({ TOLOGIN }) {
  const [presentPassword, makepresentPassword] = useState("");
  const [freshPassword, makefreshPassword] = useState("");
  const [verifyPassword, makeverifyPassword] = useState("");
  const [hintmsg, tellhintmsg] = useState("");

  async function submitChange(e) {
    e.preventDefault();
    tellhintmsg("");
   // Check if new password and confirmation match
    if (freshPassword !== verifyPassword) {
      return tellhintmsg("Confirmation can not match your new password");
    }
try{const token = localStorage.getItem("token");
    if (!token) {
      tellhintmsg("Token not found. Please login again.");
      return;
    }

    const datachange = await request("/api/changeyourpassword", "POST", {
      nowPassword: presentPassword,
      nextPassword: freshPassword,
    });

  // Handle server response
    if (!datachange.success) {
      tellhintmsg(datachange.message);
    } else {
      tellhintmsg("Password updated. Please login again.");
       // Remove token after password change
      localStorage.removeItem("token");

      setTimeout(() => {
        TOLOGIN();
      }, 1200);
    }}catch (err) {
  
    tellhintmsg(err.message || "Password update failed.");
  }
    
  }


  return (
    <div className="container">
      <div className="card">
        <h3>Change Password</h3>
        <Message1
          content1={hintmsg}
          color="orange"
          shut1={() => tellhintmsg("")}
        />

        <form onSubmit={submitChange}>
          <strong>Current Password</strong>
          <input
            type="password"
            required
            value={presentPassword}
            onChange={(e) => makepresentPassword(e.target.value)}
          />

          <strong>New Password</strong>
          <input
            type="password"
            required
            value={freshPassword}
            onChange={(e) => makefreshPassword(e.target.value)}
          />

          <strong>Confirm Your Password</strong>
          <input
            type="password"
            required
            value={verifyPassword}
            onChange={(e) => makeverifyPassword(e.target.value)}
          />
          <div>
            <button className="btn" type="submit">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
