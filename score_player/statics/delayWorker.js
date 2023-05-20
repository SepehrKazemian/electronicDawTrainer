self.onmessage = async (event) => {
    const { sharedVars, colorMatrix, windowSize, updatedColorsList } = event.data;

    for (const updatedColors of updatedColorsList) {
        console.log("hereeeeeee11111");
        let startTime = performance.now();
        let testTime = performance.now();

        self.postMessage(updatedColors);
        let endTime = performance.now();
        let elapsedTime = endTime - startTime;
        let delayTime = sharedVars.secondToMove * 1000 - elapsedTime;

        await preciseDelay(delayTime);
        // console.log("sharsedVars ", delayTime + elapsedTime, performance.now() - testTime)
        let endTest = performance.now();

    }
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