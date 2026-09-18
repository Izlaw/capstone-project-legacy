import Swal from "sweetalert2";

// Note: Ensure calculation.js exports sizeMapping and selectedSizes
import { sizeMapping, selectedSizes } from "./calculation.js";

// Global variable tracking for color application (remains the same)
window.currentColorTarget = null;
window.currentColorValue = null;

export const currencySymbol = "₱"; // Peso symbol

// --- Helper Functions ---

export function showAlert(title, text, icon, customClass = "") {
    Swal.fire({
        title: title,
        text: text,
        icon: icon,
        background: "#171c2f",
        color: "#fff",
        confirmButtonColor: "#b2192b",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
            popup: customClass,
        },
    });
}

// New function to fetch timeframe data from API
async function fetchTimeframeData() {
    try {
        const response = await fetch("/api/timeframe");
        if (!response.ok) {
            throw new Error("Failed to fetch timeframe data");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching timeframe data:", error);
        showAlert(
            "Error",
            "Failed to load delivery timeframes. Please refresh the page.",
            "error"
        );
        return [];
    }
}

// Variable to store timeframe data
let timeframeData = [];
let selectedTimeframeId = null;
let standardTimeframeId = 2; // Assuming 2 weeks is the standard timeframe ID

// Function to create and populate the timeframe selection UI
async function setupTimeframeSelection() {
    // Fetch timeframe data
    timeframeData = await fetchTimeframeData();

    if (!timeframeData || timeframeData.length === 0) {
        console.error("No timeframe data available");
        return;
    }

    // Find the standard timeframe (2 weeks)
    const standardTimeframe = timeframeData.find((t) =>
        t.delivery_timeframe.includes("2 week")
    );
    if (standardTimeframe) {
        standardTimeframeId = standardTimeframe.timeframeID;
        // Set the default selected timeframe
        selectedTimeframeId = standardTimeframeId;
    }

    // Create the timeframe selection container
    const fabricSection = document.getElementById("fabric_type");
    if (!fabricSection) return;

    const fabricSectionClosest = fabricSection.closest("div.mb-6");
    if (!fabricSectionClosest) return;
    if (!fabricSection) return;

    const timeframeContainer = document.createElement("div");
    timeframeContainer.className = "mb-6";
    timeframeContainer.innerHTML = `
        <label class="block text-white font-medium mb-2">Delivery Timeframe</label>
        
        <div class="flex items-center mb-2">
            <input type="radio" id="standard_timeframe" name="timeframe_option" value="standard" checked 
                class="form-radio h-4 w-4 text-danger focus:ring-danger">
            <label for="standard_timeframe" class="ml-2 text-white">Standard (2 weeks)</label>
        </div>
        
        <div class="flex items-center mb-2">
            <input type="radio" id="custom_timeframe" name="timeframe_option" value="custom" 
                class="form-radio h-4 w-4 text-danger focus:ring-danger">
            <label for="custom_timeframe" class="ml-2 text-white">Custom Timeframe</label>
        </div>
        
        <div id="timeframe_slider_container" class="mt-4 hidden">
            <div class="flex justify-between items-center mb-2">
                <span class="text-white text-sm">Faster</span>
                <span id="selected_timeframe" class="text-white font-medium">2 weeks</span>
                <span class="text-white text-sm">Slower</span>
            </div>
            <input type="range" id="timeframe_slider" min="0" max="${
                timeframeData.length - 1
            }" value="1" 
                class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer">
            <div class="flex justify-between text-xs text-white mt-1">
                ${timeframeData
                    .map((t) => `<span>${t.delivery_timeframe}</span>`)
                    .join("")}
            </div>
            <div class="text-white text-sm mt-2">
                Timeframe Cost: <span id="timeframe_cost">${currencySymbol}0.00</span>
            </div>
        </div>
    `;

    // Insert the timeframe container after the fabric section
    fabricSection.parentNode.insertBefore(
        timeframeContainer,
        fabricSection.nextSibling
    );

    // Setup event listeners for the radio buttons
    const standardOption = document.getElementById("standard_timeframe");
    const customOption = document.getElementById("custom_timeframe");
    const sliderContainer = document.getElementById(
        "timeframe_slider_container"
    );
    const timeframeSlider = document.getElementById("timeframe_slider");
    const selectedTimeframeText = document.getElementById("selected_timeframe");
    const timeframeCostText = document.getElementById("timeframe_cost");

    if (standardOption && customOption && sliderContainer && timeframeSlider) {
        // Variable to store the previously selected valid timeframe index for the main slider
        let previousTimeframeIndex = timeframeData.findIndex(
            (t) => t.timeframeID === standardTimeframeId
        );
        if (previousTimeframeIndex === -1) previousTimeframeIndex = 1; // Default to index 1 (2 weeks) if standard not found

        // Standard timeframe selection
        standardOption.addEventListener("change", function () {
            if (this.checked) {
                sliderContainer.classList.add("hidden");
                selectedTimeframeId = standardTimeframeId;
                // When switching back to standard, update the previous index for the slider
                previousTimeframeIndex = timeframeData.findIndex(
                    (t) => t.timeframeID === standardTimeframeId
                );
                if (previousTimeframeIndex === -1) previousTimeframeIndex = 1;
                // Ensure the slider value is set to the standard index when switching back
                timeframeSlider.value = previousTimeframeIndex;
                // Update the displayed timeframe text and cost
                const standardTimeframe = timeframeData[previousTimeframeIndex];
                if (standardTimeframe) {
                    selectedTimeframeText.textContent =
                        standardTimeframe.delivery_timeframe;
                    timeframeCostText.textContent = `${parseFloat(
                        standardTimeframe.percentageCost || 0
                    ).toFixed(0)}%`;
                }
                updateGrandTotalDisplay();
                updateOrderDetailsPanel();
            }
        });

        // Custom timeframe selection
        customOption.addEventListener("change", function () {
            if (this.checked) {
                sliderContainer.classList.remove("hidden");
                // Trigger the slider change event to set the initial value
                const event = new Event("input");
                timeframeSlider.dispatchEvent(event);
            }
        });

        // Slider change event
        timeframeSlider.addEventListener("input", function () {
            const newIndex = parseInt(this.value);
            const potentialTimeframe = timeframeData[newIndex];
            const totalQuantity = selectedSizes.reduce(
                (sum, size) => sum + size.quantity,
                0
            );

            if (
                potentialTimeframe &&
                totalQuantity > potentialTimeframe.maximum_orders
            ) {
                showAlert(
                    "Quantity Exceeds Limit",
                    `The selected quantity (${totalQuantity}) exceeds the maximum allowed orders (${potentialTimeframe.maximum_orders}) for the ${potentialTimeframe.delivery_timeframe} timeframe. Please select a different timeframe or reduce the quantity.`,
                    "warning"
                );
                // Revert slider value
                this.value = previousTimeframeIndex;
                // Update UI based on the previous valid timeframe
                const validTimeframe = timeframeData[previousTimeframeIndex];
                selectedTimeframeId = validTimeframe.timeframeID;
                selectedTimeframeText.textContent =
                    validTimeframe.delivery_timeframe;
                timeframeCostText.textContent = `${parseFloat(
                    validTimeframe.percentageCost || 0
                ).toFixed(0)}%`;
                // No need to call updateGrandTotalDisplay or updateOrderDetailsPanel here as the selection didn't change effectively
            } else if (potentialTimeframe) {
                // Valid selection
                previousTimeframeIndex = newIndex; // Update previous valid index
                selectedTimeframeId = potentialTimeframe.timeframeID;
                selectedTimeframeText.textContent =
                    potentialTimeframe.delivery_timeframe;
                timeframeCostText.textContent = `${parseFloat(
                    potentialTimeframe.percentageCost || 0
                ).toFixed(0)}%`;
                updateGrandTotalDisplay();
                updateOrderDetailsPanel();
            }
        });
    }
}

// Get the selected timeframe details
function getSelectedTimeframeDetails() {
    if (!timeframeData || timeframeData.length === 0) return null;

    return (
        timeframeData.find((t) => t.timeframeID === selectedTimeframeId) || null
    );
}

// Function to get timeframe cost
// Function to get timeframe percentage cost (as a direct value)
function getTimeframePercentageCostValue() {
    const timeframeDetails = getSelectedTimeframeDetails();
    // Use percentageCost directly as per the backend formula
    return timeframeDetails
        ? parseFloat(timeframeDetails.percentageCost || 0)
        : 0;
}

async function populateFabricDropdown() {
    try {
        const response = await fetch("/api/fabric");
        if (!response.ok) {
            throw new Error("Failed to fetch fabric data");
        }

        const fabricData = await response.json();
        const fabricSelect = document.getElementById("fabric_type");
        const customFabricInput = document.getElementById("custom_fabric_type");

        if (fabricSelect) {
            // Clear existing options
            fabricSelect.innerHTML = "";

            // Add initial placeholder
            const placeholderOption = document.createElement("option");
            placeholderOption.value = "";
            placeholderOption.textContent = "Select fabric type";
            placeholderOption.disabled = true;
            placeholderOption.selected = true;
            fabricSelect.appendChild(placeholderOption);

            // Add fabric options from API
            fabricData.forEach((fabric) => {
                const option = document.createElement("option");
                // Store fabric ID in the value and name in dataset for easy access
                option.value = fabric.fabricID; // Use fabricID as the value
                option.dataset.fabricName = fabric.fabricName.toLowerCase(); // Keep name for logic
                option.dataset.fabricPrice = fabric.fabricPrice;
                option.textContent = `${fabric.fabricName} (${currencySymbol}${fabric.fabricPrice})`;
                fabricSelect.appendChild(option);
            });

            // Event listener for showing/hiding custom fabric input
            fabricSelect.addEventListener("change", function () {
                // Find the selected option element to access its dataset
                const selectedOption = this.options[this.selectedIndex];
                const selectedFabricName =
                    selectedOption.dataset.fabricName || "";

                if (
                    selectedFabricName === "custom" && // Check against dataset name
                    customFabricInput
                ) {
                    customFabricInput.classList.remove("hidden");
                } else if (customFabricInput) {
                    customFabricInput.classList.add("hidden");
                    customFabricInput.value = ""; // Clear custom input when hiding
                }

                // Update total amount when fabric selection changes
                updateGrandTotalDisplay();
            });
        }
    } catch (error) {
        console.error("Error loading fabric types:", error);
        showAlert(
            "Error",
            "Failed to load fabric types. Please refresh the page.",
            "error"
        );
    }
}

// Function to fetch fabric prices from API
async function fetchFabricPrices() {
    try {
        const response = await fetch("/api/fabric");
        if (!response.ok) {
            throw new Error("Failed to fetch fabric prices");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching fabric prices:", error);
        return null;
    }
}

// Function to get fabric details (price and ID) based on fabric ID
async function getFabricDetails(fabricId) {
    const fabricData = await fetchFabricPrices(); // Assuming this fetches all fabrics [{fabricID, fabricName, fabricPrice}, ...]

    if (!fabricData) {
        console.error("Fabric data not available");
        return { price: 0, name: null, id: fabricId }; // Return default object
    }

    // Find fabric by ID
    const fabric = fabricData.find(
        (f) => f.fabricID === parseInt(fabricId, 10) // Ensure comparison is with integer ID
    );

    if (fabric) {
        return {
            price: parseFloat(fabric.fabricPrice),
            name: fabric.fabricName,
            id: fabric.fabricID,
        };
    } else {
        console.warn(`Fabric details not found for ID: ${fabricId}`);
        // Handle case where ID might be for a custom fabric not yet in DB or error
        // If fabricId 1 is the placeholder for 'Custom', handle it specifically if needed
    }
    const customFabricInput = document.getElementById("custom_fabric_type");
    let customFabricPrice = 0;
    if (customFabricInput && customFabricInput.value) {
        customFabricPrice = parseFloat(customFabricInput.value);
        if (isNaN(customFabricPrice)) {
            customFabricPrice = 0;
        }
    }
    return { price: customFabricPrice, name: "Custom", id: fabricId }; // Default if not found
}

// Internal function to calculate the full grand total
async function calculateGrandTotal() {
    const fabricSelect = document.getElementById("fabric_type");
    let selectedFabricId = fabricSelect ? fabricSelect.value : null;

    // --- Calculate total base size cost and total quantity ---
    let totalSizeBaseCost = 0;
    let totalUnits = 0;

    if (selectedSizes && Array.isArray(selectedSizes)) {
        selectedSizes.forEach((item) => {
            const sizeKey = `size_${item.size.toUpperCase()}`;
            const sizeData = sizeMapping ? sizeMapping[sizeKey] : null;
            if (sizeData && item.quantity > 0) {
                totalSizeBaseCost += sizeData.price * item.quantity;
                totalUnits += item.quantity;
            }
        });
    } else {
        console.warn(
            "selectedSizes not available or not an array for calculation."
        );
    }

    // --- Get Fabric Price ---
    const fabricDetails = selectedFabricId
        ? await getFabricDetails(selectedFabricId)
        : { price: 0 };
    const fabricPrice = fabricDetails.price;

    // --- Calculate total Fabric Cost (fabric price per unit * total units) ---
    const totalFabricCost = fabricPrice * totalUnits;

    // --- Get Timeframe Percentage Cost (as direct value) ---
    const timeframePercentageCostValue = getTimeframePercentageCostValue();

    // --- Calculate FINAL TOTAL based on the formula: (total size base cost) + (total fabric cost) + percentageCost ---
    const grandTotal =
        (totalSizeBaseCost + totalFabricCost) *
        (1 + timeframePercentageCostValue / 100);

    return grandTotal;
}

// Exported function to update the UI display for the grand total
export async function updateGrandTotalDisplay() {
    const totalAmountElement = document.getElementById("totalAmount");
    if (totalAmountElement) {
        const grandTotal = await calculateGrandTotal();
        totalAmountElement.innerText = `${currencySymbol}${grandTotal.toLocaleString(
            "en-US",
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
    }
}

export function showQRCodeModal(qrCodeHtml, customizations) {
    Swal.fire({
        title: "Scan the QR Code",
        html: qrCodeHtml,
        showCloseButton: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        focusConfirm: false,
        customClass: {
            popup: "bg-primary text-white shadow-lg rounded-lg w-auto max-w-lg",
            confirmButton:
                "bg-green-600 text-white py-2 px-4 rounded hover:bg-green-800 transition mr-2",
            closeButton: "transition-transform transform hover:text-danger",
            title: "text-white font-bold",
            htmlContainer: "text-left",
        },
        background: "#171c2f",
        color: "#fff",
        width: "600px",
    });
}

// Modify the newcustomorder function to include timeframe in the order confirmation and submission
export async function newcustomorder() {
    const confirmOrderBtn = document.getElementById("confirmOrder");

    if (confirmOrderBtn) {
        let isConfirming = false;
        confirmOrderBtn.addEventListener("click", async () => {
            if (isConfirming) return;
            isConfirming = true;
            confirmOrderBtn.disabled = true;

            // --- Initial Validation ---
            // Calculate total quantity
            const totalQuantity = selectedSizes.reduce(
                (sum, size) => sum + size.quantity,
                0
            );

            const selectedTimeframeDetails = getSelectedTimeframeDetails();

            if (
                !selectedSizes ||
                selectedSizes.length === 0 ||
                selectedSizes.every((s) => s.quantity === 0)
            ) {
                showAlert(
                    "No Sizes Selected",
                    "Please select at least one size.",
                    "warning"
                );
                confirmOrderBtn.disabled = false;
                isConfirming = false;
                return;
            }

            if (!selectedTimeframeDetails) {
                showAlert(
                    "No Timeframe Selected",
                    "Please select a delivery timeframe.",
                    "warning"
                );
                confirmOrderBtn.disabled = false;
                isConfirming = false;
                return;
            }

            const fabricTypeSelect = document.getElementById("fabric_type");
            let selectedFabricId = fabricTypeSelect
                ? fabricTypeSelect.value
                : null;
            let selectedOption = fabricTypeSelect
                ? fabricTypeSelect.options[fabricTypeSelect.selectedIndex]
                : null;
            let selectedFabricName = selectedOption
                ? selectedOption.dataset.fabricName
                : "";
            const customFabricTypeInput =
                document.getElementById("custom_fabric_type");
            let customFabricName = "";

            if (!selectedFabricId) {
                showAlert(
                    "No Fabric Selected",
                    "Please select a fabric type.",
                    "warning"
                );
                confirmOrderBtn.disabled = false;
                isConfirming = false;
                return;
            }

            // Check if the selected fabric is 'Custom' and get the custom name
            if (selectedFabricName === "custom") {
                customFabricName = customFabricTypeInput
                    ? customFabricTypeInput.value.trim()
                    : "";
                if (!customFabricName) {
                    showAlert(
                        "Custom Fabric Name Missing",
                        "Please enter your custom fabric type name.",
                        "warning"
                    );
                    confirmOrderBtn.disabled = false;
                    isConfirming = false;
                    return;
                }
            }

            // --- Calculate Costs for Breakdown Display ---
            let sizeTableRows = "";
            let sizeTotalCost = 0;
            selectedSizes.forEach((item) => {
                const sizeKey = `size_${item.size.toUpperCase()}`;
                const sizeData = sizeMapping[sizeKey];
                if (sizeData && item.quantity > 0) {
                    const itemTotal = sizeData.price * item.quantity;
                    sizeTotalCost += itemTotal;
                    sizeTableRows += `
                        <tr>
                            <td class="py-1 px-2">${item.size.toUpperCase()}</td>
                            <td class="py-1 px-2 text-center">${
                                item.quantity
                            }</td>
                            <td class="py-1 px-2 text-right">${currencySymbol}${sizeData.price.toFixed(
                        2
                    )}</td>
                            <td class="py-1 px-2 text-right">${currencySymbol}${itemTotal.toFixed(
                        2
                    )}</td>
                        </tr>`;
                }
            });
            if (!sizeTableRows)
                sizeTableRows = `<tr><td colspan="4" class="py-1 px-2 text-center italic">No sizes selected or quantity is zero.</td></tr>`;

            // Fetch fabric details using the selected ID
            const fabricDetails = await getFabricDetails(selectedFabricId);
            const fabricCost = fabricDetails.price;
            const fabricDisplayName =
                selectedFabricName === "custom"
                    ? `Custom (${customFabricName})`
                    : fabricDetails.name || "N/A";

            // Get timeframe details
            const timeframeDetails = getSelectedTimeframeDetails();
            const timeframeCost = timeframeDetails
                ? parseFloat(timeframeDetails.cost)
                : 0;
            const timeframeDisplayName = timeframeDetails
                ? timeframeDetails.timeframeID === standardTimeframeId
                    ? `Standard (${timeframeDetails.delivery_timeframe})`
                    : `Custom: ${timeframeDetails.delivery_timeframe}`
                : "Standard (2 weeks)";

            // Calculate grand total (size cost + fabric cost + timeframe cost)

            // --- Calculate Costs for Breakdown Display and Grand Total ---
            let totalSizeBaseCost = 0; // Sum of sizePrice * quantity for all sizes
            let totalUnits = 0; // Total quantity across all sizes

            if (selectedSizes && Array.isArray(selectedSizes)) {
                selectedSizes.forEach((item) => {
                    const sizeKey = `size_${item.size.toUpperCase()}`;
                    const sizeData = sizeMapping ? sizeMapping[sizeKey] : null;
                    if (sizeData && item.quantity > 0) {
                        totalSizeBaseCost += sizeData.price * item.quantity;
                        totalUnits += item.quantity;
                    }
                });
            }

            // Fetch fabric details using the selected ID (use new variable names to avoid redeclaration)
            const fabricDetailsBreakdown = await getFabricDetails(
                selectedFabricId
            );
            const fabricPriceBreakdown = fabricDetailsBreakdown.price;
            const fabricDisplayNameBreakdown =
                selectedFabricName === "custom"
                    ? `Custom (${customFabricName})`
                    : fabricDetailsBreakdown.name || "N/A";

            // Calculate total fabric cost (fabric price per unit * total units)
            const totalFabricCostBreakdown = fabricPriceBreakdown * totalUnits;

            // Get timeframe details and percentage cost (use new variable names)
            const timeframeDetailsBreakdown = getSelectedTimeframeDetails();
            const percentageCostBreakdown = timeframeDetailsBreakdown
                ? parseFloat(timeframeDetailsBreakdown.percentageCost || 0) // Use percentageCost
                : 0;
            const timeframeDisplayNameBreakdown = timeframeDetailsBreakdown
                ? timeframeDetailsBreakdown.timeframeID === standardTimeframeId
                    ? `Standard (${timeframeDetailsBreakdown.delivery_timeframe})`
                    : `Custom: ${timeframeDetailsBreakdown.delivery_timeframe}`
                : "Standard (2 weeks)";

            // Calculate grand total based on the formula: (total size base cost) + (total fabric cost) + percentageCost
            const grandTotal =
                (totalSizeBaseCost + totalFabricCostBreakdown) *
                (1 + percentageCostBreakdown / 100); // Use percentageCost

            // --- Construct Breakdown Modal HTML Table with Scrolling ---
            const breakdownHtml = `
<div class="text-white w-full flex flex-col overflow-y-auto" style="max-height: 400px;">
    <!-- Combined Table using table-fixed for consistent column widths -->
    <table class="w-full text-sm border-collapse border border-gray-600 table-fixed">
        <thead class="bg-gray-700">
            <tr>
                <th class="w-4/12 py-1 px-2 border-r border-gray-600 text-left">Item</th>
                <th class="w-2/12 py-1 px-2 border-r border-gray-600 text-left">Details</th>
                <th class="w-2/12 py-1 px-2 border-r border-gray-600 text-right">Price</th>
                <th class="w-2/12 py-1 px-2 border-r border-gray-600 text-center">Quantity</th>
                <th class="w-2/12 py-1 px-2 text-right">Total</th>
            </tr>
        </thead>
    </table>
    <!-- Scrollable Table Body -->
    <div class="overflow-y-auto border-l border-r border-b border-gray-600 mb-4" style="max-height: 250px;">
        <table class="w-full text-sm border-collapse table-fixed">
            <tbody class="align-top">
                <!-- Size Rows -->
                ${selectedSizes
                    .filter((item) => item.quantity > 0)
                    .map((item) => {
                        const sizeKey = `size_${item.size.toUpperCase()}`;
                        const sizeData = sizeMapping[sizeKey];
                        if (sizeData) {
                            const itemTotal = sizeData.price * item.quantity;
                            return `
                        <tr class="border-b border-gray-600">
                            <td class="w-4/12 py-1 px-2 text-left">Size</td>
                            <td class="w-2/12 py-1 px-2 text-left">${item.size.toUpperCase()}</td>
                            <td class="w-2/12 py-1 px-2 text-right">${currencySymbol}${sizeData.price.toFixed(
                                2
                            )}</td>
                            <td class="w-2/12 py-1 px-2 text-center">${
                                item.quantity
                            }</td>
                            <td class="w-2/12 py-1 px-2 text-right">${currencySymbol}${itemTotal.toFixed(
                                2
                            )}</td>
                        </tr>
                        `;
                        }
                        return "";
                    })
                    .join("")}
                ${
                    selectedSizes.filter((item) => item.quantity > 0).length ===
                    0
                        ? `
                <tr class="border-b border-gray-600">
                    <td class="py-1 px-2 text-center italic" colspan="5">No sizes selected or quantity is zero.</td>
                </tr>
                `
                        : ""
                }

                <!-- Fabric Row -->
                <tr class="border-b border-gray-600">
                    <td class="w-4/12 py-1 px-2 text-left">Fabric</td>
                    <td class="w-2/12 py-1 px-2 text-left">${fabricDisplayNameBreakdown}</td>
                    <td class="w-2/12 py-1 px-2 text-right">${currencySymbol}${fabricPriceBreakdown.toFixed(
                2
            )}</td>
                    <td class="w-2/12 py-1 px-2 text-center">${totalUnits}</td>
                    <td class="w-2/12 py-1 px-2 text-right">${currencySymbol}${totalFabricCostBreakdown.toFixed(
                2
            )}</td>
                </tr>
                
                <!-- Timeframe Row -->
                <tr class="border-b border-gray-600">
                    <td class="w-4/12 py-1 px-2 text-left">Timeframe Cost</td>
                    <td id="summary_table_timeframe_details" class="w-2/12 py-1 px-2 text-left">${timeframeDisplayNameBreakdown}</td>
                    <td id="summary_table_timeframe_price" class="w-2/12 py-1 px-2 text-right">${percentageCostBreakdown.toFixed(
                        0
                    )}%</td>
                    <td class="w-2/12 py-1 px-2 text-center">1</td>
                    <td id="summary_table_timeframe_total" class="w-2/12 py-1 px-2 text-right">${percentageCostBreakdown.toFixed(
                        0
                    )}%</td>
                </tr>
            </tbody>
        </table>
    </div>
        
    <!-- Timeframe Slider Section (Keep this for adjusting) -->
    <div class="mb-4 border p-3 bg-accent rounded">
        <h3 class="font-medium mb-2">Delivery Timeframe</h3>
        
        <div class="flex justify-between items-center mb-2">
            <span class="text-white text-sm">Faster</span>
            <span id="summary_selected_timeframe" class="text-white font-medium">${timeframeDisplayNameBreakdown}</span>
            <div id="summary_max_orders" class="text-white text-sm">(${
                timeframeDetailsBreakdown
                    ? timeframeDetailsBreakdown.maximum_orders
                    : 0
            } max orders)</div>
            <span class="text-white text-sm">Slower</span>
        </div>
        
        <input type="range" id="summary_timeframe_slider" min="0" max="${
            timeframeData.length - 1
        }"
            value="${timeframeData.findIndex(
                (t) => t.timeframeID === selectedTimeframeId
            )}"
            class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer">
        
        <div class="flex justify-between text-xs text-white mt-1">
            ${timeframeData
                .map((t) => `<span>${t.delivery_timeframe}</span>`)
                .join("")}
        </div>
        
        <div class="text-white text-sm mt-2">
            Timeframe Cost: <span id="summary_timeframe_cost">${percentageCostBreakdown.toFixed(
                0
            )}%</span>
        </div>
    </div>

    <!-- Grand Total -->
    <div class="border-t border-gray-400 pt-3 mt-auto flex-shrink-0">
        <p class="text-right text-xl font-bold">Grand Total: <span id="summary_grand_total">${currencySymbol}${grandTotal.toLocaleString(
                "en-US",
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}</span></p>
    </div>
</div>
`;
            // Set the maximum orders in the window object
            window.maximumOrders = selectedTimeframeDetails.maximum_orders;

            const breakdownResult = await Swal.fire({
                title: "Order Summary",
                html: breakdownHtml,
                icon: "info",
                showCloseButton: true,
                confirmButtonText: "Confirm Order",
                cancelButtonText: "Cancel",
                buttonsStyling: false,
                customClass: {
                    popup: "bg-primary text-white shadow-lg rounded-lg w-auto max-w-lg",
                    confirmButton:
                        "bg-green-600 text-white py-2 px-4 rounded hover:bg-green-800 transition mr-2",
                    closeButton:
                        "transition-transform transform hover:text-danger",
                    title: "text-white font-bold",
                    htmlContainer: "text-left",
                },
                background: "#171c2f",
                color: "#fff",
                width: "600px",
                didOpen: () => {
                    // Add event listener to the timeframe slider in the summary
                    const summaryTimeframeSlider = document.getElementById(
                        "summary_timeframe_slider"
                    );
                    const summarySelectedTimeframe = document.getElementById(
                        "summary_selected_timeframe"
                    );
                    const summaryTimeframeCost = document.getElementById(
                        "summary_timeframe_cost"
                    );
                    const summaryGrandTotal = document.getElementById(
                        "summary_grand_total"
                    );
                    const summaryMaxOrders =
                        document.getElementById("summary_max_orders");

                    if (
                        summaryTimeframeSlider &&
                        summarySelectedTimeframe &&
                        summaryTimeframeCost &&
                        summaryGrandTotal &&
                        summaryMaxOrders
                    ) {
                        // Variable to store the previously selected valid timeframe index for the summary slider
                        let previousSummaryTimeframeIndex =
                            timeframeData.findIndex(
                                (t) => t.timeframeID === selectedTimeframeId
                            );
                        if (previousSummaryTimeframeIndex === -1)
                            previousSummaryTimeframeIndex = 1; // Default to index 1 (2 weeks)

                        summaryTimeframeSlider.addEventListener(
                            "input",
                            async function () {
                                // Added async here
                                const newIndex = parseInt(this.value);
                                const potentialTimeframe =
                                    timeframeData[newIndex]; // Renamed 'selected' to avoid conflict
                                const totalQuantity = selectedSizes.reduce(
                                    (sum, size) => sum + size.quantity,
                                    0
                                ); // Recalculate total quantity

                                if (
                                    potentialTimeframe &&
                                    totalQuantity >
                                        potentialTimeframe.maximum_orders
                                ) {
                                    showAlert(
                                        "Quantity Exceeds Limit",
                                        `The selected quantity (${totalQuantity}) exceeds the maximum allowed orders (${potentialTimeframe.maximum_orders}) for the ${potentialTimeframe.delivery_timeframe} timeframe. Please select a different timeframe or reduce the quantity.`,
                                        "warning"
                                    );
                                    // Revert slider value
                                    this.value = previousSummaryTimeframeIndex;
                                    // Update UI based on the previous valid timeframe
                                    const validTimeframe =
                                        timeframeData[
                                            previousSummaryTimeframeIndex
                                        ];
                                    selectedTimeframeId =
                                        validTimeframe.timeframeID; // Update the global selectedTimeframeId
                                    const validDisplayName =
                                        validTimeframe.timeframeID ===
                                        standardTimeframeId
                                            ? `Standard ${validTimeframe.delivery_timeframe}`
                                            : `Custom: ${validTimeframe.delivery_timeframe}`;
                                    summarySelectedTimeframe.textContent =
                                        validDisplayName;
                                    summaryMaxOrders.textContent = `(${validTimeframe.maximum_orders} max orders)`;
                                    const summaryTableTimeframeDetails =
                                        document.getElementById(
                                            "summary_table_timeframe_details"
                                        );
                                    if (summaryTableTimeframeDetails) {
                                        summaryTableTimeframeDetails.textContent =
                                            validDisplayName;
                                    }
                                    const validTimeframePercentageCost =
                                        parseFloat(
                                            validTimeframe.percentageCost || 0
                                        );
                                    summaryTimeframeCost.textContent = `${validTimeframePercentageCost.toFixed(
                                        0
                                    )}%`;
                                    const summaryTableTimeframePrice =
                                        document.getElementById(
                                            "summary_table_timeframe_price"
                                        );
                                    const summaryTableTimeframeTotal =
                                        document.getElementById(
                                            "summary_table_timeframe_total"
                                        );
                                    if (summaryTableTimeframePrice) {
                                        summaryTableTimeframePrice.textContent = `${validTimeframePercentageCost.toFixed(
                                            0
                                        )}%`;
                                    }
                                    if (summaryTableTimeframeTotal) {
                                        summaryTableTimeframeTotal.textContent = `${validTimeframePercentageCost.toFixed(
                                            0
                                        )}%`;
                                    }
                                    // Recalculate and update grand total based on the previous valid timeframe
                                    // This is handled by the existing logic after the 'else' block,
                                    // as it uses the updated selectedTimeframeId.
                                } else if (potentialTimeframe) {
                                    // Valid selection
                                    previousSummaryTimeframeIndex = newIndex; // Update previous valid index
                                    selectedTimeframeId =
                                        potentialTimeframe.timeframeID; // Update the global selectedTimeframeId
                                    const newDisplayName =
                                        potentialTimeframe.timeframeID ===
                                        standardTimeframeId
                                            ? `Standard ${potentialTimeframe.delivery_timeframe}`
                                            : `Custom: ${potentialTimeframe.delivery_timeframe}`;
                                    summarySelectedTimeframe.textContent =
                                        newDisplayName;
                                    summaryMaxOrders.textContent = `(${potentialTimeframe.maximum_orders} max orders)`;
                                    const summaryTableTimeframeDetails =
                                        document.getElementById(
                                            "summary_table_timeframe_details"
                                        );
                                    if (summaryTableTimeframeDetails) {
                                        summaryTableTimeframeDetails.textContent =
                                            newDisplayName;
                                    }
                                    const newTimeframePercentageCost =
                                        parseFloat(
                                            potentialTimeframe.percentageCost ||
                                                0
                                        );
                                    summaryTimeframeCost.textContent = `${newTimeframePercentageCost.toFixed(
                                        0
                                    )}%`;
                                    const summaryTableTimeframePrice =
                                        document.getElementById(
                                            "summary_table_timeframe_price"
                                        );
                                    const summaryTableTimeframeTotal =
                                        document.getElementById(
                                            "summary_table_timeframe_total"
                                        );
                                    if (summaryTableTimeframePrice) {
                                        summaryTableTimeframePrice.textContent = `${newTimeframePercentageCost.toFixed(
                                            0
                                        )}%`;
                                    }
                                    if (summaryTableTimeframeTotal) {
                                        summaryTableTimeframeTotal.textContent = `${newTimeframePercentageCost.toFixed(
                                            0
                                        )}%`;
                                    }
                                    // The existing logic after this block recalculates and updates the grand total
                                    // and other UI elements based on the updated selectedTimeframeId.
                                }
                                // The existing logic to recalculate and update grand total and side panel
                                // is outside the if/else block but inside the event listener.
                                // It relies on the global selectedTimeframeId, which is updated above.
                                // So, it will correctly calculate based on the valid or reverted timeframe.
                                // We just need to ensure it's called. It seems it is.
                                // Let's double check the original code structure.
                                // Yes, the recalculation and update calls are after the if block.
                                // So, they will run after the selectedTimeframeId is set (either to the new valid one or reverted).
                                // This seems correct.
                                let currentTotalSizeBaseCost = 0;
                                let currentTotalUnits = 0;
                                if (
                                    selectedSizes &&
                                    Array.isArray(selectedSizes)
                                ) {
                                    selectedSizes.forEach((item) => {
                                        const sizeKey = `size_${item.size.toUpperCase()}`;
                                        const sizeData = sizeMapping
                                            ? sizeMapping[sizeKey]
                                            : null;
                                        if (sizeData && item.quantity > 0) {
                                            currentTotalSizeBaseCost +=
                                                sizeData.price * item.quantity;
                                            currentTotalUnits += item.quantity;
                                        }
                                    });
                                }

                                const currentFabricSelect =
                                    document.getElementById("fabric_type");
                                let currentSelectedFabricId =
                                    currentFabricSelect
                                        ? currentFabricSelect.value
                                        : null;
                                const currentFabricDetails =
                                    currentSelectedFabricId
                                        ? await getFabricDetails(
                                              currentSelectedFabricId
                                          )
                                        : { price: 0 };
                                const currentFabricPrice =
                                    currentFabricDetails.price;
                                const currentTotalFabricCost =
                                    currentFabricPrice * currentTotalUnits;

                                const timeframeDetailsForTotal =
                                    timeframeData.find(
                                        (t) =>
                                            t.timeframeID ===
                                            selectedTimeframeId
                                    );
                                const percentageCostForTotal =
                                    timeframeDetailsForTotal
                                        ? parseFloat(
                                              timeframeDetailsForTotal.percentageCost ||
                                                  0
                                          )
                                        : 0;

                                const newGrandTotal =
                                    (currentTotalSizeBaseCost +
                                        currentTotalFabricCost) *
                                    (1 + percentageCostForTotal / 100);
                                const formattedNewGrandTotal =
                                    newGrandTotal.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    });
                                summaryGrandTotal.textContent = `${currencySymbol}${formattedNewGrandTotal}`;

                                const mainTotalAmountElement =
                                    document.getElementById("totalAmount");
                                const sidePanelTotalElement =
                                    document.getElementById("summaryTotal");
                                if (mainTotalAmountElement) {
                                    mainTotalAmountElement.textContent = `${currencySymbol}${formattedNewGrandTotal}`;
                                }
                                if (sidePanelTotalElement) {
                                    sidePanelTotalElement.textContent = `${currencySymbol}${formattedNewGrandTotal}`;
                                }

                                updateOrderDetailsPanel();
                            }
                        );
                    }
                },
            });
            // Check if the user confirmed, cancelled, or closed the modal
            if (!breakdownResult.isConfirmed) {
                console.log(
                    "User cancelled or closed the order from breakdown summary."
                );
                confirmOrderBtn.disabled = false;
                isConfirming = false;
                return; // Exit the function early to prevent order submission
            }

            // If we reach this point, the user clicked "Confirm Order"
            console.log("User confirmed the order");

            // Show loading indicator
            Swal.fire({
                title: "Submitting Order...",
                text: "Please wait while we process your order.",
                icon: "info",
                showConfirmButton: false,
                allowOutsideClick: false,
                background: "#171c2f",
                color: "#fff",
                willOpen: () => {
                    Swal.showLoading();
                },
            });

            // Collect the data for submission
            console.log("Collected Sizes:", selectedSizes);

            const sizes = selectedSizes
                .map((size) => {
                    const sizeKey = `size_${size.size.toUpperCase()}`;
                    const sizeData = sizeMapping[sizeKey];
                    if (!sizeData) {
                        console.error(
                            `Size data not found for key: ${sizeKey}`
                        );
                        return null;
                    }
                    return {
                        sizeID: sizeData.id,
                        quantity: size.quantity,
                    };
                })
                .filter((size) => size !== null);

            // Use the global currentColorValue based on the current target.
            let backColor = window.selectedBackColor || "#ffffff";
            let frontColor = window.selectedFrontBodyColor || "#ffffff";
            let sleevesColor = window.selectedSleevesColor || "#000000";
            let collarColor = window.selectedCollarColor || "#000000";

            if (window.currentColorTarget) {
                // Update the corresponding color with the current value.
                if (window.currentColorTarget === "back") {
                    backColor = window.currentColorValue;
                    window.selectedBackColor = window.currentColorValue;
                } else if (window.currentColorTarget === "front") {
                    frontColor = window.currentColorValue;
                    window.selectedFrontBodyColor = window.currentColorValue;
                } else if (window.currentColorTarget === "sleeves") {
                    sleevesColor = window.currentColorValue;
                    window.selectedSleevesColor = window.currentColorValue;
                } else if (window.currentColorTarget === "collar") {
                    collarColor = window.currentColorValue;
                    window.selectedCollarColor = window.currentColorValue;
                }
            }

            console.log("Colors Selected:", {
                backColor,
                frontColor,
                sleevesColor,
                collarColor,
            });

            const colors = {
                backColor: backColor,
                frontColor: frontColor,
                sleevesColor: sleevesColor,
                collarColor: collarColor,
            };

            const textDecalsArray = window.textDecals || [];
            let textCustomization = null;

            // Process all text decals and format them in the specified format
            if (textDecalsArray.length > 0) {
                // Create an array to hold individual text customization objects
                let textCustomizationsArray = [];

                textDecalsArray.forEach((decal) => {
                    const singleTextCustomization = {
                        text: decal.userData.text,
                        fontSize: decal.userData.fontSize + "px",
                        fontColor: decal.userData.textColor,
                        fontPosition: {
                            x: decal.userData.position.x.toFixed(2),
                            y: decal.userData.position.y.toFixed(2),
                            z: decal.userData.position.z.toFixed(2),
                        },
                        meshName: decal.userData.meshName,
                    };

                    // Add the customization object to the array
                    textCustomizationsArray.push(singleTextCustomization);
                });

                // Stringify the entire array once
                textCustomization = JSON.stringify(textCustomizationsArray);
            }

            console.log("Text Customization:", textCustomization);

            // Build the customizations object to send to the backend
            const customizations = {
                sizes: sizes,
                fabric_id: parseInt(selectedFabricId, 10),
                ...(selectedFabricName === "custom" &&
                    customFabricName && {
                        custom_fabric_name: customFabricName,
                    }),
                colors: colors,
                text: textCustomization,
                timeframe_id: selectedTimeframeId,
            };

            console.log("Customizations:", customizations);

            // Get CSRF token
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                .getAttribute("content");

            try {
                Swal.fire({
                    title: "Processing order...",
                    text: "Please wait while we process your order.",
                    icon: "info",
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    customClass: {
                        popup: "bg-primary text-white shadow-lg rounded-lg w-auto max-w-lg",
                        title: "text-white font-bold",
                        htmlContainer: "text-left",
                    },
                    background: "#171c2f",
                    color: "#fff",
                    width: "400px",
                    didOpen: () => {
                        Swal.showLoading();
                    },
                });
                // Submit the order - FIX: set the proper headers for HTML response
                const response = await fetch("/qrcode", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    body: JSON.stringify(customizations),
                });

                if (response.ok) {
                    // FIX: Get the HTML content instead of parsing as JSON
                    const htmlContent = await response.text();

                    // Display the QR code page directly
                    // Create a temporary container to extract the QR code image from the HTML
                    const tempDiv = document.createElement("div");
                    tempDiv.innerHTML = htmlContent;
                    const qrCodeImg = tempDiv.querySelector(
                        "#qrCodeContainer img"
                    );
                    const qrCodeSrc = qrCodeImg ? qrCodeImg.src : "";

                    // Show the QR code in a modal
                    showQRCodeModal(htmlContent, customizations);

                    // Send the QR code to a random employee
                    const sendQRCodeResponse = await fetch("/send-qrcode", {
                        method: "GET",
                        headers: {
                            "X-CSRF-TOKEN": csrfToken,
                        },
                    });

                    if (!sendQRCodeResponse.ok) {
                        console.error(
                            "Failed to send QR code to the employee."
                        );
                    }

                    // Generate billing statement without triggering download
                    const billingResponse = await fetch(
                        "/generate-billing-statement",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "X-CSRF-TOKEN": csrfToken,
                            },
                            body: JSON.stringify(customizations),
                        }
                    );

                    if (billingResponse.ok) {
                        const data = await billingResponse.json();
                        console.log("Billing statement generated:", data);
                    } else {
                        console.error(
                            "Failed to generate billing statement:",
                            billingResponse.status
                        );
                    }
                } else {
                    Swal.fire({
                        title: "Order Submission Failed",
                        text: "There was an error submitting your order. Please try again.",
                        icon: "error",
                        background: "#171c2f",
                        color: "#fff",
                    });
                }
            } catch (error) {
                console.error("Error submitting order:", error);
                Swal.fire({
                    title: "Order Submission Failed",
                    text:
                        "There was an error submitting your order. Please check your network connection and try again. Error: " +
                        error.message,
                    icon: "error",
                    background: "#171c2f",
                    color: "#fff",
                });
            } finally {
                // Re-enable the button
                confirmOrderBtn.disabled = false;
                isConfirming = false;
                // Clear the customization state after successful submission
                clearCustomizationState();
                Swal.close();
            }
        });
    }
}
// --- Order Summary Functions ---
// Update the order summary panel to include timeframe
function updateOrderDetailsPanel() {
    // Calculate total quantity from selected sizes
    let totalSizesQuantity = 0;
    if (typeof selectedSizes !== "undefined") {
        totalSizesQuantity = selectedSizes.reduce(
            (total, size) => total + size.quantity,
            0
        );
    }

    // Update Fabric section (with quantity reflecting total sizes)
    const fabricSelect = document.getElementById("fabric_type");
    const customFabricInput = document.getElementById("custom_fabric_type");
    const summaryFabric = document.getElementById("summaryFabric");

    if (fabricSelect && summaryFabric) {
        const selectedOption = fabricSelect.options[fabricSelect.selectedIndex];
        if (selectedOption && selectedOption.value) {
            const fabricPrice = parseFloat(
                selectedOption.dataset.fabricPrice || 0
            );
            let fabricName =
                selectedOption.dataset.fabricName || selectedOption.textContent;

            if (
                selectedOption.dataset.fabricName === "custom" &&
                customFabricInput &&
                !customFabricInput.classList.contains("hidden") &&
                customFabricInput.value.trim()
            ) {
                fabricName = `Custom: ${customFabricInput.value.trim()}`;
            }

            summaryFabric.textContent = fabricName;

            const fabricRow = summaryFabric.closest("tr");
            if (fabricRow) {
                const priceCell = fabricRow.cells[2];
                if (priceCell) {
                    priceCell.textContent = `${currencySymbol}${fabricPrice.toFixed(
                        2
                    )}`;
                }
                const quantityCell = fabricRow.cells[3];
                if (quantityCell) {
                    // Update quantity cell to show total quantity from all sizes
                    quantityCell.textContent = totalSizesQuantity.toString();
                }
                const totalCell = fabricRow.cells[4];
                if (totalCell) {
                    // Update total to reflect the total quantity
                    const totalFabricCost = fabricPrice * totalSizesQuantity;
                    totalCell.textContent = `${currencySymbol}${totalFabricCost.toFixed(
                        2
                    )}`;
                }
            }
        } else {
            summaryFabric.textContent = "None selected";
            const fabricRow = summaryFabric.closest("tr");
            if (fabricRow) {
                fabricRow.cells[2].textContent = "";
                fabricRow.cells[3].textContent = "";
                fabricRow.cells[4].textContent = "";
            }
        }
    }

    // Update Sizes section - append a new row for each selected size
    const sizesContainer = document.getElementById("sizesContainer");
    // Ensure that selectedSizes (an array of size objects) exists in your scope
    if (sizesContainer && typeof selectedSizes !== "undefined") {
        // Clear any previous size rows
        sizesContainer.innerHTML = "";

        // Filter out sizes with quantity = 0
        const activeSizes = selectedSizes.filter((size) => size.quantity > 0);

        activeSizes.forEach((item) => {
            // Create a new row for the current size
            const row = document.createElement("tr");
            row.className = "border-b border-gray-700";

            // Column 1: Item (hardcoded as "Size" or modify as needed)
            const colItem = document.createElement("td");
            colItem.className = "py-2";
            colItem.textContent = "Size";
            row.appendChild(colItem);

            // Column 2: Details (the actual size name, e.g., 'S', 'M', etc.)
            const colDetails = document.createElement("td");
            colDetails.className = "py-2";
            colDetails.textContent = item.size.toUpperCase();
            row.appendChild(colDetails);

            // Column 3: Price per size retrieved from the sizeMapping
            const colPrice = document.createElement("td");
            colPrice.className = "text-right py-2";
            const sizeKey = `size_${item.size.toUpperCase()}`;
            const sizeData = sizeMapping[sizeKey];
            if (sizeData) {
                colPrice.textContent = `${currencySymbol}${sizeData.price.toFixed(
                    2
                )}`;
            }
            row.appendChild(colPrice);

            // Column 4: Quantity
            const colQuantity = document.createElement("td");
            colQuantity.className = "text-center py-2";
            colQuantity.textContent = item.quantity;
            row.appendChild(colQuantity);

            // Column 5: Total cost (price * quantity)
            const colTotal = document.createElement("td");
            colTotal.className = "text-right py-2";
            if (sizeData) {
                const totalCost = sizeData.price * item.quantity;
                colTotal.textContent = `${currencySymbol}${totalCost.toFixed(
                    2
                )}`;
            }
            row.appendChild(colTotal);

            // Append the newly created row to the sizes container
            sizesContainer.appendChild(row);
        });
    }

    // --- Update Timeframe Row in Side Panel ---
    // Target the tbody containing the fabric and total rows
    // Target the tbody containing the fabric and total rows to find its parent table
    const summaryTotalElement = document.getElementById("summaryTotal");
    const summaryTableBodyForTimeframe = summaryTotalElement
        ? summaryTotalElement.closest("tbody")
        : null;
    const summaryTableElement = summaryTableBodyForTimeframe
        ? summaryTableBodyForTimeframe.closest("table")
        : null;
    const timeframeDetails = getSelectedTimeframeDetails();
    const timeframePercentageCostValue = getTimeframePercentageCostValue(); // Use the function that gets percentageCost
    const timeframeRowId = "summary-panel-timeframe-row";
    let timeframeRow = document.getElementById(timeframeRowId);

    if (summaryTableBodyForTimeframe && timeframeDetails) {
        const timeframeDisplayName =
            timeframeDetails.timeframeID === standardTimeframeId
                ? `Standard (${timeframeDetails.delivery_timeframe})`
                : `Custom: ${timeframeDetails.delivery_timeframe}`;

        if (!timeframeRow) {
            // Create row if it doesn't exist
            timeframeRow = document.createElement("tr");
            timeframeRow.id = timeframeRowId;
            timeframeRow.className = "border-b border-gray-700"; // Match styling
            // Add cells matching the structure (Item, Details, Price/Cost, Qty, Total)
            timeframeRow.innerHTML = `
                <td class="py-2">Timeframe Cost</td>
                <td class="py-2"></td>
                <td class="text-right py-2"></td>
                <td class="text-center py-2"></td>
                <td class="text-right py-2"></td>
            `;
            // Find the fabric row to insert after
            const fabricRowElement = document
                .getElementById("summaryFabric")
                ?.closest("tr");

            if (
                fabricRowElement &&
                fabricRowElement.parentNode === summaryTableBodyForTimeframe
            ) {
                // Insert after the fabric row
                summaryTableBodyForTimeframe.insertBefore(
                    timeframeRow,
                    fabricRowElement.nextSibling
                );
            } else {
                // Fallback: Append if fabric row isn't found in the expected place or if it's the last element
                summaryTableBodyForTimeframe.appendChild(timeframeRow);
            }
        }

        // Update cells (assuming 5 columns: Item, Details, Price/Cost, Qty, Total)
        const cells = timeframeRow.cells;
        if (cells.length === 5) {
            cells[1].textContent = timeframeDisplayName; // Details
            // Display the percentageCost value directly as the cost/price and total
            cells[2].textContent = `${timeframePercentageCostValue.toFixed(
                0
            )}%`; // Price/Cost
            cells[3].textContent = "1"; // Quantity is always 1 for timeframe cost
            cells[4].textContent = `${timeframePercentageCostValue.toFixed(
                0
            )}%`; // Total
        }
    } else if (timeframeRow) {
        // Remove row if no timeframe is selected (or if container not found)
        timeframeRow.remove();
    }

    // Update Total row - this should now include timeframe cost via calculateGrandTotal -> updateGrandTotalDisplay
    const summaryTotal = document.getElementById("summaryTotal");
    const totalAmountElement = document.getElementById("totalAmount");
    if (summaryTotal && totalAmountElement) {
        // Ensure totalAmount reflects the latest calculation including timeframe
        summaryTotal.textContent = totalAmountElement.textContent;
    }
}

// Function to toggle the visibility of the summary panel
function setupSummaryPanelToggle() {
    const toggleButton = document.getElementById("toggleSummaryPanel");
    const summaryPanel = document.getElementById("orderDetailsPanel");
    const summaryContent = document.getElementById("summaryContent");

    if (toggleButton && summaryPanel && summaryContent) {
        let isPanelCollapsed = false;

        toggleButton.addEventListener("click", () => {
            isPanelCollapsed = !isPanelCollapsed;

            if (isPanelCollapsed) {
                // Collapse the panel
                summaryPanel.classList.remove("w-64");
                summaryPanel.classList.add("w-12");
                toggleButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
                // Hide content
                summaryContent.classList.add("hidden");
            } else {
                // Expand the panel
                summaryPanel.classList.remove("w-12");
                summaryPanel.classList.add("w-64");
                toggleButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
                // Show content
                summaryContent.classList.remove("hidden");
            }
        });
    }
}

// Modified version of updateGrandTotalDisplay to also update the summary panel. Only use this if you're replacing the existing function
async function updateGrandTotalDisplayWithSummary() {
    const totalAmountElement = document.getElementById("totalAmount");
    if (totalAmountElement) {
        const grandTotal = await calculateGrandTotal();
        totalAmountElement.innerText = `${currencySymbol}${grandTotal.toLocaleString(
            "en-US",
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;

        // Update the order summary panel after updating the total
        updateOrderDetailsPanel();
    }
}

// Add event listeners for form inputs to update the summary panel
function setupOrderSummaryListeners() {
    const fabricSelect = document.getElementById("fabric_type");
    const customFabricInput = document.getElementById("custom_fabric_type");

    if (fabricSelect) {
        fabricSelect.addEventListener("change", updateOrderDetailsPanel);
    }

    if (customFabricInput) {
        customFabricInput.addEventListener("input", updateOrderDetailsPanel);
    }

    // Add observers for size changes
    document.addEventListener("sizeSelectionChanged", updateOrderDetailsPanel);
}

// Init function to call in your DOMContentLoaded event
function initOrderSummary() {
    setupSummaryPanelToggle();
    setupOrderSummaryListeners();
    updateOrderDetailsPanel();

    // Hook into existing update functions if you don't want to replace them
    const originalUpdateGrandTotal = updateGrandTotalDisplay;
    if (typeof originalUpdateGrandTotal === "function") {
        updateGrandTotalDisplay = async function () {
            await originalUpdateGrandTotal.apply(this, arguments);
            updateOrderDetailsPanel();
        };
    }
}

document.addEventListener("DOMContentLoaded", function () {
    populateFabricDropdown();
    setupTimeframeSelection(); // Add this line to initialize the timeframe UI
    initOrderSummary();
});
