const express = require("express");
const app = express();
const path = require("path");
const mysql = require("mysql2");
require('dotenv').config();
const methodOverride = require("method-override");
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded(({extended: true})));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// SETTING UP THE CONNECTION BETWEEN DATABASE AND INDEX.JS
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync(process.env.DB_SSL_CA)
  }
});

connection.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.stack);
    return;
  }
  console.log('✅ Connected to FreeDB.tech MySQL database');
});

app.get("/", (req, res) => {
  let { Consult, experience, fees } = req.query;

  // Normalize to arrays
  Consult = [].concat(Consult || []);
  experience = [].concat(experience || []);
  fees = [].concat(fees || []);

  let conditions = [];

  // Consult filter
  if (Consult.length > 0) {
    const consultValues = Consult.map(c => connection.escape(c)).join(",");
    conditions.push(`consult IN (${consultValues})`);
  }

  // Experience filter
  if (experience.length > 0) {
    const expConditions = experience.map(range => {
      if (range === "0-5") return `(experience BETWEEN 0 AND 5)`;
      if (range === "6-10") return `(experience BETWEEN 6 AND 10)`;
      if (range === "11-16") return `(experience BETWEEN 11 AND 16)`;
      if (range === "16+") return `(experience > 16)`;
    }).filter(Boolean);
    conditions.push(`(${expConditions.join(" OR ")})`);
  }

  // Fees filter
  if (fees.length > 0) {
    const feesConditions = fees.map(range => {
      if (range === "100-500") return `(fees BETWEEN 100 AND 500)`;
      if (range === "500-1000") return `(fees BETWEEN 500 AND 1000)`;
      if (range === "1000+") return `(fees > 1000)`;
    }).filter(Boolean);
    conditions.push(`(${feesConditions.join(" OR ")})`);
  }

  let q = `SELECT * FROM physicians`;
  if (conditions.length > 0) {
    q += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Run query
  connection.query(q, (err, result) => {
    if (err) {
      console.error("Error while querying DB:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.render("destinationPage.ejs", { result });
  });
});
//REQUEST FOR PROVIDING FORM FOR ADDING USER
app.get("/form", (req, res) => {
   res.render("form.ejs");
});
//REQUEST FOR ADDING NEW DOCTOR'S DATA TO DATABASE AND WEBPAGE
app.post("/addDoctor", (req, res) => {
    let {Name: name, Experience: experience, Fees: fees, Consult: consult} = req.body;
    let q = `INSERT INTO physicians (name, experience, fees, consult) VALUES ("${name}", "${experience}", "${fees}", "${consult}")`;
    try{
      connection.query(q, (err, result) => {
        if(err) throw err;
        res.redirect("/");
      });
    }catch(error){
     console.log(`Error occured: ${error}`);
    }
    console.log(req.body);
});
app.listen(PORT, () => {
    console.log("Listening Started At", PORT);
});