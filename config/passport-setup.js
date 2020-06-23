const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const request = require("request");


const CLIENT_ID = '514027619387-tjdhl7pipkl0tk6ut6oklmu4gfa1cjnl.apps.googleusercontent.com';
const CLIENT_SECRET = 'HwB9bOoThgHi71Kwy_oWSwNP';

// const APP_URL = "https://cypress-tangy-mortarboard.glitch.me";
// const APP_URL = "https://radial-periodic-soursop.glitch.me";

const APP_URL = "http://localhost:1800"
const ACCEPTED_DOMAIN = "ucdavis.edu";
const REVOKE_API = "https://accounts.google.com/o/oauth2/revoke";
const USER_INFO_API = "https://www.googleapis.com/oauth2/v3/userinfo";


passport.serializeUser((id, done) => {
  console.log("Serialize User. ID: ", id);
  done(null, id);
});

passport.deserializeUser((id, done) => {
  console.log("Deserialize User. ID: ", id);
  done(null, {
    id: id
  });
});



const strategy = new GoogleStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: `${APP_URL}/auth/accepted`,
    userProfileURL: USER_INFO_API,
    scope: ["profile", "email"]
  }, (accessToken, refreshToken, profile, done) => {
    let id = -1;
    if (profile.emails[0].value.endsWith(ACCEPTED_DOMAIN)) id = getId();
    else
      request.get(
        REVOKE_API,
        { qs: { token: accessToken } },
        (err, res, body) => {
          console.log("revoked token");
        }
      );
    done(null, id);
  });

passport.use(strategy);

function getId() {
  var result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 36; i++)
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  return result;
}

