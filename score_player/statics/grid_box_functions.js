export function generateColorArray(noteWeights, extraBeats, noteWeightsMax, maxBeatPositionCounter) {
    const colorArray = [];

    console.log("here");

    const noteMap = {};
    let instCounter = 0;
    for (const key in noteWeights) {
        noteMap[key] = instCounter;
        instCounter += 1;
    }

    const colorMatrix = [];

    for (const key in noteWeights) {
        const instrument = noteMap[key];
        const durationValuesArray = noteWeights[key];
        let barlineCounter = 0;
        if (durationValuesArray[0] === "|") {
            barlineCounter = -1;
        }
        const instrumentColors = [];
        let beatPositionCounter = 0;
        let color = "";

        for (let beatDurationIndex = 0; beatDurationIndex < durationValuesArray.length; beatDurationIndex++) {
            if (durationValuesArray[beatDurationIndex] === "|") {
                barlineCounter += 1;
                continue;
            }

            const beatDuration = durationValuesArray[beatDurationIndex];
            let beatDurationView = beatDuration * extraBeats;

            let coloringBool = true;
            if (beatDurationView == 0) {
                beatDurationView = noteWeightsMax[beatDurationIndex] * extraBeats; // whitespaces
                coloringBool = false;
            }

            for (let beatCount = 0; beatCount < beatDurationView; beatCount++) {
                if (coloringBool)
                    color = getColor(beatCount, beatDurationView);
                else
                    color = "rgb(255, 255, 255)";
                instrumentColors.push(color);
                let box = document.getElementById(`box${instrument}-${barlineCounter}-${beatCount}-${beatDurationIndex}`);
                if (beatPositionCounter < maxBeatPositionCounter) {
                    box.setAttribute("data-beat-position", `box${instrument}-${beatPositionCounter}`);
                    beatPositionCounter += 1;
                }

            }
        }
        colorMatrix.push(instrumentColors);

    }

    return colorMatrix;
}

export function createTimeGrid(extraBeatsPerWeight, barCounter, instrumentCounts, lcm, noteDurations, barTotalCounts, noteWeights, noteWeightsMax, barlinesMaxView, maxBeatPositionCounter) {
    // Define the number of seconds to display
    const barline = barCounter;
    console.log("min is: ", barline);
    const barlineToShow = Math.min(barline, barlinesMaxView);

    const numInstrument = instrumentCounts;

    const extraBeats = extraBeatsPerWeight;
    const numBeats = extraBeats * lcm;


    // Get the container element
    const movingBox = document.getElementById('moving_box');
    const noteImage = document.getElementById('note-image');

    // Define the width of each second as a percentage
    const secondWidth = 100 / barlineToShow;

    const boxWidth = 100 / (barlineToShow * numBeats);
    // const boxHeight = 60 * (matrix.clientHeight / numInstrument) / matrix.clientHeight;
    var counter = 0

    // Loop over each second and create the time grid marks
    for (let i = 0; i < numInstrument; i++) {


        let row = rowSettings(document.createElement('div'), 'row', i, instrumentCounts);
        let extraRow = rowSettings(document.createElement('div'), 'extraRow', i, instrumentCounts);
        extraRow.style.display = "none";

        // console.log(extraRow, row);
        let barlineCounter = 0;

        var margin_between_rows = 2;
        const margin_space = (numInstrument - 1) * margin_between_rows;
        // row.style.width = `${100}%`;
        // console.log(margin_space);
        // row.style.height = `${((100 - margin_space) / numInstrument)}%`;
        let elem = 0
        if (noteWeightsMax[elem] == "|")
            elem = 1;
        barlineCounter = createBoxes(elem, row, barlineCounter, i, extraBeatsPerWeight, noteWeightsMax, boxWidth, barlineToShow);
        barlineCounter = createBoxes(elem, extraRow, barlineCounter, i, extraBeatsPerWeight, noteWeightsMax, boxWidth, barlineToShow);

        console.log(row);
        movingBox.appendChild(row);
        movingBox.appendChild(extraRow);

    }

    movingBox.addEventListener('click', handleBoxClick);

    const matrix = document.getElementById('matrix');
    const left_box = document.getElementById('left_box');
    const rows = movingBox.querySelectorAll('.transition_row');
    const rowsWidth = rows[0].offsetWidth;
    const matrixWidth = movingBox.offsetWidth;

    const boxes = document.querySelectorAll('.box');
    // console.log(numBeats * barline);
    // Repeat(boxes, numBeats, barline, boxWidth, 0.01, numBeats * barline);

    // assuming tempo is 120 bpm and 4/4 time signiature

    // invisibleText = document.getElementById('invisible-text');
    // invisibleText.textContent = intervalId;
    // console.log(intervalId);
    // Repeat(boxes, numBeats, barline, 1)

    // numBeats = 40
    let colorMatrix = generateColorArray(noteWeights, extraBeats, noteWeightsMax, maxBeatPositionCounter);

    console.log("colorMAtrix is: ", colorMatrix);
    return colorMatrix
    // Repeat(sharedVars, noteNumber, beatCount, barCount, noteWeightsMax, extraBeats, numInstrument, barline, barlineToShow);
}


