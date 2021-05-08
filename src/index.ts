// Set environment variables
import dotenv from "dotenv"; dotenv.config();

// #region Setup Express
import express from "express"
import cookieParser from "cookie-parser"
import session from "express-session"
import fileUpload from "express-fileupload";

const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser())
app.use(fileUpload({ limits: 50 * 1024 * 1024 }))

// Http + Https - https://stackoverflow.com/a/40324493
let session_opt: any = {
	secret: process.env.DRUNKTIPSY_COOKIE_SECRET ?? "",
	resave: false, saveUninitialized: true, cookie: { secure: false, },
}
if (process.env.DRUNKTIPSY_DEPLOYMENT_TYPE === "PRODUCTION") {
	app.set('trust proxy', 1)
	session_opt.cookie.secure = true
}

console.log("⚠ Server deployment type: " + process.env.DRUNKTIPSY_DEPLOYMENT_TYPE)
app.use( session(session_opt) )

// Setup routes
import { auth as DrunkTipsy_AuthRoute } from "./routes/auth"
import { api as DrunkTipsy_ApiRoute } from "./routes/api"
app.use( "/auth", DrunkTipsy_AuthRoute )
app.use( "/api", DrunkTipsy_ApiRoute )

// #endregion

app.get( "/", (req, res) => {
	res.send("👋 Hello World")	 
} )

app.listen( 8573 ); // Konmai 
console.log("🚀 Server is now live at port 8573!")