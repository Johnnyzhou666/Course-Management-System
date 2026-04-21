const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const courseFile = path.join(dataDir, "courses.json");
const membersFile = path.join(dataDir, "members.json");
const signupsFile = path.join(dataDir, "signups.json");
const slotsFile = path.join(dataDir, "slots.json");
const gradesFile = path.join(dataDir, "grades.json");
const enrollmentsFile = path.join(dataDir, "enrollments.json");
const usersFile = path.join(dataDir, "userdata.json"); 

function makesureDataexist() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

  if (!fs.existsSync(courseFile)) fs.writeFileSync(courseFile, "[]");
  if (!fs.existsSync(membersFile)) fs.writeFileSync(membersFile, "[]");
  if (!fs.existsSync(signupsFile)) fs.writeFileSync(signupsFile, "[]");
  if (!fs.existsSync(slotsFile)) fs.writeFileSync(slotsFile, "[]");
  if (!fs.existsSync(gradesFile)) fs.writeFileSync(gradesFile, "[]");
  if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, "[]");
  if (!fs.existsSync(enrollmentsFile)) fs.writeFileSync(enrollmentsFile, "[]");
}

module.exports = makesureDataexist;
