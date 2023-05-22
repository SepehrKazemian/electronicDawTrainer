let sharedVars, colorMatrix, windowSize, updatedColorsList = [];
let savedInd = 0;
let isUpdatingSharedVars = false;
let tempo = 120;

self.onmessage = async (event) => {

    if (event.data.updatedColorsList) {
        ({ sharedVars, colorMatrix, windowSize, updatedSoundList, updatedColorsList } = event.data);
        processColors(savedInd);

    } else if (event.data.sharedVars && event.data.update) {
        sharedVars = event.data.sharedVars;
        console.log("xxxx", sharedVars);
        isUpdatingSharedVars = true;
        processColors(savedInd);
    }

    async function processColors(i) {
        if (i < updatedColorsList.length && !isUpdatingSharedVars) {
            const updatedColors = updatedColorsList[i];
            const updatedSounds = updatedSoundList[i];
            let startTime = performance.now();
            let testTime = performance.now();
            function waitUntilRunning() {
                return new Promise((resolve) => {
                    if (sharedVars.isRunning)
                        resolve();
                    else
                        setTimeout(() => resolve(waitUntilRunning()), 100);
                })
            }

            await waitUntilRunning();

            self.postMessage([updatedSounds, updatedColors]);
            let endTime = performance.now();
            let elapsedTime = endTime - startTime;
            let delayTime = sharedVars.secondToMove * 1000 - elapsedTime;

            await preciseDelay(delayTime);
            let endTest = performance.now();
            savedInd = i;

            processColors(i + 1);
        }
        if (isUpdatingSharedVars) {
            isUpdatingSharedVars = false;
        }
        if (i == updatedColorsList.length) {
            savedInd = 0;
            console.log(savedInd);
            self.postMessage({ done: true });
        }
    }
}

function preciseDelay(ms) {
    const start = performance.now();
    let remainingTime = ms;

    const waitTimeout = 10; // Time threshold for entering the busy-wait loop

    return new Promise((resolve) => {
        const checkTime = () => {
            const elapsed = performance.now() - start;
            remainingTime = ms - elapsed;

            if (remainingTime <= waitTimeout) {
                // Enter the busy-wait loop
                while (remainingTime > 0) {
                    // Do any necessary work here
                    remainingTime = ms - (performance.now() - start);
                }

                resolve();
            } else {
                // Use requestAnimationFrame for more efficient waiting
                requestAnimationFrame(checkTime);
            }
        };

        setTimeout(checkTime, waitTimeout);
    });
}