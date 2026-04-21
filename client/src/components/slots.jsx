import { useState } from "react";
import Message1 from "./message1";
import { request } from "../utilFun/request";
// Slots management component (Create / Read / Update / Delete)
export default function Slots() {
  const [signupsheetID, makeSignupsheetID] = useState("");
  const [start, makeStart] = useState("");
  const [slotduration, makeSlotduration] = useState("");
  const [numslots, makeNumslots] = useState("");
  const [maxmembers, makeMaxmembers] = useState("");

  const [getSlotID, makeGetSlotID] = useState("");
  const [slotsList, makeSlotsList] = useState([]);
  const [Eslot, makeEslot] = useState("");

  const [updateslot, makeUpdateslot] = useState("");
  const [updatebegin, makeUpdatebegin] = useState("");
  const [updateend, makeUpdateend] = useState("");
  const [updatemaxmember, makeUpdatemaxmember] = useState("");
  const [modifyMembers, makeModifyMembers] = useState([]);
  const [Uslots, makeUslots] = useState("");

  const [deleteSlotId, makeDeleteSlotId] = useState("");
  const [deleteSlotMsg, makeDeleteSlotMsg] = useState("");
  const [deletedSlot, makeDeletedSlot] = useState(null);

  const [msg, makeMsg] = useState("");
  // Create new slots
  async function createSlot(e) {
    e.preventDefault();

    if (
      Number(slotduration) <= 0 ||
      Number(numslots) <= 0 ||
      Number(maxmembers) <= 0
    ) {
      makeMsg("Duration, number of slots, and max members must be positive.");
      return;
    }

    try {
      const res = await request("/api/slots", "POST", {
        signupsheetID,
        start,
        slotduration,
        numslots,
        maxmembers,
      });

      if (res.success) {
        makeMsg(res.message);
        makeSignupsheetID("");
        makeStart("");
        makeSlotduration("");
        makeNumslots("");
        makeMaxmembers("");
      } else {
        makeMsg(res.message);
      }
    } catch (err) {
      makeMsg(err.message);
    }
  }
 // Get an existing slot
  async function getSlot(e) {
    e.preventDefault();
    try {
      const slotResult = await request(`/api/slots/${getSlotID}`);

      if (!slotResult.success) {
        makeSlotsList([]);
        makeEslot(slotResult.message);
        return;
      }

      makeEslot("");
      makeSlotsList(slotResult.slots);
      makeGetSlotID("");
    } catch (err) {
      makeSlotsList([]);
      makeEslot(err.message);
    }
  }
 // Update an existing slot
  async function updateSlots(e) {
    e.preventDefault();
    try {
      const body = {};
      if (updatebegin) body.updatebegin = updatebegin;
      if (updateend) body.updateend = updateend;
      if (updatemaxmember !== "")
        body.updatemaxmember = Number(updatemaxmember);

      if (!updateslot) {
        makeUslots("Cannot find Slot ID");
        makeModifyMembers([]);
        return;
      }

      const url = `/api/slots/${updateslot}`;
      const slotResult = await request(url, "PUT", body);

      if (!slotResult.success) {
        makeModifyMembers([]);
        makeUslots(slotResult.message);
        return;
      }

      makeModifyMembers(slotResult.members || []);
      makeUslots(slotResult.message);

      makeUslots(slotResult.message);
      makeUpdateslot("");
      makeUpdatebegin("");
      makeUpdateend("");
      makeUpdatemaxmember("");
    } catch (err) {
      makeModifyMembers([]);
      makeUslots(err.message);
    }
  }
 // Delete an existing slot
  async function deleteSlot(e) {
    e.preventDefault();
    try {
      const url = `/api/slots/${deleteSlotId}`;

      const res = await request(url, "DELETE");

      if (!res.success) {
        makeDeletedSlot(null);
        makeDeleteSlotMsg(res.message);
        return;
      }

      makeDeletedSlot(res.deletedSlot || null);
      makeDeleteSlotMsg("Slot deleted successfully");
      makeDeleteSlotId("");
    } catch (err) {
      makeDeletedSlot(null);
      makeDeleteSlotMsg(err.message);
    }
  }

  return (
    <section id="slots">
      <div className="card">
        <h3>Create Slots</h3>

        <Message1 content1={msg} color="orange" shut1={() => makeMsg("")} />

        <form id="createSlot" onSubmit={createSlot}>
          <div>
            <strong>Signup Sheet ID</strong>
            <input
              type="text"
              autoComplete="off"
              id="signupsheetID"
              required
              value={signupsheetID}
              onChange={(e) => makeSignupsheetID(e.target.value)}
            />
          </div>

          <div>
            <strong>Start</strong>
            <input
              type="datetime-local"
              autoComplete="off"
              id="start"
              required
              value={start}
              onChange={(e) => makeStart(e.target.value)}
            />
          </div>

          <div>
            <strong>Slot-Duration </strong>
            <input
              type="number"
              autoComplete="off"
              id="slotduration"
              min="1"
              max="240"
              required
              value={slotduration}
              onChange={(e) => makeSlotduration(e.target.value)}
            />
          </div>

          <div>
            <strong>Num-Slots </strong>
            <input
              type="number"
              autoComplete="off"
              id="numslots"
              min="1"
              max="99"
              required
              value={numslots}
              onChange={(e) => makeNumslots(e.target.value)}
            />
          </div>

          <div>
            <strong>Max Members</strong>
            <input
              type="number"
              autoComplete="off"
              id="maxmembers"
              min="1"
              max="99"
              required
              value={maxmembers}
              onChange={(e) => makeMaxmembers(e.target.value)}
            />
          </div>

          <button type="submit" className="btn">
            Create
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Existing Slots</h3>

        <Message1 content1={Eslot} color="red" shut1={() => makeEslot("")} />

        <form id="getSlot" onSubmit={getSlot}>
          <div>
            <strong>Signup sheets ID</strong>
            <input
              type="text"
              autoComplete="off"
              id="getSlotID"
              required
              value={getSlotID}
              onChange={(e) => makeGetSlotID(e.target.value)}
            />
          </div>

          <button type="submit" className="btn">
            Refresh Slots
          </button>
        </form>

        <div id="slotsList">
          {slotsList.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>id</th>
                  <th>signupsheetID</th>
                  <th>Begin Time</th>
                  <th>End Time</th>
                  <th>Max Members</th>
                </tr>
              </thead>
              <tbody>
                {slotsList.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.signupsheetID}</td>
                    <td>{new Date(c.begin).toLocaleString()}</td>
                    <td>{new Date(c.end).toLocaleString()}</td>
                    <td>{c.maxmembers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Update Slots</h3>

        <Message1
          content1={Uslots}
          color="orange"
          shut1={() => makeUslots("")}
        />

        <form id="UpdateSlots" onSubmit={updateSlots}>
          <div>
            <strong>Slots Id</strong>
            <input
              type="text"
              autoComplete="off"
              id="updateslot"
              required
              value={updateslot}
              onChange={(e) => makeUpdateslot(e.target.value)}
            />
          </div>

          <div>
            <strong>Update Begin Time</strong>
            <input
              type="datetime-local"
              autoComplete="off"
              id="updatebegin"
              value={updatebegin}
              onChange={(e) => makeUpdatebegin(e.target.value)}
            />
          </div>

          <div>
            <strong>Update End Time</strong>
            <input
              type="datetime-local"
              autoComplete="off"
              id="updateend"
              value={updateend}
              onChange={(e) => makeUpdateend(e.target.value)}
            />
          </div>

          <div>
            <strong>Update Max Member</strong>
            <input
              type="number"
              autoComplete="off"
              id="updatemaxmember"
              min="1"
              max="99"
              value={updatemaxmember}
              onChange={(e) => makeUpdatemaxmember(e.target.value)}
            />
          </div>

          <button type="submit" className="btn">
            Update
          </button>
        </form>

        <div id="modifyList">
          {modifyMembers.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Members</th>
                </tr>
              </thead>
              <tbody>
                {modifyMembers.map((m, idx) => (
                  <tr key={idx}>
                    <td>{m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Delete Slot</h3>

        <Message1
          content1={deleteSlotMsg}
          color="red"
          shut1={() => makeDeleteSlotMsg("")}
        />

        <form id="deleteSlot" onSubmit={deleteSlot}>
          <div>
            <strong>Slot ID</strong>
            <input
              type="text"
              autoComplete="off"
              id="deleteSlotId"
              required
              value={deleteSlotId}
              onChange={(e) => makeDeleteSlotId(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-red">
            Delete Slot
          </button>
        </form>

        <div id="deleteSlotResult">
          {deletedSlot && (
            <table>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>SignupsheetID</th>
                  <th>Begin Time</th>
                  <th>End Time</th>
                  <th>Max Members</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{deletedSlot.id}</td>
                  <td>{deletedSlot.signupsheetID}</td>
                  <td>{new Date(deletedSlot.begin).toLocaleString()}</td>
                  <td>{new Date(deletedSlot.end).toLocaleString()}</td>
                  <td>{deletedSlot.maxmembers}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ opacity: 0, height: 50 }}></div>
    </section>
  );
}
