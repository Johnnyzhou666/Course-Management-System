// Navigation bar component for role-based menu rendering
export default function Navigation({ active, makeactive, user, Logout }) {
  const role = user?.role?.trim().toLowerCase();
  const isTA = role === "ta";
  const isStudent = role === "student";
  const isAdmin = role === "administrator";
// Default button class for each navigation item
  let coursesClass = "nbtn";
  if (active === "courses") coursesClass += " active";

  let membersClass = "nbtn";
  if (active === "members") membersClass += " active";

  let signupClass = "nbtn";
  if (active === "signupsheet") signupClass += " active";

  let slotsClass = "nbtn";
  if (active === "slots") slotsClass += " active";

  let gradingClass = "nbtn";
  if (active === "grading") gradingClass += " active";

  let stuSlotsClass = "nbtn";
  if (active === "stuslots") stuSlotsClass += " active";

  let adminClass = "nbtn";
  if (active === "admin") adminClass += " active";

  let resetPassClass = "nbtn";
  if (active === "changeyourpass") resetPassClass += " active";

  return (
        // Main navigation bar container
    <nav className="posterBar">
      {(isTA || isAdmin) && (
        <>
          <button
            className={coursesClass}
            onClick={() => makeactive("courses")}
          >
            Courses
          </button>

          <button
            className={membersClass}
            onClick={() => makeactive("members")}
          >
            Members
          </button>

          <button
            className={signupClass}
            onClick={() => makeactive("signupsheet")}
          >
            Sign-up Sheets
          </button>

          <button className={slotsClass} onClick={() => makeactive("slots")}>
            Slots
          </button>

          <button
            className={gradingClass}
            onClick={() => makeactive("grading")}
          >
            Grades
          </button>
        </>
      )}

      {isStudent && (
        <>


          <button
            className={stuSlotsClass}
            onClick={() => makeactive("stuslots")}
          >
            My Slots
          </button>
         
        </>
      )}

      {isAdmin && (
        <button className={adminClass} onClick={() => makeactive("admin")}>
          Admin Panel
        </button>
      )}

      <button
        className={resetPassClass}
        onClick={() => makeactive("changeyourpass")}
      >
        Reset password
      </button>

      <button className="nbtn" style={{ color: "red" }} onClick={Logout}>
        Logout
      </button>
    </nav>
  );
}
