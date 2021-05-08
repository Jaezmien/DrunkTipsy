import { MSDFile } from "./MSDFile";
import { BGAnimation, Song, SongBPMDisplay, SongSelectable, Steps, StepsDifficulty, StepsType } from "./Simfile";

export default function (data: string[]): Song {
	let msd = new MSDFile(data);
	let song = new Song();

	// LoadSMFileTimings( msd, song );

	let i = 0;
	while (i < msd.GetNumValues()) {
		let params = msd.GetValue(i);
		let value_name = msd.GetParam(i, 0).toUpperCase();

		switch (value_name) {
			case "TITLE":
				song.MainTitle = params[1];
				break;
			case "SUBTITLE":
				song.SubTitle = params[1];
				break;
			case "ARTIST":
				song.Artist = params[1];
				break;
			case "TITLETRANSLIT":
				song.MainTitleTranslit = params[1];
				break;
			case "SUBTITLETRANSLIT":
				song.SubTitleTranslit = params[1];
				break;
			case "ARTISTTRANSLIT":
				song.ArtistTranslit = params[1];
				break;
			case "GENRE":
				song.Genre = params[1];
				break;
			case "CREDIT":
				song.Credit = params[1];
				break;
			case "BANNER":
				song.BannerFile = params[1];
				break;
			case "BACKGROUND":
				song.BackgroundFile = params[1];
				break;
			case "LYRICSPATH":
				song.LyricsFile = params[1];
				break;
			case "CDTITLE":
				song.CDTitleFile = params[1];
				break;
			case "MUSIC":
				song.MusicFile = params[1];
				break;
			case "MUSICLENGTH":
				song.MusicLengthSeconds = parseFloat(params[1]);
				break;
			case "MUSICBYTES":
				break; // Ignore
			case "FIRSTBEAT":
				song.FirstBeat = params[1] ? (parseFloat(params[1])) : 0;
				break;
			case "LASTBEAT":
				song.LastBeat = params[1] ? (parseFloat(params[1])) : 0;
				break;
			case "SONGFILENAME":
				song.SongFileName = params[1];
				break;
			case "HASMUSIC":
				song.HasMusic = params[1] !== undefined;
				break;
			case "HASBANNER":
				song.HasBanner = params[1] !== undefined;
				break;
			case "SAMPLESTART":
				song.SampleStart = parseFloat(params[1]);
				break;
			case "SAMPLELENGTH":
				song.SampleLength = parseFloat(params[1]);
				break;
			case "DISPLAYBPM": {
				if (params[1] == "*") {
					song.DisplayBPMType = SongBPMDisplay.RANDOM
				} else {
					song.DisplayBPMType = SongBPMDisplay.SPECIFIED
					song.SpecifiedBPMMin = parseFloat(params[1]) || undefined;
					if (params[2].trim()) {
						song.SpecifiedBPMMax = song.SpecifiedBPMMin
					} else {
						song.SpecifiedBPMMax = parseFloat(params[2]) || undefined;
					}
				}
			}
				break;
			case "SELECTABLE": {
				if (params[1].trim()) {

					if (params[1] == "YES") {
						song.SelectionDisplay = SongSelectable.SHOW_ALWAYS
					} else if (params[1] == "NO") {
						song.SelectionDisplay = SongSelectable.SHOW_NEVER
					} else if (params[1] == "ROULETTE") {
						song.SelectionDisplay = SongSelectable.SHOW_ROULETTE
					}

				}
			}
				break;
			case "BGCHANGES": {
				for (let bgchange of params[1].split(",")) {
					if (bgchange.trim()) song.BGChanges.push(new BGAnimation(bgchange));
				}
			}
				break;
			case "BETTERBGCHANGES": {
				song.ForNotITG = true;
				for (let betterbgchange of params[1].split(",")) {
					if (betterbgchange.trim()) song.BetterBGChanges.push(new BGAnimation(betterbgchange));
				}
			}
				break;
			case "FGCHANGES": {
				for (let fgchange of params[1].split(",")) {
					if (fgchange.trim()) song.FGChanges.push(new BGAnimation(fgchange));
				}
			}
				break;

			case "NOTES": {
				if (params.length < 7) {
					console.error("(#NOTES) Expected at least 7 fields, got " + params.length); break;
				}

				let steps = new Steps();

				if (params[1] == "dance-single")
					steps.ChartType = StepsType.DANCE_SINGLE
				else if (params[1] == "dance-double")
					steps.ChartType = StepsType.DANCE_DOUBLE
				else {
					console.error("(#NOTES) Invalid or unhandled step type")
					break;
				}

				steps.Author = params[2];
				steps.Difficulty = StepsDifficulty[params[3] as keyof typeof StepsDifficulty]
				steps.Meter = parseFloat(params[4]);

				let radarIndex = 0;
				for (let radarMeter of params[5].split(","))
					steps.GrooveRadar[radarIndex++] = parseFloat(radarMeter);

				// steps.ParseNoteData( params[6] )
				if (song.Steps[steps.Difficulty] === undefined)
					song.Steps[steps.Difficulty] = []
				song.Steps[steps.Difficulty].push(steps);
			}
				break;

			case "BPMS": {
				for (let bpmchange of params[1].split(",")) {
					const values = bpmchange.split('=');
					if (values.length !== 2) continue;

					song.BPMs[parseFloat(values[0])] = parseFloat(values[1]);
				}
			}
				break;

			case "OFFSET": {
				song.Beat0OffsetInSeconds = parseFloat(params[1]);
			}
				break;

			case "FREEZES":
			case "STOPS": {
				for (let stops of params[1].split(",")) {
					const values = stops.split('=');
					if (values.length !== 2) continue;

					song.Stops[parseFloat(values[0])] = parseFloat(values[1]);
				}
			}
				break;

			case "KEYSOUNDS":
				break;
			default:
				console.log("Unexpected SM Value: " + value_name)
				break;

		}

		i++;
	}

	return song;
}