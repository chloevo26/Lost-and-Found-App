const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const assets = require("./assets");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const passport = require('passport');
const passportSetup = require('./config/passport-setup');
const authRoutes = require('./routes/auth-routes.js');
const sql = require('sqlite3').verbose();
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const request = require('request');
const keys = require("./config/keys")




const SECRET_KEY = keys.keys.secret_key;
const API_KEY = keys.keys.api_key;
const STORAGE_KEY = keys.keys.storage_key;

const SESSION_COOKIE = "ecs162-session-cookie";
const GOOGLE_PASSPORT_COOKIE = "google-passport-cookie";
const LOGIN_REDIRECT = "/views/screen2.html";
const LOGOUT_REDIRECT = "/";
const GEOCODE_API = "https://maps.googleapis.com/maps/api/geocode/json"
const PLACES_API = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
const PLACES_FIELDS = "photos,formatted_address,name,rating,opening_hours,geometry"
const PLACES_BIAS = "circle:100000@38.5367859,-121.7553711"

let upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, __dirname + "/images");
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    })
});

app.get("/getAddress", (req, res) => {
    let url = `${GEOCODE_API}?latlng=${req.query.lat},${req.query.lng}&key={API_KEY}`;
    request(url, { json: true }, (error, resp, body) => {
        if (error) {
            console.log(error);
            return;
        }
        res.json(body);
    });
});

app.get("/searchAddress", (req, res) => {
    const url = `${PLACES_API}?input=${req.query.input}&inputtype=textquery&fields=${PLACES_FIELDS}&locationbias=${PLACES_BIAS}&key=${API_KEY}`;
    request(url, { json: true }, (error, resp, body) => {
        if (error) {
            console.log(error);
            return;
        }
        res.json(body);
    });
});

const lostfoundDB = new sql.Database("lostfound.db");
const cmd =
    "SELECT name FROM sqlite_master WHERE type='table' AND name='LostfoundTable'";
lostfoundDB.get(cmd, (err, val) => {
    if (val == undefined) {
        console.log("No database file - creating one");
        const cmd =
            "CREATE TABLE LostfoundTable (rowIdNum INTEGER PRIMARY KEY, lostfound TEXT, title TEXT, category TEXT, description TEXT, photoURL TEXT, dateTime TEXT, location TEXT)";
        lostfoundDB.run(cmd, (err, val) => {
            if (err) console.log("Database creation failure", err.message);
            else console.log("Create database");
        });
    } else console.log("Database already exits");
});

const session = expressSession({
    secret: SECRET_KEY,
    maxAge: 6 * 60 * 60 * 1000,
    resave: true,
    saveUninitialized: false,
    name: SESSION_COOKIE
});

app.use(express.static("public"));
app.use("/assets", assets);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (request, response) => {
    response.sendFile(__dirname + "/public/index.html");
});
app.get("/*", express.static("public"));
app.get("/views/*", requireUser, requireLogin, express.static("."));
app.use("/auth", authRoutes);
app.get("/setcookie", requireUser, (req, resp) => {
    resp.cookie(GOOGLE_PASSPORT_COOKIE, Date());
    resp.redirect(LOGIN_REDIRECT);
});
app.get("/user/logoff", (req, resp) => {
    resp.clearCookie(GOOGLE_PASSPORT_COOKIE);
    resp.clearCookie(SESSION_COOKIE);
    resp.redirect(LOGOUT_REDIRECT);
});


// INSERT FOUND ITEMS TO TABLE
app.post("/foundData", (req, res, next) => {
    let title = req.body.title;
    let category = req.body.category;
    let description = req.body.description;
    let dateTime = req.body.date + ' ' + req.body.time + ":00";
    let photoUrl = req.body.imageUrl;
    let location = req.body.location;
    let type = "Found";

    const cmd =
        "INSERT INTO LostfoundTable (lostfound, title, category, description, photoURL, dateTime,location) VALUES (?,?,?,?,?,?,?)";
    lostfoundDB.run(
        cmd,
        type,
        title,
        category,
        description,
        photoUrl,
        dateTime,
        location,
        function (err) {
            if (err) {
                console.log("DB insert error", err.message);
                next();
            } else res.send("Found data inserted in rowId = " + this.lastID);
        }
    );
});

// INSERT LOST ITEM TO TABLE
app.post("/lostData", (req, res, next) => {
    let title = req.body.title;
    let category = req.body.category;
    let description = req.body.description;
    let dateTime = req.body.date + ' ' + req.body.time + ":00";
    let photoUrl = req.body.imageUrl;
    let location = req.body.location;
    let type = "Lost";

    const cmd =
        "INSERT INTO LostfoundTable (lostfound, title, category, description, photoURL, dateTime,location) VALUES (?,?,?,?,?,?,?)";
    lostfoundDB.run(
        cmd,
        type,
        title,
        category,
        description,
        photoUrl,
        dateTime,
        location,
        function (err) {
            if (err) {
                console.log("DB insert error", err.message);
                next();
            } else res.send("Found data inserted in rowId = " + this.lastID);
        }
    );
});

