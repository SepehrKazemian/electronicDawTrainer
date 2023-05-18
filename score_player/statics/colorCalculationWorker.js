self.onmessage = async (event) => {
    const { sharedVars, colorMatrix, windowSize, start, end } = event.data;
    const results = [];

    for (let windowPosNow = start; windowPosNow < end; windowPosNow++) {
        const updatedColors = calculateUpdatedColors(colorMatrix, windowPosNow, windowSize);
        results.push(updatedColors);
    }

    self.postMessage({ sharedVars, colorMatrix, windowSize, results });
};

function calculateUpdatedColors(colorMatrix, windowPosNow, windowSize) {
    const updatedColors = [];

    for (let instrument = 0; instrument < colorMatrix.length; instrument++) {
        const instrumentColors = colorMatrix[instrument];
        const windowStart = Math.max(windowPosNow, 0);
        const windowEnd = Math.min(windowPosNow + windowSize, instrumentColors.length);

        for (let beatPosition = 0; beatPosition < instrumentColors.length; beatPosition++) {
            if (beatPosition + windowStart < windowEnd) {
                const color = instrumentColors[beatPosition + windowStart];
                updatedColors.push([instrument, beatPosition, color]);
            } else {
                updatedColors.push([instrument, beatPosition, "rgb(255,255,255)"]);
            }
        }
    }

    return updatedColors;
}