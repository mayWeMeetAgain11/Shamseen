require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { sequelize } = require("./utils/database");
const app = express();
const cors = require("cors");
const logger = require("./utils/logger");
const hbs = require("hbs");
const jwtMiddleware = require("./utils/auth/jwtMiddleware");

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "/public/views"));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/shamseen/public", express.static(path.join(__dirname, "public")));

app.get("/shamseen", (req, res) => {
  return res.json("welcome to shamseen app!");
});
app.use("/shamseen/sell-points", require("./src/app/SellPoint/router"));
app.use("/shamseen/drivers", require("./src/app/Driver/router"));
app.use("/shamseen/schools", require("./src/app/School/router"));
app.use("/shamseen/promoters", require("./src/app/Promoter/router"));
app.use("/shamseen/managers", require("./src/app/Manager/router"));
app.use("/shamseen/bill", require("./src/app/Bill/router"));
app.use("/shamseen/category", require("./src/app/Category/router"));
app.use("/shamseen/card-charge", require("./src/app/CardCharge/router"));
app.use("/shamseen/sellpoint-bill", require("./src/app/SellPointBill/router"));
app.use("/shamseen/inventory", require("./src/app/Inventory/router"));
app.use("/shamseen/student", require("./src/app/Student/router"));
app.use("/shamseen/payment", require("./src/app/Payment/router"));

app.listen({ port: process.env.PORT }, async () => {
  //await sequelize.sync({alter:true});
  console.log("starting on port : " + process.env.PORT);
});
