const express = require("express");
const app = express();
const path = require("path");

app.use(express.urlencoded(({extended: true})));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/apollo", (req,res) => {
   res.render("destinationPage.ejs");
});
app.listen(8080, () => {
    console.log("Listening Started");
});