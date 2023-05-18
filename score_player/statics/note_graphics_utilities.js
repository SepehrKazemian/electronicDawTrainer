
export function parseAbc(abc) {
    const lines = abc.split("\n");

    let timeSig = null;
    let notes = "";
    let barCounter = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith("M:")) {
            timeSig = line.substring(2).trim();
        } else if (line.startsWith("|:")) {
            // console.log(1, notes);
            if (notes[notes.length - 1] != "|") {
                notes += "|" + line.substring(2);
            }
            else
                notes += line.substring(2);

            // console.log(notes);
        }
        else if (line.startsWith("|")) {
            if (notes[notes.length - 1] != "|") {
                notes += "|" + line;
            }
            else
                notes += line;
            // console.log(notes);
        }
    }
    barCounter = notes.split("|").length - 2;
    // console.log(barCount);

    return { timeSig, notes, barCounter };
}

export function findLcm(a, b) {
    let lcm = 0;
    let bigger = Math.max(a, b);

    while (true) {
        if (bigger % a == 0 && bigger % b == 0) {
            lcm = bigger;
            break;
        }
        bigger++;
    }

    return lcm;
}

export function barTotalCountFinder(notes) {
    const notePattern = /([A-Za-z])(\d+|\d\/\d)/g;
    const bars = notes.split("|").slice(1, -1);
    const barTotalCounts = bars.map(bar => {
        let sum = 0;
        let match;
        while (match = notePattern.exec(bar)) {
            const [, , duration] = match;
            sum += parseInt(duration);
        }
        return sum;
    });
    return barTotalCounts;
}

export function instrumentCounter(notes) {
    const letterCount = {};
    for (let i = 0; i < notes.length; i++) {
        const character = notes[i];
        if (character.match(/[a-zA-Z]/)) { // Check if the character is a letter
            letterCount[character] = (letterCount[character] || 0) + 1; // Increment the count for the letter
        }
    }
    return Object.keys(letterCount).length
}

export function getNoteDurations(notes) {
    const noteDict = {};
    let currentNote = "";
    let currentDuration = "";
    let currentBar = "";

    // Extract unique case-sensitive letters
    for (let i = 0; i < notes.length; i++) {
        const currentChar = notes[i];
        if (/[A-Za-z]/.test(currentChar)) {
            noteDict[currentChar] = [];
        }
    }
    // console.log("note dict ", noteDict);

    // Parse notes
    for (let i = 0; i < notes.length; i++) {
        // console.log("current Char: ", notes[i], currentDuration, currentNote);
        // console.log("noteDict: ", noteDict);
        const currentChar = notes[i];
        if (currentChar === " ") {
            continue;
        }
        else if (/[A-Za-z]/.test(currentChar)) {
            if (currentDuration == "")
                currentNote = currentChar;
            else {
                noteDict[currentNote].push(currentDuration);
                for (const key in noteDict) {
                    if (key !== currentNote) {
                        noteDict[key].push("0");
                    }
                }
                currentDuration = "";
                currentNote = currentChar;
            }
        }
        // Start of a new note
        else if (/[0-9/]/.test(currentChar)) {
            // Add to duration
            currentDuration += currentChar;
        }
        else if (currentChar === "|") {
            // End of bar, add to noteDict
            if (currentNote != "") {
                noteDict[currentNote].push(currentDuration);
                for (const key in noteDict) {
                    if (key !== currentNote) {
                        noteDict[key].push("0");
                    }
                }
            }
            for (const key in noteDict) {
                noteDict[key].push("|");
            }
            currentDuration = "";
            currentNote = "";

        }
    }
    console.log("final noteDict: ", noteDict);

    return noteDict;
}

export function maxValuesByIndex(notes) {
    const result = [];
    const keys = Object.keys(notes);
    const len = notes[keys[0]].length;
    for (let i = 0; i < len; i++) {
        let max = 0;
        for (let j = 0; j < keys.length; j++) {
            if (notes[keys[j]][i] != "|") {
                if ((parseFraction(notes[keys[j]][i]) > max) || (parseFraction(notes[keys[j]][i]) > max))
                    max = parseFraction(notes[keys[j]][i]);
            }
            else
                max = "|";
        }
        result.push(max);
    }
    return result;
}

export function parseFraction(value) {
    if (typeof value == "string") {
        console.log(value, value.split('/'));
        let [num, denom] = value.split('/');
        if (denom === undefined) {
            return parseFloat(num);
        } else {
            return parseFloat(num) / parseFloat(denom);
        }
    }
    else
        return value
}

export function beatPartitions(arr) {
    let lessThanOne = [];

    for (let i = 0; i < arr.length; i++) {
        console.log(typeof arr[i], arr[i], arr[i] > 0);
        if (arr[i] > 0 && arr[i] < 1) {
            lessThanOne.push(1 / arr[i]);
        }
    }
    console.log("lessThanOne ", lessThanOne);
    return lessThanOne
}

export function noteWeightening(noteDuration, partitions) {
    const keys = Object.keys(noteDuration);
    const dictWeight = {};
    const len = noteDuration[keys[0]].length;
    for (let i = 0; i < keys.length; i++) {
        dictWeight[keys[i]] = [];
        for (let j = 0; j < noteDuration[keys[i]].length; j++) {
            if (noteDuration[keys[i]][j] == "|") {
                dictWeight[keys[i]].push("|")
                continue
            }
            dictWeight[keys[i]].push(parseFraction(noteDuration[keys[i]][j]) * partitions);
        }
    }
    console.log(dictWeight, partitions);

    return dictWeight
}

export function findCommonBeat(partitions) {
    console.log("here: ", partitions);
    let lcm = 1;
    for (let i = 0; i < partitions.length; i++) { // values must be positive and better all be string or int
        lcm = findLcm(lcm, partitions[i]);
    }
    console.log("lcm: ", lcm);
    return lcm
}

