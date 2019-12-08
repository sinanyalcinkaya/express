var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
//var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
//app.use('/users', usersRouter);

function getSprites(ses, cinsiyet) {
  let file = "public/ses/" + cinsiyet + "/" + ses + ".textGrid";
  const fs = require("fs");
  var a = fs
    .readFileSync(file)
    .toString()
    .split("\n");

  var sprite = {};
  sprite["tumu"] = [0, parseFloat(a[4].replace("\r", ""))];

  for (i in a) {
    var hece = a[i].replace(/\s/g, "").replace("\r", "");

    if (i < 12 || !hece.startsWith('"') || hece == '""') {
      continue;
    }

    // "ha" => ha olarak çevriliyor
    hece = hece.split('"').join("");
    var start = parseFloat(a[i - 2].replace("\r", ""));
    var end = parseFloat(a[i - 1].replace("\r", ""));
    var duration = end - start;

    sprite[hece] = [start, duration];
  }
  return sprite;
}

app.get("/e/:kelime", function(req, res, next) {
  res.render("ses", {
    title: req.params.kelime,
    cinsiyet: "e",
    sprites: JSON.stringify(getSprites(req.params.kelime, "k"))
  });
});

app.get("/k/:ses", function(req, res, next) {
  res.render("ses", {
    title: req.params.kelime,
    cinsiyet: "k",
    sprites: JSON.stringify(getSprites(req.params.kelime, "k"))
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let kelime = req.url.substring(1);

  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
