


// function importWorkerScripts(colorCalculationWorkerPath, delayWorkerPath, sharedVars, colorMatrix, windowSize) {
//     const colorCalculationWorker = new Worker(colorCalculationWorkerPath);
//     const delayWorker = new Worker(delayWorkerPath);

//     // Rest of the code that uses the worker scripts
// }

export function movingColors(colorCalculationWorker, delayWorker, sharedVars, colorMatrix, windowSize, maxBeatPositionCounter) {
    // const colorCalculationWorker = new Worker(colorCalculationWorkerPath);
    // const delayWorker = new Worker(delayWorkerPath);
    applyColorMatrixWithWindow(sharedVars, colorMatrix, windowSize, maxBeatPositionCounter, true);

    // colorCalculationWorker.onmessage = (event) => {
    //     console.log("hereee??????222");
    //     const { sharedVars, colorMatrix, windowSize, results } = event.data;
    //     // Send precalculated colors to the delayWorker
    //     delayWorker.postMessage({ sharedVars, colorMatrix, windowSize, updatedColorsList: results });
    //     console.log("after??????222");
    // };

    // let lastUpdateTime = null;
    // delayWorker.onmessage = (event) => {
    //     console.log("hereee??????333");
    //     const currentTime = performance.now();
    //     if (lastUpdateTime !== null) {
    //         const timeBetweenUpdates = currentTime - lastUpdateTime;
    //         console.log("Time interval between updates: ", timeBetweenUpdates);
    //     }
    //     lastUpdateTime = currentTime;

    //     const { updatedColors } = event.data;
    //     updateColors(updatedColors);
    //     console.log("hereee??????444");
    // };

    // function updateColors(updatedColors) {
    //     for (const [instrument, beatPosition, color] of updatedColors) {
    //         let beatsToColorElement = document.querySelector(
    //             `[data-beat-position="box${instrument}-${beatPosition}"]`
    //         );
    //         // console.log(instrument, beatPosition);
    //         beatsToColorElement.style.backgroundColor = color;
    //     }


    // }

    function postMessageToColorCalculationWorker(message) {
        return new Promise((resolve, reject) => {
            console.log("33333");
            colorCalculationWorker.onmessage = resolve;
            colorCalculationWorker.onerror = reject;
            colorCalculationWorker.postMessage(message);
            console.log("4444");
        });
    }
    // Function to send a message to delayWorker
    // let lastUpdateTime = null;
    function postMessageToDelayWorker(message) {
        console.log("yellow", message);
        return new Promise((resolve, reject) => {
            delayWorker.onmessage = (event) => {
                // const currentTime = performance.now();
                // console.log("yellowxxxx", message);
                const updatedColors = event.data;
                updateColors(updatedColors);
                colorCalculationWorker.postMessage({ signal: true });
                // const timeBetweenUpdates = currentTime - lastUpdateTime;
                // console.log("Time interval between updates: ", timeBetweenUpdates);
                // lastUpdateTime = currentTime;
                resolve(); // Resolve the promise with the event data
            };
            delayWorker.onerror = reject;
            delayWorker.postMessage(message);
        });
    }

    // Main function to apply color matrix with window and update colors
    async function applyColorMatrixWithWindow(sharedVars, colorMatrix, windowSize, maxBeatPositionCounter, repeat) {
        console.log("first ");
        const colorCalculationPromise = postMessageToColorCalculationWorker({
            sharedVars,
            colorMatrix,
            windowSize,
            start: 0,
            end: colorMatrix[0].length,
            maxBeatPositionCounter,
            repeat,
        });

        console.log("second ");
        // const delayWorkerPromise = new Promise((resolve, reject) => {
        //     delayWorker.onmessage = (event) => {
        //         console.log("1");
        //         resolve(event.data);
        //         console.log("2");
        //     };
        //     delayWorker.onerror = reject;
        // });
        // const delayWorkerResultCheck = await delayWorkerPromise.catch((error) => {
        //     console.error("Error in delayWorkerPromise:", error);
        // });
        // console.log(delayWorkerResultCheck);

        // console.log("third calling all");
        console.log("second");
        const delayWorkerPromise = colorCalculationPromise.then((colorCalculationResult) => {
            console.log("third calling all");
            const updatedColorsList = colorCalculationResult.data;
            console.log("after??????222", updatedColorsList);

            return postMessageToDelayWorker({
                sharedVars,
                colorMatrix,
                windowSize,
                updatedColorsList,
            });
        });
        // console.log("forth all called");
        // const delayWorkerResult = await delayWorkerPromise;

        // console.log("hereee??????222");
        // const { updatedColorsList } = colorCalculationResult.data;
        // console.log("after??????222");

        // const delayWorkerPromise2 = postMessageToDelayWorker({
        //     sharedVars,
        //     colorMatrix,
        //     windowSize,
        //     updatedColorsList,
        // });

        // await delayWorkerPromise2;
        console.log("Finished processing colors.");
    }


    // Handle message from delayWorker
    // let lastUpdateTime = null;
    delayWorker.onmessage = (event) => {
        console.log("here111");
        const currentTime = performance.now();
        if (lastUpdateTime !== null) {
            const timeBetweenUpdates = currentTime - lastUpdateTime;
            console.log("Time interval between updates: ", timeBetweenUpdates);
        }
        lastUpdateTime = currentTime;

        const { updatedColors } = event.data;
        updateColors(updatedColors);
    };

    // Function to update colors on the UI
    function updateColors(updatedColors) {
        // console.log(updatedColors);
        for (const [instrument, beatPosition, color] of updatedColors) {
            let beatsToColorElement = document.querySelector(
                `[data-beat-position="box${instrument}-${beatPosition}"]`
            );
            // console.log(instrument, beatPosition);
            beatsToColorElement.style.backgroundColor = color;
        }
    }
}
