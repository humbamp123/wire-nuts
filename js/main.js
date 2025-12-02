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

/**
 * Finds wire nuts compatible with the given wire combination
 * @param {Object} wireCombination - Object mapping gauge to count
 * @returns {Array} Array of compatible wire nuts with isIdeal flag
 */
function findCompatibleNuts(wireCombination) {
    const compatibleNuts = [];

    wireNuts.forEach(nut => {
        let isCompatible = true;
        let isIdeal = true;

        // Check if this wire nut can handle all the wires
        for (const [gauge, count] of Object.entries(wireCombination)) {
            const maxAllowed = nut.maxWires[gauge] || 0;
            const minRequired = nut.minWires[gauge] || 0;

            if (count > maxAllowed || count < minRequired) {
                isCompatible = false;
                break;
            }

            // Check if it's ideal (close to max capacity)
            if (count < maxAllowed - 2) {
                isIdeal = false;
            }
        }

        if (isCompatible) {
            compatibleNuts.push({
                ...nut,
                isIdeal: isIdeal
            });
        }
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
