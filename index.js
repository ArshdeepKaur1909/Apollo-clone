const express = require("express");
const app = express();
const path = require("path");
const mysql = require("mysql2");
const methodOverride = require("method-override");

app.use(express.urlencoded(({extended: true})));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'apollo',
    password: 'Arshbanwait2@'
});

app.get("/apollo", (req,res) => { 
   let {Consult, experience, fees} = req.query;
   if(!Consult && !experience && !fees){
    let q = `SELECT * FROM physicians`;
    try{
      connection.query(q, (err, result) => {
        if(err) throw err;
        res.render("destinationPage.ejs", {result});
      });
    }catch(err){
        console.log(`Error: ${err}`);
    }
   }else if(Consult == "Online Consult"){
     let q = `SELECT * FROM physicians WHERE consult = "Online Consult"`;
     try{
      connection.query(q, (err, result) => {
        if(err) throw err;
        res.render("destinationPage.ejs", {result});
      });
    }catch(err){
        console.log(`Error: ${err}`);
    }
   }
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
        res.redirect("/apollo");
      });
    }catch(error){
     console.log(`Error occured: ${error}`);
    }
    console.log(req.body);
});
app.listen(8080, () => {
    console.log("Listening Started");
});