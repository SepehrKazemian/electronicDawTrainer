self.onmessage = async (event) => {
    const { sharedVars, colorMatrix, windowSize, start, end, maxBeatPositionCounter, repeat } = event.data;
    console.log("6666666", event.data);
    const results = [];

    if (repeat) {
        for (let windowPosNow = start; windowPosNow < 2 * end; windowPosNow++) {
            // console.log(sharedVars.secondToMove);
            const updatedColors = calculateUpdatedColors(colorMatrix, windowPosNow, windowSize, maxBeatPositionCounter, repeat);
            // console.log("xxxx", updatedColors[0][2]);
            // self.postMessage(updatedColors);
            results.push(updatedColors);
        }
    }
    else {
        for (let windowPosNow = start; windowPosNow < end; windowPosNow++) {
            const updatedColors = calculateUpdatedColors(colorMatrix, windowPosNow, windowSize, maxBeatPositionCounter, repeat);
            // self.postMessage({ updatedColors });
            results.push(updatedColors);
        }
    }

    // console.log(sharedVars, colorMatrix, windowSize, results);
    self.postMessage(results);
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