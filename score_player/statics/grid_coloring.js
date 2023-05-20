// function applyColorMatrix(colorMatrix) {
//     for (let instrument = 0; instrument < colorMatrix.length; instrument++) {
//         const instrumentColors = colorMatrix[instrument];
//         for (let beatPosition = 0; beatPosition < instrumentColors.length; beatPosition++) {
//             const color = instrumentColors[beatPosition];
//             const beatsToColorElement = document.querySelector(`[data-beat-position="box${instrument}-${beatPosition}"]`);
//             beatsToColorElement.style.backgroundColor = color;
//         }
//     }
// };


export function coloringInit(colorMatrix, maxBeatPositionCounter) {
    for (let instrument = 0; instrument < colorMatrix.length; instrument++) {
        // console.log("instrument: ", instrument);
        const instrumentColors = colorMatrix[instrument];
        for (let beatPosition = 0; beatPosition < instrumentColors.length; beatPosition++) {
            if (beatPosition < maxBeatPositionCounter) {
                let beatsToColorElement = document.querySelector(`[data-beat-position="box${instrument}-${beatPosition}"]`);
                beatsToColorElement.style.backgroundColor = instrumentColors[beatPosition];
                continue;
            }
        }
    }
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}