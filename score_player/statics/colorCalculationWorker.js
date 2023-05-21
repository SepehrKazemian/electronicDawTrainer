let canProceed = false;

self.onmessage = async (event) => {
    if (event.data.signal) {
        canProceed = true;
        return;
    }

    let { sharedVars, colorMatrix, windowSize, start, end, maxBeatPositionCounter, repeat } = event.data;


    let results = [];
    let counter = 0;
    if (repeat) {
        for (let windowPosNow = start; windowPosNow < 2 * end; windowPosNow++) {
            console.log("6666666", event.data);
            counter++;
            // console.log(sharedVars.secondToMove);
            const updatedColors = calculateUpdatedColors(colorMatrix, windowPosNow, windowSize, maxBeatPositionCounter, repeat);
            [canProceed, results, counter] = send_data_partitions(updatedColors, results, counter);
            console.log(counter, results.length, canProceed);
            // results.push(updatedColors);
            // // self.postMessage(updatedColors);
            // if (counter == 5) {
            //     self.postMessage(results);
            //     results = [];
            //     counter = 0;
            // }

            // console.log("xxxx", updatedColors[0][2]);
        }
    }
    else {
        for (let windowPosNow = start; windowPosNow < end; windowPosNow++) {
            counter++;
            // console.log(sharedVars.secondToMove);
            const updatedColors = calculateUpdatedColors(colorMatrix, windowPosNow, windowSize, maxBeatPositionCounter, repeat);
            [results, counter] = send_data_partitions(updatedColors, results, counter);
        }
    }

    // console.log(sharedVars, colorMatrix, windowSize, results);
    self.postMessage(results);

    function send_data_partitions(updatedColors, results, counter) {
        results.push(updatedColors);
        // self.postMessage(updatedColors);
        if (counter == 5) {
            if (!canProceed) {
                new Promise(resolve => {
                    const interval = setInterval(() => {
                        if (canProceed) {
                            clearInterval(interval);
                            resolve();
                            self.postMessage(results);
                            results = [];
                            counter = 0;
                            console.log("sent");
                            canProceed = false;  // After posting data, wait for signal to proceed
                        }
                    }, 100);  // Check every 100 ms
                });
            }
        }

        return [canProceed, results, counter]

    }
};


function calculateUpdatedColors(colorMatrix, windowPosNow, windowSize, maxBeatPositionCounter, repeat) {
    const updatedColors = [];

    // console.log(windowPosNow, windowSize, maxBeatPositionCounter, repeat);
    for (let instrument = 0; instrument < colorMatrix.length; instrument++) {
        const instrumentColors = colorMatrix[instrument];
        const windowStart = Math.max(windowPosNow, 0);
        let windowEnd = instrumentColors.length;
        let windowExtra = -1;

        if (repeat && windowPosNow + windowSize > windowEnd) {
            // Wrap around to the beginning of the array
            windowExtra = windowPosNow + windowSize % windowEnd;
        }

        // console.log("windowExtra", windowExtra);
        for (let beatPosition = 0; beatPosition < maxBeatPositionCounter; beatPosition++) {
            if (beatPosition + windowStart < windowEnd) {
                // console.log("hereee????");
                const color = instrumentColors[beatPosition + windowStart];
                updatedColors.push([instrument, beatPosition, color]);
            }
            else if (windowExtra > -1) {
                // console.log("are you coming here at all?");
                const color = instrumentColors[(beatPosition + windowStart) % windowEnd];
                updatedColors.push([instrument, beatPosition, color]);
            }
            else {
                updatedColors.push([instrument, beatPosition, "rgb(255,255,255)"]);
            }
        }
    }

    return updatedColors;
}