import { useState } from "react";
import Message1 from "./message1";
import { request } from "../utilFun/request";
// Members management component
export default function Members() {
  // State for adding members
  const [memberTermCode, setMemberTermCode] = useState("");
  const [memberSection, setMemberSection] = useState("1");

  const [membersinfo, setMembersinfo] = useState([
    { firstName: "", lastName: "", username: "", password: "" },
  ]);
// State for viewing members
  const [checkMemberTerm, setCheckMemberTerm] = useState("");
  const [checkMemberSection, setCheckMemberSection] = useState("1");

  const [deleteMemberCode, setDeleteMemberCode] = useState("");
  const [deleteMemberSection, setDeleteMemberSection] = useState("1");
  const [deleteinfo, setDeleteinfo] = useState([{ memberId: "" }]);

  const [msg, setMsg] = useState("");
  const [VcourseMsg, setVcourseMsg] = useState("");
  const [DmemberMsg, setDmemberMsg] = useState("");

  const [membersList, setMembersList] = useState([]);

  const [csvMemberTermCode, setCsvMemberTermCode] = useState("");
  const [csvMemberSection, setCsvMemberSection] = useState("1");
  const [csvFile, setCsvFile] = useState(null);
  const [csvMsg, sendCSVmsg] = useState("");
 // Add one empty member input row
  function addOneMember() {
    setMembersinfo([
      ...membersinfo,
      { firstName: "", lastName: "", username: "", password: "" },
    ]);
  }
 // Remove a member input row
  function removeOneMember(i) {
    setMembersinfo(membersinfo.filter((_, idx) => idx !== i));
  }

  function addOneDelete() {
    setDeleteinfo([...deleteinfo, { memberId: "" }]);
  }
// Remove one delete input row
  function removeOneDelete(i) {
    setDeleteinfo(deleteinfo.filter((_, idx) => idx !== i));
  }
// Submit new members to the backend
  async function submitAddMembers(e) {
    e.preventDefault();
    try {
      const res = await request("/api/members", "POST", {
        memberTermCode,
        memberSection,
        membersinfo,
      });

      let text = `${res.message}`;
      if (res.addedCount > 0) text += ` | Added: ${res.addedCount}`;
      if (res.ignored && res.ignored.length > 0)
        text += ` | Ignored: ${res.ignored.join(", ")}`;

      setMsg(text);

      setMembersinfo([
        { firstName: "", lastName: "", username: "", password: "" },
      ]);
      setMemberTermCode("");
      setMemberSection("1");
    } catch (err) {
      setMsg(err.message);
    }
  }
// Load members for a specific course
  async function submitCheckMembers(e) {
    e.preventDefault();
    try {
      let url = `/api/members/${checkMemberTerm}/${checkMemberSection}`;

      const data = await request(url);

      if (!data.success) {
        setVcourseMsg(data.message);
        setMembersList([]);
        return;
      }

      setMembersList(data.members);
      setVcourseMsg("");
    } catch (err) {
      setVcourseMsg("Error loading members");
    }
  }
  // Delete selected members
  async function submitDeleteMember(e) {
    e.preventDefault();

    const delList = deleteinfo
      .map((item) => item.memberId.trim())
      .filter((id) => id);

    try {
      const res = await request(
        `/api/members/${deleteMemberCode}/${deleteMemberSection}`,
        "DELETE",
        { deleteinfo: delList }
      );

      setDmemberMsg(res.message);
      await submitCheckMembers(new Event("submit"));
      setDeleteinfo([{ memberId: "" }]);
      setDeleteMemberCode("");
      setDeleteMemberSection("1");
      setMembersList([]);
    } catch (err) {
      setDmemberMsg(err.message);
    }
  }

  async function submitCsvMembers(e) {
    e.preventDefault();

    if (!csvFile) {
      sendCSVmsg("Please upload a CSV file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      formData.append("memberTermCode", csvMemberTermCode);
      formData.append("memberSection", csvMemberSection);

      const data = await request("/api/members/csv", "POST", formData, true);

      if (!data.success) {
        sendCSVmsg(data.message);
        return;
      }

      let text = `Added: ${data.addedCount}`;
      if (data.ignored && data.ignored.length > 0)
        text += ` | Ignored: ${data.ignored.join(", ")}`;

      sendCSVmsg(text);

      setCsvFile(null);
      setCsvMemberTermCode("");
      setCsvMemberSection("1");
      document.getElementById("csvFile").value = "";
    } catch (err) {
      sendCSVmsg("Upload failed");
    }
  }

  return (
    <section id="members">
      <div className="card">
        <h3>Add Members to Course</h3>

        <Message1 content1={msg} color="orange" shut1={() => setMsg("")} />

        <form id="addMembers" onSubmit={submitAddMembers}>
          <div>
            <strong>Term Code</strong>
            <input
              type="number"
              id="memberTermCode"
              autoComplete="off"
              min="1"
              max="9999"
              required
              value={memberTermCode}
              onChange={(e) => setMemberTermCode(e.target.value)}
            />
          </div>

          <div>
            <strong>Section</strong>
            <input
              type="number"
              id="memberSection"
              autoComplete="off"
              min="1"
              max="99"
              required
              value={memberSection}
              onChange={(e) => setMemberSection(e.target.value)}
            />
          </div>

          <div>
            <strong>Member Information</strong>

            <div id="memberslide">
              {membersinfo.map((m, i) => (
                <div className="manyinput" key={i}>
                  <div>
                    <input
                      type="text"
                      className="firstName"
                      placeholder="First Name"
                      autoComplete="off"
                      maxLength="200"
                      required
                      value={m.firstName}
                      onChange={(e) => {
                        const newListshow = [...membersinfo];
                        newListshow[i] = {
                          ...newListshow[i],
                          firstName: e.target.value,
                        };
                        setMembersinfo(newListshow);
                      }}
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      className="lastName"
                      placeholder="Last Name"
                      autoComplete="off"
                      maxLength="200"
                      required
                      value={m.lastName}
                      onChange={(e) => {
                        const newListshow = [...membersinfo];
                        newListshow[i] = {
                          ...newListshow[i],
                          lastName: e.target.value,
                        };
                        setMembersinfo(newListshow);
                      }}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      className="username"
                      placeholder="Username"
                      autoComplete="off"
                      maxLength="50"
                      required
                      value={m.username}
                      onChange={(e) => {
                        const newListshow = [...membersinfo];
                        newListshow[i] = {
                          ...newListshow[i],
                          username: e.target.value,
                        };
                        setMembersinfo(newListshow);
                      }}
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      className="password"
                      placeholder="One-Time Password (will be changed on first login)"
                      autoComplete="off"
                      maxLength="50"
                      required
                      value={m.password}
                      onChange={(e) => {
                        const newListshow = [...membersinfo];
                        newListshow[i] = {
                          ...newListshow[i],
                          password: e.target.value,
                        };
                        setMembersinfo(newListshow);
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    className="deletebtn"
                    style={{ opacity: i === 0 ? 0 : 1 }}
                    onClick={() => removeOneMember(i)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={addOneMember}
            >
              + Add One Member
            </button>
          </div>

          <button type="submit" className="btn">
            Add Members
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Add Members from CSV</h3>

        <Message1
          content1={csvMsg}
          color="orange"
          shut1={() => sendCSVmsg("")}
        />

        <form id="csvAddMembers" onSubmit={submitCsvMembers}>
          <div>
            <strong>Term Code</strong>
            <input
              type="number"
              id="csvMemberTermCode"
              autoComplete="off"
              min="1"
              max="9999"
              required
              value={csvMemberTermCode}
              onChange={(e) => setCsvMemberTermCode(e.target.value)}
            />
          </div>

          <div>
            <strong>Section</strong>
            <input
              type="number"
              id="csvMemberSection"
              autoComplete="off"
              min="1"
              max="99"
              required
              value={csvMemberSection}
              onChange={(e) => setCsvMemberSection(e.target.value)}
            />
          </div>

          <div>
            <strong>CSV File</strong>
            <input
              type="file"
              id="csvFile"
              accept=".csv"
              required
              onChange={(e) => setCsvFile(e.target.files[0])}
            />
          </div>

          <button type="submit" className="btn">
            Upload CSV
          </button>
        </form>
      </div>

      <div className="card">
        <h3>View Course Members</h3>

        <Message1
          content1={VcourseMsg}
          color="red"
          shut1={() => setVcourseMsg("")}
        />

        <form id="checkMembers" onSubmit={submitCheckMembers}>
          <div>
            <strong>Term Code</strong>
            <input
              type="number"
              id="checkMemberTerm"
              autoComplete="off"
              min="1"
              max="9999"
              required
              value={checkMemberTerm}
              onChange={(e) => setCheckMemberTerm(e.target.value)}
            />
          </div>

          <div>
            <strong>Section</strong>
            <input
              type="number"
              id="checkMemberSection"
              autoComplete="off"
              min="1"
              max="99"
              required
              value={checkMemberSection}
              onChange={(e) => setCheckMemberSection(e.target.value)}
            />
          </div>

          <button type="submit" className="btn">
            Load Members
          </button>
        </form>

        <div id="membersList">
          {membersList.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Term Code</th>
                  <th>Section</th>
                  <th>Member ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Role</th>
                </tr>
              </thead>

              <tbody>
                {membersList.map((m, i) => (
                  <tr key={i}>
                    <td>{m.memberTermCode}</td>
                    <td>{m.memberSection}</td>
                    <td>{m.memberId}</td>
                    <td>{m.firstName}</td>
                    <td>{m.lastName}</td>
                    <td>{m.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Delete Member</h3>

        <Message1
          content1={DmemberMsg}
          color="orange"
          shut1={() => setDmemberMsg("")}
        />

        <form id="deleteMember" onSubmit={submitDeleteMember}>
          <div>
            <strong>Term Code</strong>
            <input
              type="number"
              id="deleteMemberCode"
              autoComplete="off"
              min="1"
              max="9999"
              required
              value={deleteMemberCode}
              onChange={(e) => setDeleteMemberCode(e.target.value)}
            />
          </div>

          <div>
            <strong>Section</strong>
            <input
              type="number"
              id="deleteMemberSection"
              autoComplete="off"
              min="1"
              max="99"
              required
              value={deleteMemberSection}
              onChange={(e) => setDeleteMemberSection(e.target.value)}
            />
          </div>

          <strong>MemberId</strong>

          <div id="onemoredelete">
            {deleteinfo.map((d, i) => (
              <div className="multdelete" key={i}>
                <div>
                  <input
                    type="text"
                    className="deleteMemberId"
                    autoComplete="off"
                    maxLength="8"
                    required
                    value={d.memberId}
                    onChange={(e) => {
                      const deleteListshow = [...deleteinfo];
                      deleteListshow[i] = {
                        ...deleteListshow[i],
                        memberId: e.target.value,
                      };
                      setDeleteinfo(deleteListshow);
                    }}
                  />

                  <button
                    type="button"
                    className="deletebtn"
                    style={{ opacity: i === 0 ? 0 : 1 }}
                    onClick={() => removeOneDelete(i)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={addOneDelete}
          >
            + Delete Member
          </button>

          <button type="submit" className="btn btn-red">
            Delete
          </button>
        </form>
      </div>

      <div style={{ opacity: 0, height: 50 }}></div>
    </section>
  );
}