// SEARCH FOR DATA
app.post("/searchDb", (req, resp, next) => {
    let startDate = req.body.startDate;
    let endDate = req.body.endDate;
    let startTime = req.body.startTime;
    let endTime = req.body.endTime;
    let category = req.body.category;
    let location = req.body.location;
    let lostfound = req.body.lostFound;
    let anotherInput = req.body.anotherInput;

    // console.log(startTime);
    // console.log(endTime);
    if (startDate && endDate == "") {
        endDate = getToday();
    }
    if (startDate && startTime == "") {
        startTime = "1:00:00"
    } else {
        startTime = startTime + ":00"
    }
    if (endDate && endTime == "") {
        endTime = "24:59:59"
    } else {
        endTime = endTime + ":00"
    }

    let start = startDate + ' ' + startTime;
    let end = endDate + ' ' + endTime;

    console.log("From", start, "to", end);
    // console.log("From", startTime, "to", endTime);
    console.log("Category", category, " Location", location, "Type", lostfound, "Another input ", anotherInput);
    let startQueryString = "SELECT * FROM LostfoundTable WHERE lostfound =?";
    let queryString = startQueryString
    let searchData = [lostfound];

    // checking for input
    if (start != " :00" && end != " :00") {
        queryString = queryString + " AND dateTime BETWEEN ? AND ?"
        searchData.push(start);
        searchData.push(end);
    }
    if (category != "") {
        queryString = queryString + " AND category=?"
        searchData.push(category)
    }
    if (location != "") {
        queryString = queryString + " AND location=?"
        searchData.push(location)
    }
    if (anotherInput != "") {
        queryString = queryString + " AND (title LIKE ? OR description LIKE ?)"
        searchData.push('%' + anotherInput + '%');
        searchData.push('%' + anotherInput + '%');
    }
    console.log(queryString)
    console.log(searchData)
    const cmd = queryString;

    lostfoundDB.all(cmd, searchData, (err, rows) => {
        if (err) resp.send(err);
        else resp.send(rows);
    });
});

function getToday() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;
    // document.write(today);
    return today
}

app.post("/finder", (req, res) => {
    console.log("Navigate to page 3");
    res.send();
});

app.post("/seeker", (req, res) => {
    console.log("Navigate to page 6");
    res.send();
});

// Handle a post request to upload an image.
app.post("/upload", upload.single("newImage"), function (req, res) {
    console.log("Recieved", req.file.originalname, req.file.size, "bytes");
    if (req.file) {
        sendMediaStore(req.file.originalname, req, res);
    } else throw "error";
});

// handles the upload to the media storage API
function sendMediaStore(filename, serverRequest, serverResponse) {
    let apiKey = STORAGE_KEY;
    if (apiKey === undefined) {
        serverResponse.status(400);
        serverResponse.send("No API key provided");
    } else {
        // we'll send the image from the server in a FormData object
        let form = new FormData();

        // we can stick other stuff in there too, like the apiKey
        form.append("apiKey", apiKey);
        // stick the image into the formdata object
        form.append(
            "storeImage",
            fs.createReadStream(__dirname + "/images/" + filename)
        );
        // and send it off to this URL
        form.submit("http://ecs162.org:3000/fileUploadToAPI", function (
            err,
            APIres
        ) {
            if (APIres) {
                console.log("API response status", APIres.statusCode);

                let body = "";
                APIres.on("data", chunk => {
                    body += chunk;
                });
                APIres.on("end", () => {
                    if (APIres.statusCode != 200) {
                        serverResponse.status(400); // bad request
                        serverResponse.send(" Media server says: " + body);
                    } else {
                        serverResponse.status(200);
                        serverResponse.send(body);
                    }
                    fs.unlink(__dirname + "/images/" + filename, err => {
                        if (err) {
                            console.log("failed to delete local image:" + err);
                        } else {
                            console.log("successfully deleted local image");
                        }
                    });
                });
            } else {
                // didn't get APIres at all
                serverResponse.status(500); // internal server error
                serverResponse.send("Media server seems to be down.");
            }
        });
    }
}

function requireUser(req, res, next) {
    if (!req.user) res.redirect("/");
    else if (req.user.id == -1) res.redirect("/index.html?email=notUCD");
    else next();
}

function requireLogin(req, res, next) {
    console.log("checking:", req.cookies);
    if (!req.cookies[SESSION_COOKIE]) res.redirect("/");
    else next();
}

app.listen(process.env.PORT || 1800, process.env.IP, () => {
    console.log("Server started");
});