function rowSettings(rowObj, name, index, numInstrument) {
    rowObj.className = "transition_row";
    rowObj.id = name + index.toString();
    rowObj.style.height = `${(100 / numInstrument)}%`;
    if (index !== 0) {
        rowObj.style.paddingTop = `${2}%`;
    }
    return rowObj;
};

function handleBoxClick(event) {
    const box = event.target;
    const x = box.dataset.x;
    const y = box.dataset.y;
    const z = box.dataset.z;

    // Check if the box already has an image
    if (box.classList.contains('active')) {
        // If the box has an image, fade it out
        box.classList.remove('active');
        box.style.backgroundImage = '';
    } else {
        // If the box doesn't have an image, fade it in
        box.classList.add('active');
        // box.style.backgroundImage = none;
    }
}

function createBoxes(elem, row, barlineCounter, i, extraBeats, noteWeightsMax, boxWidth, barlineToShow) {

    let rightBorderBool = false;
    let leftBorderBool = false;
    for (elem; elem < noteWeightsMax.length; elem++) {
        rightBorderBool = (elem + 1 < noteWeightsMax.length) && (noteWeightsMax[elem + 1] === "|");
        leftBorderBool = (elem - 1 < noteWeightsMax.length) && (noteWeightsMax[elem - 1] === "|");

        if (noteWeightsMax[elem] == "|") {
            barlineCounter += 1;
            continue;
        }

        for (let k = 0; k < noteWeightsMax[elem]; k++) {
            for (let r = 0; r < extraBeats; r++) {
                const box = document.createElement('div');
                box.className = 'box';
                box.style.width = `${boxWidth}%`;
                box.style.height = `${(100)}%`;

                const currentBeatCounter = (k * extraBeats) + r;
                box.id = `box${i}-${barlineCounter}-${currentBeatCounter}-${elem}`;
                box.dataset.x = i;
                box.dataset.y = barlineCounter;
                box.dataset.z = currentBeatCounter;
                box.dataset.w = elem;

                if (currentBeatCounter % 2 === 1) {
                    box.style.backgroundColor = "White";
                }

                if (barlineCounter < barlineToShow) {
                    row.appendChild(box);
                }

                if (rightBorderBool && k === noteWeightsMax[elem] - 1 && r === extraBeats - 1) {
                    box.style.borderRight = `${1}px solid black`;
                    rightBorderBool = false;
                }

                if (leftBorderBool && k === 0 && r === 0) {
                    box.style.borderLeft = `${1}px solid black`;
                    leftBorderBool = false;
                }
            }
        }
    }
    return barlineCounter;
}