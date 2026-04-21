import { useState } from "react";
import Message1 from "./message1";
import { request } from "../utilFun/request";
// Grading page for TAs to view and assign grades
export default function Grading() {
  const [getSlotmem1, makeGetSlotmem1] = useState("");
  const [slotmem, makeSlotmem] = useState("");
  const [getGradeMember, makeGetGradeMember] = useState([]);
  const [lastSlotId, setLastSlotId] = useState(null);

  const [gradingMode, makeGradingMode] = useState(false);
  const [currentSlotInfo, makeCurrentSlotInfo] = useState(null);
  const [currentMembers, makeCurrentMembers] = useState([]);
  const [presentMsg, makeCurrentMsg] = useState("");
  const [nextMsg, makeNextMsg] = useState("");
  const [prevMsg, makePrevMsg] = useState("");

  const [modalactive, makemodalactive] = useState(false);
  const [modalgradeMember, makemodalgradeMember] = useState(null);
  const [modalpastGrade, makemodalpastGrade] = useState("");
  const [modalpastComment, makemodalpastComment] = useState("");
  const [modalmistake, makemodalmistake] = useState("");
  const [modalinspection, makemodalinspection] = useState(null);
  // New grade values inside modal
  const [modalNewGrade, makeModalNewGrade] = useState("");
  const [modalNewComment, makeModalNewComment] = useState("");
  const [modalBonus, makeModalBonus] = useState("");
  const [modalPenalty, makeModalPenalty] = useState("");
  // Fetch current active slot for grading
  async function getCurrentSlot(e) {
    e.preventDefault();
    try {
      const res = await request("/api/currentSlot?_=" + Date.now());

      if (!res.success) {
        makeCurrentSlotInfo(null);
        makeCurrentMembers([]);
        makeGetGradeMember([]);
        makeCurrentMsg(res.message);
        return;
      }

      makeCurrentMsg("");
      makeCurrentSlotInfo(res.slot || null);

      const members = res.member || [];
      makeCurrentMembers(members);
      makeGetGradeMember(members);
    } catch (err) {
      makeCurrentSlotInfo(null);
      makeCurrentMembers([]);
      makeCurrentMsg(err.message);
    }
  }
  // Get all members in a specific slot
  async function getSlotMembers1(e) {
    e.preventDefault();
    try {
      const slotId = getSlotmem1;
      const res = await request(`/api/memberslot/${slotId}`);

      const slotList = Array.isArray(res.member) ? res.member : [];
      makeGetGradeMember(slotList);
      setLastSlotId(slotId);

      if (res.success && slotList.length === 0) {
        makeSlotmem("No member exists in this slot");
        return;
      }

      if (res.success) {
        const nameList = slotList.map((m) => m.memberId).join(", ");
        makeSlotmem(`members ${nameList} in this slot`);
      } else {
        makeSlotmem(res.message);
      }

      makeGetSlotmem1("");
    } catch (err) {
      makeSlotmem(err.message);
    }
  }

  // Navigate to the next slot
  async function getNextSlot() {
    try {
      const res = await request(`/api/slots/${currentSlotInfo.id}/next`);
      if (!res.success || !res.slot) {
        makeNextMsg(res.message);
        return;
      }

      makeNextMsg("");
      makeCurrentSlotInfo(res.slot);

      const memRes = await request(`/api/memberslot/${res.slot.id}`);
      if (memRes.success) makeCurrentMembers(memRes.member || []);
    } catch (err) {
      makeNextMsg(err.message);
    }
  }
  // Navigate to the previous slot
  async function getPrevSlot() {
    try {
      const res = await request(`/api/slots/${currentSlotInfo.id}/prev`);
      if (!res.success || !res.slot) {
        makePrevMsg(res.message);
        return;
      }

      makePrevMsg("");
      makeCurrentSlotInfo(res.slot);

      const memRes = await request(`/api/memberslot/${res.slot.id}`);
      if (memRes.success) makeCurrentMembers(memRes.member || []);
    } catch (err) {
      makePrevMsg(err.message);
    }
  }

  return (
    <section id="grading">
      <div className="card">
        <h3>Grading Mode</h3>

        <button className="btn" onClick={() => makeGradingMode(true)}>
          Enter Grading Mode
        </button>

        <button
          className="btn btn-red"
          onClick={() => makeGradingMode(false)}
          style={{ marginLeft: "10px" }}
        >
          Exit Grading Mode
        </button>
      </div>

      {gradingMode && (
        <div className="card">
          <h3>Current Slot (Enter Grading Mode First)</h3>
          <Message1
            content1={presentMsg || prevMsg || nextMsg}
            color="orange"
            shut1={() => {
              makeCurrentMsg("");
              makePrevMsg("");
              makeNextMsg("");
            }}
          />

          <button
            className="btn"
            disabled={!currentSlotInfo}
            onClick={getPrevSlot}
          >
            Previous Slot
          </button>

          <button
            className="btn"
            disabled={!currentSlotInfo}
            onClick={getNextSlot}
          >
            Next Slot
          </button>

          <form onSubmit={getCurrentSlot}>
            <button type="submit" className="btn">
              Get Current Slot
            </button>
          </form>

          <div id="currentSlotInfo">
            {currentSlotInfo && (
              <table>
                <thead>
                  <tr>
                    <th>Slot ID</th>
                    <th>SignupSheet ID</th>
                    <th>Begin</th>
                    <th>End</th>
                    <th>Max Members</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{currentSlotInfo.id}</td>
                    <td>{currentSlotInfo.signupsheetID}</td>
                    <td>{new Date(currentSlotInfo.begin).toLocaleString()}</td>
                    <td>{new Date(currentSlotInfo.end).toLocaleString()}</td>
                    <td>{currentSlotInfo.maxmembers}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          <div id="currentMembers">
            {currentMembers.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>Member ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Signup Sheet</th>
                    <th>Final Grade</th>
                    <th>TA Name</th>
                    <th>Graded Time</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMembers.map((mm, idx) => (
                    <tr key={idx}>
                      <td>{mm.memberId}</td>
                      <td>{mm.firstName ?? ""}</td>
                      <td>{mm.lastName ?? ""}</td>
                      <td>{mm.signupSheetID}</td>
                      <td>{mm.finalGrade ?? mm.grade ?? ""}</td>
                      <td>{mm.taName ?? ""}</td>
                      <td>
                        {mm.gradedTime
                          ? new Date(mm.gradedTime).toLocaleString()
                          : ""}
                      </td>
                      <td>{mm.comment ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      <div className="card">
        <h3>Get Member From Slots</h3>

        <Message1
          content1={slotmem}
          color="orange"
          shut1={() => makeSlotmem("")}
        />

        <form id="getSlotMembers1" onSubmit={getSlotMembers1}>
          <div>
            <strong>Slot id</strong>
            <input
              id="getSlotmem1"
              autoComplete="off"
              type="text"
              required
              value={getSlotmem1}
              onChange={(e) => makeGetSlotmem1(e.target.value)}
            />
          </div>
          <button type="submit" className="btn">
            Get Members
          </button>
        </form>

        <div id="getGradeMember">
          {getGradeMember.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Member ID</th>
                  <th>Signup Sheet ID</th>
                  <th>Slot ID</th>
                  <th>Grade</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {getGradeMember.map((mm, idx) => (
                  <tr key={idx}>
                    <td>
                      <button
                        className="btn"
                        onClick={async () => {
                          makemodalactive(true);
                          makemodalgradeMember(mm);
                          makemodalpastGrade(mm.finalGrade ?? mm.grade ?? "");
                          makemodalpastComment(mm.comment ?? "");
                          makemodalmistake("");
                          makemodalinspection(null);
                          makeModalNewGrade(mm.grade ?? "");
                          makeModalNewComment("");
                          makeModalBonus(mm.bonus ?? 0);
                          makeModalPenalty(mm.penalty ?? 0);

                          try {
                            const auditgradeRes = await request(
                              `/api/Grades/audit/${mm.memberId}/${mm.signupSheetID}`
                            );

                            if (auditgradeRes.success) {
                              makemodalinspection(auditgradeRes.audit || null);
                            } else {
                              makemodalinspection(null);
                            }
                          } catch (err) {
                            makemodalinspection(null);
                          }
                        }}
                      >
                        {mm.memberId}
                      </button>
                    </td>
                    <td>{mm.signupSheetID}</td>
                    <td>{mm.slotID}</td>
                    <td>{mm.finalGrade ?? mm.grade ?? ""}</td>

                    <td>{mm.comment ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalactive && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              width: "550px",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "10px",
            }}
          >
            <h3>Grade Member</h3>

            <Message1
              content1={modalmistake}
              color="red"
              shut1={() => makemodalmistake("")}
            />

            <p>
              <strong>Member ID:</strong> {modalgradeMember?.memberId}
            </p>
            <p>
              <strong>SignupSheet ID:</strong> {modalgradeMember?.signupSheetID}
            </p>
            <p>
              <strong>Previous Grade:</strong> {modalpastGrade}
            </p>
            <p>
              <strong>Previous Comment:</strong> {modalpastComment}
            </p>
            {modalinspection && (
              <>
                <p>
                  <strong>Last Modified By:</strong>{" "}
                  {modalinspection.lastModifiedBy}
                </p>
                <p>
                  <strong>Last Modified Time:</strong>{" "}
                  {new Date(modalinspection.lastModifiedTime).toLocaleString()}
                </p>
              </>
            )}

            <div>
              <strong>New Grade</strong>
              <input
                type="number"
                min="0"
                max="999"
                value={modalNewGrade}
                onChange={(e) => makeModalNewGrade(e.target.value)}
              />
            </div>

            <div>
              <strong>New Comment</strong>
              <textarea
                value={modalNewComment}
                onChange={(e) => makeModalNewComment(e.target.value)}
              />
            </div>
            <div>
              <strong>Bonus</strong>
              <input
                type="number"
                value={modalBonus}
                onChange={(e) => makeModalBonus(e.target.value)}
              />
            </div>

            <div>
              <strong>Penalty</strong>
              <input
                type="number"
                value={modalPenalty}
                onChange={(e) => makeModalPenalty(e.target.value)}
              />
            </div>
            <p>
              <strong>Final Grade Preview:</strong>{" "}
              {Number(modalNewGrade || modalpastGrade) +
                Number(modalBonus || 0) -
                Number(modalPenalty || 0)}
            </p>

            <div style={{ marginTop: "15px" }}>
              <button
                className="btn"
                onClick={async () => {
                  if (!gradingMode) {
                    makemodalmistake("Please enter grading mode first.");
                    return;
                  }

                  if (!modalNewComment.trim()) {
                    makemodalmistake(
                      "Comment is required when modifying a grade."
                    );
                    return;
                  }

                  const body1 = {
                    GradesMemberID: modalgradeMember.memberId,
                    GradeSignup: modalgradeMember.signupSheetID,
                    SlotID: modalgradeMember.slotID,
                    GradesMm: modalNewGrade || modalpastGrade,
                    Bonus: modalBonus || 0,
                    Penalty: modalPenalty || 0,
                    Commentarea: modalNewComment,
                  };

                  const res = await request("/api/Grades", "POST", body1);
                  if (!res.success) {
                    makemodalmistake(res.message);
                    return;
                  }

                  if (lastSlotId) {
                    const memRes = await request(
                      `/api/memberslot/${lastSlotId}`
                    );
                    if (memRes.success) makeGetGradeMember(memRes.member || []);
                  }

                  if (currentSlotInfo) {
                    const memRes2 = await request(
                      `/api/memberslot/${currentSlotInfo.id}`
                    );
                    if (memRes2.success)
                      makeCurrentMembers(memRes2.member || []);
                  }

                  makemodalactive(false);
                  makemodalmistake("");
                  makeModalNewGrade("");
                  makeModalNewComment("");
                  makeModalBonus("");
                  makeModalPenalty("");
                }}
              >
                Confirm
              </button>

              <button
                className="btn btn-red"
                style={{ marginLeft: "10px" }}
                onClick={() => {
                  makemodalactive(false);
                  makemodalmistake("");
                  makeModalNewGrade("");
                  makeModalNewComment("");
                  makeModalBonus("");
                  makeModalPenalty("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ opacity: 0, height: 50 }}></div>
    </section>
  );
}
