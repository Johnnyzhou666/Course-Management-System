import { useState, useEffect } from "react";
import Message1 from "./message1";
import { request } from "../utilFun/request";
// Admin section component for administrator operations
export default function AdminSection({ adminuser }) {


  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [removeEmail, setRemoveEmail] = useState("");

  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");

  const [addmsg, setaddMsg] = useState("");
  const [deletemsg, setdeleteMsg] = useState("");
  const [resetmsg, setresetMsg] = useState("");

const [TAshow, makeTAshow] = useState([]);
const [resetTA, setresetTA] = useState(false);
useEffect(() => {
  TAfunction();
}, [resetTA]);
async function TAfunction() {
  try {
    const res = await request("/api/admin/postTA");
    if (res.success) makeTAshow(res.list);
  } catch (err) {
    console.error(err.message);
  }
}



  if (!adminuser || adminuser.role !== "administrator") {
    return <p style={{ color: "red" }}>Access denied</p>;
  }
    // add an new TA account
  async function toaddTA(e) {
    e.preventDefault();
    try{const res = await request("/api/admin/addTA", "POST", {
      email: addEmail,
      password: addPassword
    });setresetTA(prev => !prev);
    setaddMsg(res.message);}
    catch(err){setaddMsg(err.message);}
    
  };
  // Remove an existing TA account
  async function removeTA(e) {
    e.preventDefault();
    try{const res = await request("/api/admin/removeTA", "DELETE", {
      email: removeEmail
    });setresetTA(prev => !prev);
    setdeleteMsg(res.message);}catch(err){setdeleteMsg(err.message);}
    
  };
  // reset an existing TA account password
  async function toresetPass(e) {
    e.preventDefault();
    try{const res = await request("/api/admin/resetPassword", "POST", {
      email: resetEmail,
      nextPassword: resetPassword
    });
    setresetMsg(res.message);}catch(err){setresetMsg(err.message);}
    
  }
if (adminuser?.firstLogin) {
  return <p style={{ color: "red" }}>
    You must change your password on the first login.
  </p>;
}

  return (
    <section >
      {/* Create TA Form */}
      <div className="card">
        <form onSubmit={toaddTA}>
          <h3>Create TA</h3>
          <Message1 content1={addmsg} color="orange" shut1={() => setaddMsg("")} />
          <strong>TA email</strong>
          <input
            type="email"
            placeholder="TA email"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            required
          />
          <strong>TA password</strong>
          <input
            type="password"
            placeholder="Initial password"
            value={addPassword}
            onChange={(e) => setAddPassword(e.target.value)}
            required
          />
          <div><button className="btn">Add TA</button></div>
          
        </form>


</div>
<div className="card">
  <h3>All Teaching Assistants</h3>

  {TAshow.length === 0 ? (
    <p>No TA accounts found.</p>
  ) : (
    <table>
      <thead>
        <tr>
          <th>Email</th>
          <th>Role</th>
          <th>First Login</th>
        </tr>
      </thead>
      <tbody>
        {TAshow.map((ta1, idx) => (
          <tr key={idx}>
            <td>{ta1.email}</td>
            <td>{ta1.role}</td>
            <td>{ta1.firstLogin ? "Yes" : "No"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>

 {/* remove TA Form */}
     <div className="card">
        <form onSubmit={removeTA}>
          <h3>Delete TA</h3>
          <Message1 content1={deletemsg} color="orange" shut1={() => setdeleteMsg("")} />
          <strong>TA email</strong>
          <input
            type="email"
            placeholder="TA email"
            value={removeEmail}
            onChange={(e) => setRemoveEmail(e.target.value)}
            required
          />
          <div><button className="btn btn-red">Remove TA</button></div>
          
        </form>
</div>
 {/* Reset Password Form */}
  <div className="card">
        <form onSubmit={toresetPass}>
          <h3>Reset User Password</h3>
          <Message1 content1={resetmsg} color="orange" shut1={() => setresetMsg("")} />
          <strong>User email</strong>
          <input
            type="email"
            placeholder="User email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
          />
          <strong>User new password</strong>
          <input
            type="password"
            placeholder="New password"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            required
          />
          <div><button className="btn btn-grey">Reset Password</button></div>
          
        </form>
      </div>
    </section>
  );
}
