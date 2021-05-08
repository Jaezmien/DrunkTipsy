/*
 * StepZip.ts
 * For checking uploaded .zip files. 
 *
*/

import admzip, { IZipEntry } from "adm-zip"
import { Song } from './Simfile/Simfile'
import LoadSMFile from "./Simfile/SimfileLoader"

enum StepZipType {
	SINGLE,
	PACK,
}
interface StepZipOptions {
	allowed_types: StepZipType
}
enum ZipType {
	PROPER, // Zipped folder
	IMPROPER // Selected files > Zip into folder
}

function LoadFile( zip_entries: IZipEntry[] ) {
	if( !zip_entries.find(x => x.name.endsWith(".sm")) ) throw "Invalid simfile."

	let simfile = zip_entries.find( x => x.name.endsWith(".sm") )!.getData().toString("utf-8")
	let result: Song
	try {
		result = LoadSMFile( simfile.split(/\r?\n/g) )
	} catch( e ) {
		console.log(e)
		throw "Invalid .sm file."
	}
	if( !result.FGChanges.length ) throw "Invalid modfile"

	return result
}

export function ParseZip( buffer: Buffer, options?: StepZipOptions ): Song | Song[] {

	try {

		const zip = new admzip( buffer )

		let result: Song | Song[]

		const zip_entries = zip.getEntries()
		let zip_type: ZipType = ZipType.PROPER
		
		// Check for improper zipping
		{
			if( !zip_entries.some(x => !x.name.length) ) throw "Invalid folder setup." // Check if there's at least a folder
			const base_folder = zip_entries.find(x => !x.name.length)! // get first ""folder"

			// Base folder is different
			if( !zip_entries.every(x => x.entryName.startsWith(base_folder.entryName)) ) {
				zip_type = ZipType.IMPROPER
			}
		}

		if( zip_type === ZipType.PROPER && zip_entries.filter(x => x.name.endsWith(".sm")).every(x => x.entryName.split('/').length === 3) ) {

			// Packs
			let folder_entry = zip_entries[0].entryName
			let file_entries: { [key: string]: IZipEntry[] } = {}
			zip_entries.filter(x => x.entryName.split('/').length > 2).forEach(x => {
				const dir = x.entryName.substr(folder_entry.length)
				const folder_name = dir.split('/')[0]
				if( !file_entries[folder_name] ) file_entries[folder_name] = [];
				
				x.entryName = x.entryName.substr(folder_entry.length );
				file_entries[folder_name].push( x )
			})

			let temp: Song[] = []
			Object.keys(file_entries).forEach(x => {
				temp.push( LoadFile(file_entries[x]) )
			})
			result = temp

			// TODO: Maybe save some extra information (banner is always first image at root folder)

		}
		else {

			// Proper & Improper Files
			result = LoadFile( zip_entries )
		}

		if( options ) {

			if( options.allowed_types !== (result as Song ? StepZipType.SINGLE : StepZipType.PACK) ) {
				throw `Not allowing the upload of ${ result as Song ? "Song" : "Pack" }.`
			}

		}

		return result

	}
	catch( e ) {
		throw e
	}

}