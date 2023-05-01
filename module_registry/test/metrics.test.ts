import { describe, expect, jest, test, afterEach } from '@jest/globals';
import { calculateBusFactor } from '../src/metrics/busFactor';
import { calculateCorrectness } from '../src/metrics/correctness';
import { calculateLicenseCompatibility } from '../src/metrics/licenseCompatibility';
import { calculateRampUp } from '../src/metrics/rampUp';
import { calculateResponsiveness } from '../src/metrics/responsiveness';
import { calculateNetScore } from '../src/metrics/netScore';
import { testCommunityProfile, testCommits, testContributors, testIssues, testLicense, testReadme } from './sampleResponses';
import { logToFile } from '../src/logging/logging';

jest.mock('../src/logging/logging', () => {
    return {
        logToFile: jest.fn(),
    };
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('bus factor metric', () => {
    test('calculates a score between 1 and 0 for bus factor', async () => {
        let result = calculateBusFactor(testContributors, testCommits);
        expect(result).toBeLessThanOrEqual(1);
        expect(result).toBeGreaterThan(0);
        expect(logToFile).toHaveBeenCalledTimes(3);
    });
});

describe('correctness metric', () => {
    test('returns a 1 for a present test directory', async () => {
        expect(calculateCorrectness('./')).toBe(1);
        expect(logToFile).toHaveBeenCalledWith(true, 1, "Correctness");
    });
});

describe('license compatability metric', () => {
    test('calculates a score of 0 for no license', async () => {
        expect(calculateLicenseCompatibility(testLicense, testReadme)).toBe(0);
        expect(logToFile).toHaveBeenCalledTimes(2);
    });



    test('calculates a score of 1 for compatible license', async () => {
        testLicense.repository.licenseInfo.spdxId = "LGPL-2.1";
        expect(calculateLicenseCompatibility(testLicense, testReadme)).toBe(1);
        expect(logToFile).toHaveBeenCalledTimes(2);
    });

    test('calculates a score of 1 for compatible license in readme', async () => {
        testLicense.repository.licenseInfo.spdxId = "test";
        testReadme.data.content = "TEdQTC0yLjE=";
        expect(calculateLicenseCompatibility(testLicense, testReadme)).toBe(1);
        expect(logToFile).toHaveBeenCalledTimes(3);
    });
});

describe('ramp up metric', () => {
    test('calculates a score of 1 for documentation site', async () => {
        expect(calculateRampUp(testCommunityProfile, testReadme)).toBe(1);
        expect(logToFile).toHaveBeenCalledTimes(3);
    });

    test('calculates a score of 0 for minimal documentation', async () => {
        testCommunityProfile.data.documentation = null;
        expect(calculateRampUp(testCommunityProfile, testReadme)).toBe(0);
        expect(logToFile).toHaveBeenCalledTimes(3);
    });

    test('calculates a score of 0.25 for small readme', async () => {
        testReadme.data.size = 1000;
        expect(calculateRampUp(testCommunityProfile, testReadme)).toBeCloseTo(0.25);
        expect(logToFile).toHaveBeenCalledTimes(3);
    });

    test('calculates a score of 0.5 for medium readme', async () => {
        testReadme.data.size = 3000;
        expect(calculateRampUp(testCommunityProfile, testReadme)).toBeCloseTo(0.5);
        expect(logToFile).toHaveBeenCalledTimes(3);
    });

    test('calculates a score of 0.75 for medium readme', async () => {
        testReadme.data.size = 6000;
        expect(calculateRampUp(testCommunityProfile, testReadme)).toBeCloseTo(0.75);
        expect(logToFile).toHaveBeenCalledTimes(3);
    });
});

describe('responsiveness metric', () => {
    test('calculates a score between 1 and 0 for responsiveness', async () => {
        let result = calculateResponsiveness(testIssues);
        expect(result).toBeLessThanOrEqual(1);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(logToFile).toHaveBeenCalledTimes(3);
    });
});

describe('net score', () => {
    test('calculates net score between 1 and 0', async () => {
        let result = calculateNetScore(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5);
        expect(result).toBeLessThanOrEqual(1);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(logToFile).toHaveBeenCalledTimes(2);
    });
});
