import { useState } from "react";
import Message1 from "./message1";
import { request } from "../utilFun/request";
// Component for guest users to search sign-up sheets
export default function Unauthenticated() {
  const [searchCourse, setSearchCourse] = useState("");
  const [list, setList] = useState([]);
  const [visitormsg, buildvisitormsg] = useState("");

  async function doSearch(e) {
    e.preventDefault();
    buildvisitormsg("");

    const importantword = searchCourse.trim().toLowerCase();
  // Validation: empty input
    if (!importantword) {
      buildvisitormsg("Please enter course code.");
      return;
    }

    try {
      const datamatch = await request("/api/signups/visitor");
 // Fetch all public sign-up sheets
      const correspondmatch = datamatch.filter((s) =>
        s.enrollcode.toString().toLowerCase().includes(importantword)
      );

      setList(correspondmatch);
      if (correspondmatch.length === 0) buildvisitormsg("No matches found.");
    } catch (err) {
      buildvisitormsg("Cannot load sign-up sheets.");
    }
  }

  return (
    <div className="card" style={{ marginTop: "25px" }}>
      <h3>Search Sign-up Sheets (Click row to expand)</h3>

      <Message1
        content1={visitormsg}
        color="orange"
        shut1={() => buildvisitormsg("")}
      />

      <form onSubmit={doSearch}>
        <strong>Course Code</strong>
        <input
          value={searchCourse}
          onChange={(e) => setSearchCourse(e.target.value)}
          placeholder="1259"
          autoComplete="off"
        />
        <button className="btn" style={{ marginTop: "20px" }}>
          Search
        </button>
      </form>

      {list.length > 0 && (
        <table style={{ marginTop: "30px" }}>
          <thead>
            <tr>
              <th>Term</th>
              <th>Section</th>
              <th>Task</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <GuestItem key={s.id} item={s} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function GuestItem({ item }) {
  const [display1, todisplay1] = useState(false);

  return (
    <>
      <tr onClick={() => todisplay1(!display1)} style={{ cursor: "pointer" }}>
        <td>{item.enrollcode}</td>
        <td>{item.enrollSection}</td>
        <td>{item.task}</td>
      </tr>

      {display1 && (
        <tr>
          <td colSpan="3">
            <div className="card" style={{ background: "#fafafa" }}>
              <h4>Slots</h4>
              {item.slots?.map((slot, i) => (
                <p key={i}>
                  {slot.date} | {slot.time} | Cap: {slot.max} | Taken:{" "}
                  {slot.signups || 0}
                </p>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
