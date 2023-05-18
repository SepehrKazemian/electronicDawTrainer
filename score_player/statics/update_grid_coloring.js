


// function importWorkerScripts(colorCalculationWorkerPath, delayWorkerPath, sharedVars, colorMatrix, windowSize) {
//     const colorCalculationWorker = new Worker(colorCalculationWorkerPath);
//     const delayWorker = new Worker(delayWorkerPath);

//     // Rest of the code that uses the worker scripts
// }

export function movingColors(colorCalculationWorker, delayWorker, sharedVars, colorMatrix, windowSize) {
    // const colorCalculationWorker = new Worker(colorCalculationWorkerPath);
    // const delayWorker = new Worker(delayWorkerPath);
    applyColorMatrixWithWindow(sharedVars, colorMatrix, windowSize);

    colorCalculationWorker.onmessage = (event) => {
        console.log("hereee??????222");
        const { sharedVars, colorMatrix, windowSize, results } = event.data;
        // Send precalculated colors to the delayWorker
        delayWorker.postMessage({ sharedVars, colorMatrix, windowSize, updatedColorsList: results });
    };

    let lastUpdateTime = null;
    delayWorker.onmessage = (event) => {
        const currentTime = performance.now();
        if (lastUpdateTime !== null) {
            const timeBetweenUpdates = currentTime - lastUpdateTime;
            console.log("Time interval between updates: ", timeBetweenUpdates);
        }
        lastUpdateTime = currentTime;

        const { updatedColors } = event.data;
        updateColors(updatedColors);
    };

    function updateColors(updatedColors) {
        for (const [instrument, beatPosition, color] of updatedColors) {
            let beatsToColorElement = document.querySelector(
                `[data-beat-position="box${instrument}-${beatPosition}"]`
            );
            beatsToColorElement.style.backgroundColor = color;
        }


    }

    async function applyColorMatrixWithWindow(sharedVars, colorMatrix, windowSize) {
        console.log("hereee??????", sharedVars);
        colorCalculationWorker.postMessage({ sharedVars, colorMatrix, windowSize, start: 0, end: colorMatrix[0].length });
    }
}

