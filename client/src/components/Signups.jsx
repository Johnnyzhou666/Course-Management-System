import { useState } from "react";
import Message1 from "./message1";
import { request } from "../utilFun/request";
// Signups component: used to create, delete, and view sign-up sheets
export default function Signups({ authuser }) {
  // State for creating a signup sheet
  const [enrollTermCode, makeEnrollTermCode] = useState("");
  const [enrollSection, makeEnrollSection] = useState("1");
  const [createTask, makeCreateTask] = useState("");
  const [begin, makeBegin] = useState("");
  const [end, makeEnd] = useState("");

  const [signuptermcode, makeSignuptermcode] = useState("");
  const [signsection, makeSignsection] = useState("1");
  const [deleteTask, makeDeleteTask] = useState("");
  const [searchTermCode, buildSearchTermCode] = useState("");
  const [searchSection, buildsearchSection] = useState("");

  const [signupmsg, makesignupmsg] = useState("");
  const [Dsign, makeDsign] = useState("");
  const [Esign, makeEsign] = useState("");

  const [signupsList, makeSignupsList] = useState([]);
// State for creating a signup sheet
  async function CreateSignupsheet(e) {
    e.preventDefault();

    if (new Date(begin) >= new Date(end)) {
      makesignupmsg("The start time must be earlier than the end time.");
      return;
    }

    try {
      const res = await request("/api/signups", "POST", {
        enrollcode: enrollTermCode,
        enrollSection,
        task: createTask,
        begin,
        end,
      });

      if (res.success) {
        makesignupmsg(res.message);
        makeEnrollTermCode("");
        makeEnrollSection("1");
        makeCreateTask("");
        makeBegin("");
        makeEnd("");
      } else {
        makesignupmsg(res.message);
      }
    } catch (error) {
      makesignupmsg(error.message);
    }
  }
 // Delete an existing signup sheet
  async function DeleteSignup(e) {
    e.preventDefault();

    if (!signuptermcode || !signsection || !deleteTask.trim()) {
      makeDsign("All fields are required.");
      return;
    }

    try {
      const res = await request(
        `/api/signups?enrollcode=${signuptermcode}&enrollSection=${signsection}&task=${encodeURIComponent(
          deleteTask
        )}`,
        "DELETE"
      );

      makeDsign(res.message);
      makeSignuptermcode("");
      makeSignsection("1");
      makeDeleteTask("");
      if (res.success) {
        makeSignupsList([]);
      }
    } catch (err) {
      makeDsign(err.message);
    }
  }
 // Get existing signup sheets for a course
  async function GetSignup(e) {
    e.preventDefault();
    try {
      const result = await request(
        `/api/signups/${searchTermCode}/${searchSection}`
      );

      if (!result.success) {
        makeEsign(result.message);
        makeSignupsList([]);
        return;
      }

      makeEsign("");
      makeSignupsList(result.signups);
    } catch (err) {
      makeEsign(err.message);
    }
  }

  return (
    <section id="signupsheet">
      {(authuser?.role === "TA" || authuser?.role === "administrator") && (
        <>
          <div className="card">
            <h3>Create Signup Sheet</h3>
            <Message1
              content1={signupmsg}
              color="orange"
              shut1={() => makesignupmsg("")}
            />

            <form onSubmit={CreateSignupsheet}>
              <strong>Term Code</strong>
              <input
                type="number"
                min="1"
                max="9999"
                required
                value={enrollTermCode}
                onChange={(e) => makeEnrollTermCode(e.target.value)}
              />
              <strong>Section</strong>
              <input
                type="number"
                min="1"
                max="99"
                required
                value={enrollSection}
                onChange={(e) => makeEnrollSection(e.target.value)}
              />
              <strong>Task Name</strong>
              <input
                type="text"
                maxLength="100"
                required
                value={createTask}
                onChange={(e) => makeCreateTask(e.target.value)}
              />
              <strong>Begin Time</strong>
              <input
                type="datetime-local"
                required
                value={begin}
                onChange={(e) => makeBegin(e.target.value)}
              />
              <strong>Finish Time</strong>
              <input
                type="datetime-local"
                required
                value={end}
                onChange={(e) => makeEnd(e.target.value)}
              />
              <div>
                <button type="submit" className="btn">
                  Create
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {(authuser?.role === "TA" || authuser?.role === "administrator") && (
        <>
          <div className="card">
            <h3>Delete Sign-up Sheet</h3>
            <Message1
              content1={Dsign}
              color="red"
              shut1={() => makeDsign("")}
            />

            <form onSubmit={DeleteSignup}>
              <strong>Term Code</strong>
              <input
                type="number"
                required
                value={signuptermcode}
                onChange={(e) => makeSignuptermcode(e.target.value)}
              />
              <strong>Section</strong>
              <input
                type="number"
                required
                value={signsection}
                onChange={(e) => makeSignsection(e.target.value)}
              />
              <strong>Task Name</strong>
              <input
                type="text"
                required
                value={deleteTask}
                onChange={(e) => makeDeleteTask(e.target.value)}
              />
              <div>
                <button type="submit" className="btn btn-red">
                  Delete
                </button>
              </div>
            </form>
          </div>
        </>
      )}
      {(authuser?.role === "TA" || authuser?.role === "administrator") && (
        <>
          <div className="card">
            <h3>Existing SignUp Sheets</h3>
            <Message1
              content1={Esign}
              color="orange"
              shut1={() => makeEsign("")}
            />

            <form onSubmit={GetSignup}>
              <strong>Term Code</strong>
              <input
                type="number"
                required
                value={searchTermCode}
                onChange={(e) => buildSearchTermCode(e.target.value)}
              />
              <strong>Section</strong>
              <input
                type="number"
                required
                value={searchSection}
                onChange={(e) => buildsearchSection(e.target.value)}
              />
              <div>
                <button type="submit" className="btn">
                  Refresh
                </button>
              </div>
            </form>

            {signupsList.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Term Code</th>
                    <th>Section</th>
                    <th>Task Name</th>
                    <th>Begin Time</th>
                    <th>End Time</th>
                  </tr>
                </thead>
                <tbody>
                  {signupsList.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.enrollcode}</td>
                      <td>{c.enrollSection}</td>
                      <td>{c.task}</td>
                      <td>{new Date(c.begin).toLocaleString()}</td>
                      <td>{new Date(c.end).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </section>
  );
}
