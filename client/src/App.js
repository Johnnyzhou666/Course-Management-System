import React, { useState } from "react";
import "./App.css";

import Login from "./components/Login";
import FirstChangePass from "./components/FirstLogin";

import Navigation from "./components/Nav";
import Courses from "./components/Course";
import Members from "./components/members";
import Signups from "./components/Signups";
import Slots from "./components/slots";
import Grading from "./components/Grades";
import Changeyourpassword from "./components/changeyourpassword";
import AdminSection from "./components/AdminSection";
import StudentSlots1 from "./components/student";
function App() {
  const [user1, makeUser] = useState(null);
  const [stage, makeStage] = useState("login");

  const [section, makeSection] = useState("");

  function loginState(outcome) {
    makeUser(outcome);

    if (outcome.firstLogin) {
      makeStage("force");
    } else {
      makeStage("main");

      if (outcome.role === "student") {
        makeSection("stuslots");
      } else {
        makeSection("courses");
      }
    }
  }

  function logoutstate() {
    localStorage.removeItem("token");
    makeUser(null);
    makeSection("courses");
    makeStage("login");
  }

  return (
    <>
      {stage === "login" && <Login ifLogin={loginState} />}

      {stage === "force" && (
        <FirstChangePass
          user={user1}
          FirstChangePass={() => makeStage("login")}
        />
      )}

      {stage === "main" && (
        <main className="layout1">
          <header>
            <h1>Course Management System</h1>
          </header>

          <Navigation
            active={section}
            makeactive={makeSection}
            user={user1}
            Logout={logoutstate}
          />

          {section === "courses" && <Courses />}
          {section === "members" && <Members />}
          {section === "signupsheet" && <Signups authuser={user1} />}
          {section === "slots" && <Slots />}
          {section === "grading" &&
            (user1?.role === "TA" || user1?.role === "administrator") && (
              <Grading />
            )}

          {section === "stuslots" && user1?.role === "student" && (
            <StudentSlots1 user={user1} />
          )}
          {section === "emptyslots1" && user1?.role === "student" && (
            <StudentSlots1 />
          )}
          {section === "changeyourpass" && (
            <Changeyourpassword TOLOGIN={() => makeStage("login")} />
          )}
          {section === "admin" && user1?.role === "administrator" && (
            <AdminSection adminuser={user1} />
          )}
        </main>
      )}
    </>
  );
}

export default App;
