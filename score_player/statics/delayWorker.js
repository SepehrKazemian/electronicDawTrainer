let sharedVars, colorMatrix, windowSize, updatedColorsList;
let savedInd = 0;
self.onmessage = async (event) => {

    if (event.data.updatedColorsList)
        ({ sharedVars, colorMatrix, windowSize, updatedColorsList } = event.data);
    else if (event.data.sharedVars && event.data.update) {
        sharedVars = event.data.sharedVars;
        console.log("xxxx", sharedVars);
    }
    for (let i = savedInd; i < updatedColorsList.length; i++) {
        const updatedColors = updatedColorsList[i];
        console.log("hereeeeeee11111", sharedVars.secondToMove, i);
        let startTime = performance.now();
        let testTime = performance.now();

        self.postMessage(updatedColors);
        let endTime = performance.now();
        let elapsedTime = endTime - startTime;
        let delayTime = sharedVars.secondToMove * 1000 - elapsedTime;

        await preciseDelay(delayTime);
        // console.log("sharsedVars ", delayTime + elapsedTime, performance.now() - testTime)
        let endTest = performance.now();
        savedInd = i;

    }
    savedInd = 0;
};



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