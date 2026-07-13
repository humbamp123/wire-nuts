import { wireNuts } from './data.js';
import {
    addWireEntry,
    showError,
    hideError,
    hideResults,
    displayResults,
    collectWireInputs
} from './ui.js';

/**
 * Calculates compatible wire nuts for the given wire combination
 */
function calculateWireNut() {
    // Clear previous results and errors
    hideError();

    // Collect wire inputs
    const { wireCombination, totalWires, hasError, errorMessage } = collectWireInputs();

    if (hasError) {
        showError(errorMessage);
        hideResults();
        return;
    }

    if (totalWires < 2) {
        showError('You need at least 2 wires to make a connection.');
        hideResults();
        return;
    }

    // Find compatible wire nuts
    const compatibleNuts = findCompatibleNuts(wireCombination);

    // Display results
    displayResults(compatibleNuts, wireCombination, totalWires);
}

// A combination is an "Ideal Match" when it uses at least this fraction of the connector's capacity
const IDEAL_FILL = 0.75;

/**
 * Finds wire nuts compatible with the given wire combination
 * @param {Object} wireCombination - Object mapping gauge to count
 * @returns {Array} Array of compatible wire nuts with isIdeal flag
 */
function findCompatibleNuts(wireCombination) {
    const compatibleNuts = [];
    const entries = Object.entries(wireCombination);

    wireNuts.forEach(nut => {
        // Capacity: every gauge must be within the nut's per-gauge max
        if (!entries.every(([gauge, count]) => count <= (nut.maxWires[gauge] || 0))) {
            return;
        }

        // Fraction of the nut's capacity this combination uses,
        // summed across gauges (e.g. 2 of 5 slots + 3 of 4 slots = 1.15)
        const fill = entries.reduce((sum, [gauge, count]) => sum + count / nut.maxWires[gauge], 0);

        // minWires[gauge] describes the smallest allowed single-gauge fill (n × gauge alone).
        // Mixed combinations pass when their total fill reaches the smallest declared minimum fill.
        const minRatios = entries
            .filter(([gauge]) => (nut.minWires[gauge] || 0) > 0)
            .map(([gauge]) => nut.minWires[gauge] / nut.maxWires[gauge]);
        if (minRatios.length > 0) {
            if (entries.length === 1) {
                const [gauge, count] = entries[0];
                if (count < nut.minWires[gauge]) return;
            } else if (fill < Math.min(...minRatios)) {
                return;
            }
        }

        compatibleNuts.push({
            ...nut,
            isIdeal: fill >= IDEAL_FILL
        });
    });

    return compatibleNuts;
}

/**
 * Initialize event listeners when DOM is ready
 */
function init() {
    const addWireBtn = document.querySelector('.add-wire-btn');
    const calculateBtn = document.querySelector('.calculate-btn');

    if (addWireBtn) {
        addWireBtn.addEventListener('click', addWireEntry);
    }

    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateWireNut);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
