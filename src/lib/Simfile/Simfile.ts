const MAX_EDIT_SIZE_BYTES = 20*1024	// 20 KB
const DEFAULT_MUSIC_SAMPLE_LENGTH = 12;

export class BGAnimation {
    
    // https://github.com/stepmania/stepmania/wiki/sm#bgchanges
    startBeat: number = 0; // 0.000
    fileName: string = "";
    playRate: number = 1; // 1.000

    CrossFade: number = 0; // [0,1]
    StretchRewind: number = 0; // [0,1]
    StretchNoLoop: number = 1; // [0,1]

    EffectFile: string = "";
    EffectFile2: string = "";
    TransitionFile: string = "";

    ColorString: string = "";
    ColorString2: string = "";

    constructor( line: string ) {
        let line_s = line.split('=')
        if( line_s.length < 11 ) {
            let i = line_s.length; line_s.length = 11
            for(let x = i; x < 11; x++)
                line_s[x] = "e";
        }

        this.startBeat = Number( line_s.shift() )
        this.fileName = line_s.shift()!;
        this.playRate = Number( line_s.shift() );
        this.CrossFade = (line_s.shift()! == "1") ? 1 : 0;
        this.StretchRewind = (line_s.shift()! == "1") ? 1 : 0;
        this.StretchNoLoop = (line_s.shift()! == "1") ? 1 : 0;
        this.EffectFile = line_s.shift()!;
        this.EffectFile2 = line_s.shift()!;
        this.TransitionFile = line_s.shift()!;
        this.ColorString = line_s.shift()!;
        this.ColorString2 = line_s.shift()!;    
    }
    toString(): string {

        return `${ this.startBeat.toFixed(3) }=${ this.fileName }=${ this.playRate.toFixed(3) }=` +
            `${ this.CrossFade }=${ this.StretchRewind }=${ this.StretchNoLoop }=` +
            `${ this.EffectFile }=${ this.EffectFile2 }=${ this.TransitionFile }=` +
            `${ this.ColorString.replace(/,/g, "^") }=${ this.ColorString2.replace(/,/g, "^") }`; // UGLY: escape "," in colors.

    }

}

export enum SongBPMDisplay {
    ACTUAL,
    RANDOM,
    SPECIFIED
}
export enum SongSelectable {
    SHOW_ALWAYS,
    SHOW_NEVER,
    SHOW_ROULETTE
}
export enum StepsType {
    DANCE_SINGLE,
    DANCE_DOUBLE,
}
export enum StepsDifficulty {
    Beginner,
    Easy,
    Medium,
    Hard,
    Challenge,
    Edit
}

export class Steps {
    ChartType = StepsType.DANCE_SINGLE;
    Author = "";
    Difficulty = StepsDifficulty.Beginner;
    Meter = 0;
    GrooveRadar = [0, 0, 0, 0, 0];

	// Misc stuff
	Steps = 0;
	Mines = 0;
	Jumps = 0;
	Hands = 0;
	Holds = 0;
	Rolls = 0;

	ParseNotedata( steps: string ) {
		// TODO: Actually look at in-game implemenention of this
		this.Mines = steps.replace(/[^M]/g,"").length
		
		const measure_regex = new RegExp(`.{0,${ this.ChartType == StepsType.DANCE_SINGLE ? 4 : 8 }}`,"g")
		steps.split( ',' ).forEach(measure => {
			measure.match( measure_regex )!.forEach(line => {
				const t = line.replace(/[03]/g,"")
				if( t.length >= 3 ) {
					this.Hands++
				}
				else if( t.length === 2 ) {
					this.Jumps++
				}
				t.split("").forEach(x => {
					switch(x) {
						case "M": this.Mines++; break;
						case "1": this.Steps++; break;
						case "2": this.Holds++; break;
						case "4": this.Rolls++; break;
					}
				})
			})
		})
		this.Steps += this.Holds + this.Rolls - this.Jumps - this.Hands;
	}
}

export class Song {

    ForNotITG = false;

    BGChanges: BGAnimation[] = [];
    BetterBGChanges: BGAnimation[] = [];
    FGChanges: BGAnimation[] = [];

    MainTitle = "";
    SubTitle = "";
    Artist = "";
    MainTitleTranslit = "";
    SubTitleTranslit = "";
    ArtistTranslit = "";
    Genre = "";
    Credit = "";
    BannerFile = "";
    BackgroundFile = "";
    LyricsFile = "";
    CDTitleFile = "";
    MusicFile = "";
    MusicLengthSeconds = 0;
    FirstBeat = 0;
    LastBeat = 0;
    SongFileName = "";
    HasMusic = false;
    HasBanner = false;
    SampleStart = 0;
    SampleLength = 0;

    DisplayBPMType: SongBPMDisplay = SongBPMDisplay.ACTUAL;
    SpecifiedBPMMin: (number|undefined) = undefined;
    SpecifiedBPMMax: (number|undefined) = undefined;

	Beat0OffsetInSeconds = 0;
	Stops: { [key: number]: number } = {};
	BPMs: { [key: number]: number } = {};

    SelectionDisplay: SongSelectable = SongSelectable.SHOW_ALWAYS;

    Steps: { [key: number]: Steps[] } = {};
    
}