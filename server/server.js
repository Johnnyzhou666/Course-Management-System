const express = require("express");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");

const { readJSONFile, writeJSONFile } = require("./utilFun/readwritejson");

const sanitizeMiddleware = require("./middle/sanitizeMiddleware");
const makesureDataexist = require("./utilFun/buildnewJSON");

const loginMiddleware = require("./middle/loginMiddleware");
const app = express();
const PORT = 3001;

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.use((req, res) => {
    res.sendFile(
      path.join(__dirname, "../client/build", "index.html")
    );
  });
}


app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));
app.use(express.json({ limit: "1mb" }));

app.use(sanitizeMiddleware);

makesureDataexist();

const login = require("./routes/loginRoute");
app.use(login);
const firstLogin = require("./routes/firstLogin");
app.use(firstLogin);
const visitorSignup = require("./routes/visitorSignup");
app.use(visitorSignup);

app.use(loginMiddleware);

const studentsPage = require("./routes/studentsPage");
app.use(studentsPage);
const addcourseRoutes = require("./routes/addCourse");
app.use(addcourseRoutes);
const getcourseRoutes = require("./routes/getCourse");
app.use(getcourseRoutes);

const deletecourseRoutes2 = require("./routes/deletecourseRoutes2");
app.use(deletecourseRoutes2);

const aduitHistroy = require("./routes/aduitHistroy");
app.use(aduitHistroy);
const postMember = require("./routes/postMember");
app.use(postMember);
const getMember = require("./routes/getMember");
app.use(getMember);
const deleteMember = require("./routes/deleteMember");
app.use(deleteMember);
const postSignup = require("./routes/postSignup");
app.use(postSignup);
const deleteSignup = require("./routes/deleteSignup");
app.use(deleteSignup);
const getSignup = require("./routes/getSignup");
app.use(getSignup);
const postSlot = require("./routes/postSlot");
app.use(postSlot);
const getSlot = require("./routes/getSlot");
app.use(getSlot);
const updateSlot = require("./routes/updateSlot");
app.use(updateSlot);
const enrollSlot = require("./routes/enrollslot");
app.use(enrollSlot);
const deleteSlot = require("./routes/deleteSlotList");
app.use(deleteSlot);
const postGrade = require("./routes/postGrade");
app.use(postGrade);
const getGrade = require("./routes/getGrade");
app.use(getGrade);
const modifyCourse = require("./routes/modifyCourse");
app.use(modifyCourse);
const getprevSlot = require("./routes/getprevSlot");
app.use(getprevSlot);
const getCurrentGrade = require("./routes/getCurrentslot");
app.use(getCurrentGrade);
const nextSlot = require("./routes/nextSlot");
app.use(nextSlot);
const uploadCSV = require("./routes/membersCsv");
app.use(uploadCSV);
const changeyourpassword = require("./routes/changeyourpassword");
app.use(changeyourpassword);

const administratorPage = require("./routes/administratorPage");
app.use(administratorPage);

async function buildAdminIfNotExists() {
  try {
    const users = readJSONFile("userdata.json");

    if (users.length === 0) {
      const hashpass = await bcrypt.hash("admin123", 10);

      users.push({
        email: "admin@uwo.ca",
        password: hashpass,
        role: "administrator",
        firstLogin: true,
      });

      writeJSONFile("userdata.json", users);

      console.log("✅ Default administrator account created.");
      console.log("   Email: admin@uwo.ca");
      console.log("   Password: admin123");
    } else {
      console.log("An administrator account is already exists.");
    }
  } catch (err) {
    console.error(" Can not initialize administrator:", err.message);
  }
}

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on port ${PORT}`);
  await buildAdminIfNotExists();
});
