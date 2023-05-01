import { logToFile } from "../logging/logging";

export function calculateNetScore(
    rampUp: number,
    correctness: number,
    busFactor: number,
    responsiveness: number,
    license: number,
    review: number,
    pinned: number
): number {
    // calculate net score
    // this is done by a weighted the average of the ramp up score, correctness score, bus factor score, and responsiveness score
    // the weights are 0.1, 0.1, 0.5, and 0.3 respectively
    // the final score is then multiplied by license score to invalidate packages with incompatible licenses
    const netScore = (0.1 * review + 0.1 * pinned + 0.1 * rampUp + 0.1 * correctness + 0.3 * busFactor + 0.3 * responsiveness) * license;

    logToFile(netScore, 2, "net score breakdown", `0.1 * ${rampUp} + 0.1 * ${correctness} + 0.5 * ${busFactor} + 0.3 * ${responsiveness} * ${license}`);
    logToFile(netScore, 1, "Net Score")

    return netScore;
}