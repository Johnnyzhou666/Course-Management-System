import { useState, useEffect } from "react";
import Message1 from "./message1";
import { request } from "../utilFun/request";
// Student slot management component
export default function StudentSlots1() {
  const [mySlots, setMySlots] = useState([]);
  const [myMsg, setMyMsg] = useState("");

  const [cansignSlots, setCanSignSlots] = useState([]);
  const [cansignMsg, setCanSignMsg] = useState("");

  const [sid, setSid] = useState("");
  const [signupMsg, setSignupMsg] = useState("");
// Load the student's own signed slots from the server
  async function loadOwnSlots() {
    try {
      const res = await request("/api/student/slots");

      if (!res.success) {
        setMyMsg(res.message);
        setMySlots([]);
        return;
      }

      setMySlots(res.slots || []);
      if (res.slots.length === 0) {
        setMyMsg("You have not signed up for any slots.");
      } else {
        setMyMsg("");
      }
    } catch (err) {
      setMyMsg("Failed to load signed slots");
      setMySlots([]);
    }
  }
  // Load all available slots that still have free space
  async function loadAvailableSlots() {
    try {
      const res = await request("/api/student/emptySlots");

      if (!res.success) {
        setCanSignMsg(res.message);
        setCanSignSlots([]);
        return;
      }

      setCanSignSlots(res.slots || []);
      setCanSignMsg("");
    } catch (err) {
      setCanSignMsg("No spare slots");
      setCanSignSlots([]);
    }
  }

  useEffect(() => {
    loadOwnSlots();
    loadAvailableSlots();
  }, []);

  async function signupSlots(e) {
    e.preventDefault();
    try {
      if (!sid) {
        setSignupMsg("Signup Sheet ID and Slot ID are required");
        return;
      }

      const url = `/api/student/slots/${sid}`;

      const result = await request(url, "POST");

      if (!result.success) {
        setSignupMsg(result.message);
        return;
      }

      setSignupMsg(result.message || "Sign up successful");

      setSid("");
      // Refresh data after leaving a slot
      loadOwnSlots();
      loadAvailableSlots();
    } catch (err) {
      setSignupMsg("Signup failed");
    }
  }

  async function leaveSlot(slotID) {
    try {
      const res = await request(`/api/student/leaveSlot/${slotID}`, "DELETE");

      if (!res.success) {
        setMyMsg(res.message);
        return;
      }

      setMyMsg("Slot left successfully");
      loadOwnSlots();
      loadAvailableSlots();
    } catch (err) {
      setMyMsg("Failed to leave slot");
    }
  }

  return (
    <section>
      <div className="card">
        <h3>My Signed Up Slots</h3>

        <Message1 content1={myMsg} color="orange" shut1={() => setMyMsg("")} />

        {mySlots.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Section</th>
                <th>Slot ID</th>
                <th>Begin</th>
                <th>End</th>
                <th>Grade</th>
                <th>Comment</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {mySlots.map((s, i) => (
                <tr key={i}>
                  <td>{s.course}</td>
                  <td>{s.section}</td>
                  <td>{s.slotID}</td>
                  <td>{new Date(s.begin).toLocaleString()}</td>
                  <td>{new Date(s.end).toLocaleString()}</td>
                  <td>{s.grade}</td>
                  <td>{s.comment}</td>
                  <td>
                    <button onClick={() => leaveSlot(s.slotID)}>Leave</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3>Available Slots</h3>

        <Message1
          content1={cansignMsg}
          color="orange"
          shut1={() => setCanSignMsg("")}
        />

        {cansignSlots.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Section</th>
                <th>Slot ID</th>
                <th>Begin</th>
                <th>End</th>
                <th>Members</th>
              </tr>
            </thead>
            <tbody>
              {cansignSlots.map((s, i) => (
                <tr key={i}>
                  <td>{s.enrollcode}</td>
                  <td>{s.enrollSection}</td>
                  <td>{s.slotID}</td>
                  <td>{new Date(s.begin).toLocaleString()}</td>
                  <td>{new Date(s.end).toLocaleString()}</td>
                  <td>
                    {s.currentMembers} / {s.maxmembers}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {cansignSlots.length === 0 && (
          <p style={{ color: "gray" }}>No available slots</p>
        )}
      </div>

      <div className="card">
        <h3>Sign Up for Slots</h3>

        <Message1
          content1={signupMsg}
          color="orange"
          shut1={() => setSignupMsg("")}
        />

        <form onSubmit={signupSlots}>
          <div>
            <strong>Slot ID</strong>
            <input
              type="text"
              required
              value={sid}
              onChange={(e) => setSid(e.target.value)}
            />
          </div>

          <button type="submit" className="btn">
            Sign Up
          </button>
        </form>
      </div>

      <div style={{ opacity: 0, height: 50 }}></div>
    </section>
  );
}
