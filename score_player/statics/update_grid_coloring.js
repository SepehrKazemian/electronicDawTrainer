


// function importWorkerScripts(colorCalculationWorkerPath, delayWorkerPath, sharedVars, colorMatrix, windowSize) {
//     const colorCalculationWorker = new Worker(colorCalculationWorkerPath);
//     const delayWorker = new Worker(delayWorkerPath);

//     // Rest of the code that uses the worker scripts
// }

export function movingColors(colorCalculationWorker, delayWorker, sharedVars, soundMatrix, colorMatrix, windowSize, maxBeatPositionCounter) {
    // const colorCalculationWorker = new Worker(colorCalculationWorkerPath);
    // const delayWorker = new Worker(delayWorkerPath);
    applyColorMatrixWithWindow(sharedVars, soundMatrix, colorMatrix, windowSize, maxBeatPositionCounter, true);

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
    let taskQueue = [];

    function postMessageToDelayWorker(message) {
        console.log("yellow", message);

        let task = new Promise((resolve, reject) => {
            let handler = (event) => {
                // console.log("yellowxxxx", message);
                if (event.data.done) { // check if worker has finished its task
                    resolve(); // if yes, resolve promise and remove handler
                    delayWorker.removeEventListener('message', handler);
                }
                else {
                    const [updatedSounds, updatedColors] = event.data;
                    updateColors(updatedColors);
                    updateSounds(updatedSounds)
                    // console.log("done!");
                }
            };

            delayWorker.addEventListener('message', handler);
            delayWorker.onerror = reject;
            delayWorker.postMessage(message);
            console.log("aaaa", reject, message);
        });

        taskQueue.push(task);
        return task;
    }

    async function executeTasks() {
        for (let task of taskQueue) {
            await task;
        }
    }

    // Main function to apply color matrix with window and update colors
    async function applyColorMatrixWithWindow(sharedVars, soundMatrix, colorMatrix, windowSize, maxBeatPositionCounter, repeat) {
        console.log("first ");
        const colorCalculationPromise = postMessageToColorCalculationWorker({
            sharedVars,
            colorMatrix,
            soundMatrix,
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
        const delayWorkerPromise = colorCalculationPromise.then(async (colorCalculationResult) => {
            console.log("third calling all");
            const [updatedSoundList, updatedColorsList] = colorCalculationResult.data;
            console.log("after??????222", updatedColorsList, updatedSoundList);
            if (repeat) {
                for (let counter = 0; counter < 2; counter++) {
                    console.log("counter", counter);
                    await postMessageToDelayWorker({
                        sharedVars,
                        colorMatrix,
                        windowSize,
                        updatedSoundList,
                        updatedColorsList,
                    });
                }
            }
            await executeTasks();
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
    // delayWorker.onmessage = (event) => {
    //     console.log("here111");
    //     const currentTime = performance.now();
    //     if (lastUpdateTime !== null) {
    //         const timeBetweenUpdates = currentTime - lastUpdateTime;
    //         console.log("Time interval between updates: ", timeBetweenUpdates);
    //     }
    //     lastUpdateTime = currentTime;

    //     const { updatedColors } = event.data;
    //     updateColors(updatedColors);
    // };

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

    let audioBufferCache = {};

    async function decodeAudioData(audioContext, audioUrl) {
        const response = await fetch(audioUrl);
        const audioData = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(audioData);
        return audioBuffer;
    }

    async function preloadAudioFiles(audioContext) {
        const audioFiles = [
            { key: "D3", inst: "percussion" },
            // Add more audio files to preload if needed
        ];

        const decodePromises = audioFiles.map(async (audioFile) => {
            if (!audioBufferCache[audioFile.key]) {
                const audioUrl = "/sample_url/" + audioFile.inst + "/" + audioFile.key + ".wav";
                const audioBuffer = await decodeAudioData(audioContext, audioUrl);
                audioBufferCache[audioFile.key] = audioBuffer;
            }
        });

        await Promise.all(decodePromises);
    }

    // Call the preload function at the start of your application or when the page loads
    // window.addEventListener("load", async () => {
    //     const audioContext = new AudioContext();
    //     await preloadAudioFiles(audioContext);
    // });
    const audioContext = new AudioContext();
    preloadAudioFiles(audioContext);
    function updateSounds(updatedSounds) {
        // console.log(updatedSounds);
        for (const [instrument, beatPosition, sound] of updatedSounds) {
            // console.log(sound);
            if ((sound > 0) && (beatPosition == 0)) {
                const selectedSf = "D3";
                if (audioBufferCache[selectedSf]) {
                    const audioSource = audioContext.createBufferSource();
                    audioSource.buffer = audioBufferCache[selectedSf];
                    audioSource.connect(audioContext.destination);
                    audioSource.start();
                }
            }
        }
    }
}
