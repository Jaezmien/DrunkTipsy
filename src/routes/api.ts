import express from 'express'
import { UploadedFile } from 'express-fileupload'
import { ParseZip } from '../lib/stepzip'
import fs from "fs";
import path from "path";
import { Song } from '../lib/Simfile/Simfile';
const api = express.Router()
// --

api.post("/upload", (req, res) => {

	if( !req.files || !req.files.file ) {
		return res.status(400).send( "Missing file." )
	}

	const file = req.files.file as UploadedFile
	if( !["application/zip", "application/x-zip-compressed"].find(x => file.mimetype === x) || !file.name.endsWith(".zip") ) {
		return res.status(400).send( "Invalid file type." )
	}

	const zip_dir = path.join(__dirname,"../../files/Songs/" + file.md5 + ".zip");
	try {
		fs.statSync(zip_dir)
		return res.status(200).send( "Uploaded file already exists." );
	}
	catch(e){}

	let status = "";

	try {
		const data = ParseZip( file.data )
		if( data instanceof Song ) {
			// Uploaded individual song
			status = "File uploaded to database."
		} else {
			// Uploaded a pack
			status = "Pack uploaded to database."
		}
		
		fs.writeFileSync(zip_dir, file.data);
	}
	catch( e ) {
		console.log(e);
		return res.status(500).send( typeof e === "string" ? e : "Internal Server Error" )
	}

	res.status(200).send( status )

});

// --
export { api }