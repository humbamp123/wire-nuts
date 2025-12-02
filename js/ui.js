// UI State
let wireEntryCount = 1;

// DOM element references
const wireInputsContainer = document.getElementById('wireInputs');
const errorMessageEl = document.getElementById('errorMessage');
const resultsDiv = document.getElementById('results');

/**
 * Creates the HTML for a wire gauge select dropdown
 */
function createWireGaugeSelect() {
    return `
        <select class="wire-gauge">
            <option value="">Select AWG...</option>
            <option value="18">18 AWG</option>
            <option value="16">16 AWG</option>
            <option value="14">14 AWG</option>
            <option value="12">12 AWG</option>
            <option value="10">10 AWG</option>
            <option value="8">8 AWG</option>
            <option value="6">6 AWG</option>
        </select>
    `;
}

/**
 * Adds a new wire entry row to the input section
 */
export function addWireEntry() {
    const newEntry = document.createElement('div');
    newEntry.className = 'wire-entry';
    newEntry.setAttribute('data-index', wireEntryCount);
    newEntry.style.animation = 'fadeIn 0.3s ease';
    newEntry.innerHTML = `
        <div class="input-group">
            <label>Wire Gauge</label>
            ${createWireGaugeSelect()}
        </div>
        <div class="input-group">
            <label>Quantity</label>
            <input type="number" class="wire-count" min="1" max="20" value="2" placeholder="Count">
        </div>
        <button class="remove-btn" data-index="${wireEntryCount}">Remove</button>
    `;

    // Add event listener for remove button
    const removeBtn = newEntry.querySelector('.remove-btn');
    removeBtn.addEventListener('click', () => {
        removeWireEntry(parseInt(removeBtn.dataset.index));
    });

    wireInputsContainer.appendChild(newEntry);
    wireEntryCount++;
}

/**
 * Removes a wire entry row by its index
 * @param {number} index - The index of the wire entry to remove
 */
export function removeWireEntry(index) {
    const entry = document.querySelector(`[data-index="${index}"]`);
    if (entry) {
        entry.style.animation = 'fadeIn 0.2s ease reverse';
        setTimeout(() => entry.remove(), 150);
    }
}

/**
 * Shows an error message
 * @param {string} message - The error message to display
 */
export function showError(message) {
    errorMessageEl.textContent = message;
    errorMessageEl.classList.add('show');
}

/**
 * Hides the error message
 */
export function hideError() {
    errorMessageEl.classList.remove('show');
    errorMessageEl.textContent = '';
}

/**
 * Hides the results section
 */
export function hideResults() {
    resultsDiv.classList.remove('show');
}

/**
 * Displays the calculation results
 * @param {Array} compatibleNuts - Array of compatible wire nuts
 * @param {Object} wireCombination - Object mapping gauge to count
 * @param {number} totalWires - Total number of wires
 */
export function displayResults(compatibleNuts, wireCombination, totalWires) {
    if (compatibleNuts.length === 0) {
        resultsDiv.innerHTML = `
            <div class="no-results">
                <h3>No Compatible Wire Nuts Found</h3>
                <p>The combination of wires you entered exceeds the capacity of standard wire nuts.</p>
                <p>Consider using a junction box with terminal blocks or splitting the connection.</p>
            </div>
        `;
    } else {
        // Create summary of wire combination
        const wireListHTML = Object.entries(wireCombination)
            .map(([gauge, count]) => `<li>${count} × ${gauge} AWG</li>`)
            .join('');

        // Sort: ideal first, then by color (smaller to larger)
        const colorOrder = { 'Orange': 1, 'Yellow': 2, 'Red': 3, 'Blue': 4, 'Tan': 4, 'Gray': 5, 'Green': 6, 'Purple': 7 };
        compatibleNuts.sort((a, b) => {
            if (a.isIdeal && !b.isIdeal) return -1;
            if (!a.isIdeal && b.isIdeal) return 1;
            return (colorOrder[a.color] || 99) - (colorOrder[b.color] || 99);
        });

        let resultsHTML = `
            <div class="section-label">Input Analysis</div>
            <div class="input-summary">
                <h3>Wire Configuration</h3>
                <ul class="wire-list">
                    ${wireListHTML}
                    <li class="total"><strong>Total: ${totalWires} wires</strong></li>
                </ul>
            </div>
            <div class="results-header">
                <h2>Compatible Connectors</h2>
                <span class="results-count">${compatibleNuts.length} found</span>
            </div>
        `;

        compatibleNuts.forEach((nut, index) => {
            const maxCapacityStr = Object.entries(nut.maxWires)
                .filter(([, count]) => count > 0)
                .map(([gauge, count]) => `${count}×${gauge}`)
                .join(' | ');

            resultsHTML += `
                <div class="result-card ${nut.isIdeal ? 'ideal' : 'works'}" style="animation-delay: ${index * 0.05}s">
                    <div class="color-badge ${nut.color.toLowerCase()}">${nut.color.substring(0, 3)}</div>
                    <div class="result-info">
                        <div class="result-brand">${nut.brand}</div>
                        <div class="result-model">Model: ${nut.model}</div>
                        <div class="result-capacity">Max: ${maxCapacityStr}</div>
                    </div>
                    <div class="result-status">
                        <span class="status-badge ${nut.isIdeal ? 'ideal' : 'works'}">${nut.isIdeal ? 'Ideal Match' : 'Compatible'}</span>
                    </div>
                </div>
            `;
        });

        resultsDiv.innerHTML = resultsHTML;
    }

    resultsDiv.classList.add('show');
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Collects wire inputs from the form
 * @returns {Object} Object with wireCombination, totalWires, and hasError
 */
export function collectWireInputs() {
    const wireEntries = document.querySelectorAll('.wire-entry');
    const wireCombination = {};
    let totalWires = 0;
    let hasError = false;
    let errorMessage = '';

    wireEntries.forEach(entry => {
        if (hasError) return;

        const gauge = entry.querySelector('.wire-gauge').value;
        const count = parseInt(entry.querySelector('.wire-count').value) || 0;

        if (!gauge) {
            errorMessage = 'Please select a wire gauge for all entries.';
            hasError = true;
            return;
        }

        if (count <= 0) {
            errorMessage = 'Please enter a valid quantity (at least 1) for all wire entries.';
            hasError = true;
            return;
        }

        wireCombination[gauge] = (wireCombination[gauge] || 0) + count;
        totalWires += count;
    });

    return { wireCombination, totalWires, hasError, errorMessage };
}
