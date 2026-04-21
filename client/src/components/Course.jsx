import { useState} from "react";
import Message1 from "./message1";
import { request } from "../utilFun/request";
// Course management component
export default function Courses() {
  const [termapp, setTermapp] = useState("");
  const [courseapp, setCourseapp] = useState("");
  const [sectionapp, setSectionapp] = useState("1");

  const [getAssignedcourse, setGetAssignedcourse] = useState("");
const [getAssignedcourseSection, setGetAssignedcourseSection] = useState("1");

  const [deleteCode, setDeleteCode] = useState("");
  const [deleteSection, setDeleteSection] = useState("1");

  const [coursemsg, tellMsg] = useState("");
  const [existCmsg, setExistMsg] = useState("");
  const [DeleteCmsg, setDeleteMsg] = useState("");


  const [getCourse, setGetCourse] = useState([]);

const [enterOldTerm, makeOldTerm] = useState("");
const [enterOldSection, makeOldSection] = useState("1");

const [inputfreshterm, makeinputfreshterm] = useState("");
const [inputfreshcourse, makefreshCourse] = useState("");
const [inputfreshsection, makeinputfreshsection] = useState("1");

const [enterMsg, makeEditMsg] = useState("");

   // Update an existing course
async function ModifyCourse(e) {
  e.preventDefault();
  if (!inputfreshterm || !inputfreshcourse || !inputfreshsection) {
  makeEditMsg("You must enter all fields to update");
  return;
}
  try {
    const res = await request("/api/courses", "PUT", {
      oldTermapp: enterOldTerm,
      oldSectionapp: enterOldSection,
      termapp: inputfreshterm,
      courseapp: inputfreshcourse,
      sectionapp: inputfreshsection
    });

    makeEditMsg(res.message);
    makeOldTerm("");
    makeOldSection("1");
    makeinputfreshterm("");
    makefreshCourse("");
    makeinputfreshsection("1");

setGetCourse([]);

  } catch (err) {
     makeEditMsg(
    String(err.message).replace(/</g, "&lt;").replace(/>/g, "&gt;")
  );
  }
}
    // Create a new course
async function CreateCourse(e) {
    e.preventDefault();
    try {
      const res = await request("/api/courses", "POST", {
        termapp, courseapp, sectionapp
      });

      tellMsg(res.message);
      setTermapp("");
      setCourseapp("");
      setSectionapp("1");
setGetCourse([]);

    } catch (err) {
      tellMsg(String(err.message).replace(/</g, "&lt;").replace(/>/g, "&gt;"));

    }
  }
// Get a specific course by term and section
  async function GetSpecificCourse(e) {
    e.preventDefault();
    try {
      const url = `/api/courses/${getAssignedcourse}/${getAssignedcourseSection}`;

      const result = await request(url);

      setGetCourse(result.getCourse);
      setExistMsg("");
    } catch (err) {
      setGetCourse([]);
      setExistMsg(
    String(err.message).replace(/</g, "&lt;").replace(/>/g, "&gt;")
  );
    }
  }

  async function DeleteSpecificCourse(e) {
    e.preventDefault();
    try {
      const res = await request("/api/courses", "DELETE", {
        deleteCode, deleteSection
      });

      setDeleteMsg(res.message);
      setDeleteCode("");
      setDeleteSection("1");
setGetCourse([]);

    } catch (err) {
      setDeleteMsg(
    String(err.message).replace(/</g, "&lt;").replace(/>/g, "&gt;")
  );
    }
  }



  return (
    <section id="courses" className="section active">

      <div className="card">
        <h3>Create New Course</h3>

        <Message1 content1={coursemsg} color="orange" shut1={() => tellMsg("")} />

        <form id="newCourseForm" onSubmit={CreateCourse}>
          <div>
            <strong>Term Code</strong>
            <input
              id="checkTermCode"
              type="number"
              autoComplete="off"
              min="1"
              max="9999"
              required
              placeholder="1259"
              value={termapp}
              onChange={(e) => setTermapp(e.target.value)}
            />
          </div>

          <div>
            <strong>Course Name</strong>
            <input
              id="checkCourse"
              type="text"
              autoComplete="off"
              maxLength="100"
              required
              placeholder="SE 3316"
              value={courseapp}
              onChange={(e) => setCourseapp(e.target.value)}
            />
          </div>

          <div>
            <strong>Section</strong>
            <input
              id="checkSection"
              type="number"
              autoComplete="off"
              min="1"
              max="99"
              required
              value={sectionapp}
              onChange={(e) => setSectionapp(e.target.value)}
            />
          </div>

          <button type="submit" className="btn">Create Course</button>
        </form>
      </div>

      <div className="card">
        <h3>Existing Courses</h3>

        <Message1 content1={existCmsg} color="red" shut1={() => setExistMsg("")} />

        <form id="GetSpecificCourse" onSubmit={GetSpecificCourse}>
          <div>
            <strong>Get Specific Course(Term Code)</strong>
            <input
              id="getAssignedcourse"
              type="number"
              autoComplete="off"
              min="1"
              max="9999"
              placeholder="1259"
              required
              value={getAssignedcourse}
              onChange={(e) => setGetAssignedcourse(e.target.value)}
            />
          </div>

          <div>
          <strong>Get Specific Course(Section)</strong>
<input
  type="number"
  min="1"
  max="99"
  required
  value={getAssignedcourseSection}
  onChange={(e) => setGetAssignedcourseSection(e.target.value)}
/>

          </div>

          <button type="submit" className="btn">Get Courses</button>
        </form>

        <div id="coursesList">
          {getCourse.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Term Code</th>
                  <th>Section</th>
                  <th>Course Name</th>
                </tr>
              </thead>
              <tbody>
                {getCourse.map((c) => (
                  <tr key={c.id}>
                    <td>{c.termapp}</td>
                    <td>{c.sectionapp}</td>
                    <td>{c.courseapp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}



          
        </div>
      </div>
 
<div className="card">
  <h3>Modify Course</h3>

  <Message1 content1={enterMsg} color="blue" shut1={() => makeEditMsg("")} />

  <form id="modifyCourseForm" onSubmit={ModifyCourse}>
    <div>
      <strong>Old Term Code</strong>
      <input
        type="number"
        min="1"
        max="9999"
        required
        placeholder="1259"
        value={enterOldTerm}
        onChange={(e) => makeOldTerm(e.target.value)}
      />
    </div>

    <div>
      <strong>Old Section</strong>
      <input
        type="number"
        min="1"
        max="99"
        required
        value={enterOldSection}
        onChange={(e) => makeOldSection(e.target.value)}
      />
    </div>

 

    <div>
      <strong>New Term Code</strong>
      <input
        type="number"
        min="1"
        max="9999"
        required
        value={inputfreshterm}
        onChange={(e) => makeinputfreshterm(e.target.value)}
      />
    </div>

    <div>
      <strong>New Course Name</strong>
      <input
        type="text"
        maxLength="100"
        required
        value={inputfreshcourse}
        onChange={(e) => makefreshCourse(e.target.value)}
      />
    </div>

    <div>
      <strong>New Section</strong>
      <input
        type="number"
        min="1"
        max="99"
        required
        value={inputfreshsection}
        onChange={(e) => makeinputfreshsection(e.target.value)}
      />
    </div>

    <button type="submit" className="btn">
      Modify Course
    </button>
  </form>
</div>




      <div className="card">
        <h3>Delete Course</h3>

        <Message1 content1={DeleteCmsg} color="orange" shut1={() => setDeleteMsg("")} />

        <form id="deleteCourse" onSubmit={DeleteSpecificCourse}>

          <div>
            <strong>Term Code</strong>
            <input
              id="deleteCode"
              type="number"
              autoComplete="off"
              min="1"
              max="9999"
              required
              value={deleteCode}
              onChange={(e) => setDeleteCode(e.target.value)}
            />
          </div>

          <div>
            <strong>Section</strong>
            <input
              id="deleteSection"
              type="number"
              autoComplete="off"
              min="1"
              max="99"
              value={deleteSection}
              onChange={(e) => setDeleteSection(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-red">Delete Course</button>
        </form>
      </div>

    </section>
  );
}
