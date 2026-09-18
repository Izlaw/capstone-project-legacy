import Swal from "sweetalert2";
import "./swalpopup.js";
import { sizeDimensions } from "./calculation.js";

// Initialize the sizeMapping object
let sizeMapping = {};

// Fetch sizes data from API
async function fetchSizes() {
    try {
        const response = await fetch("/api/sizes");
        if (!response.ok) throw new Error("Network response was not ok");
        const sizes = await response.json();
        sizeMapping = sizes.reduce((acc, size) => {
            acc[size.sizeName] = {
                id: size.sizeID,
                price: parseFloat(size.sizePrice),
            };
            return acc;
        }, {});
        return sizes;
    } catch (error) {
        console.error("Failed to fetch sizes:", error);
        return [];
    }
}

// Function to create a size and quantity row
function createSizeRow(sizes, selectedSize = "", selectedQuantity = 0) {
    const row = document.createElement("tr");
    row.className = "border-b border-gray-200";

    const sizeCell = document.createElement("td");
    sizeCell.className = "py-2 px-4 border-b border-gray-200";
    const sizeDropdown = document.createElement("select");
    // Use a placeholder option that is disabled so that users cannot submit an empty value.
    sizeDropdown.name = "sizes[]";
    sizeDropdown.className =
        "sizeDropdown border rounded-md p-2 w-full text-black bg-white hover:bg-gray-300 transition-colors duration-300 focus:outline-none";
    sizeDropdown.innerHTML =
        `<option value="" disabled selected>Select Size</option>` +
        sizes
            .map((size) => {
                const sizeName = size.sizeName;
                const dimensions = sizeDimensions[sizeName] || "";
                const displayText = dimensions
                    ? `${sizeName} (${dimensions})`
                    : sizeName;
                return `<option value="${sizeName}" data-id="${size.sizeID}">${displayText}</option>`;
            })
            .join("");
    if (selectedSize) sizeDropdown.value = selectedSize;
    sizeCell.appendChild(sizeDropdown);
    row.appendChild(sizeCell);

    const priceCell = document.createElement("td");
    priceCell.className = "py-2 px-4 border-b border-gray-200 price-column";
    priceCell.style.width = "200px";
    priceCell.textContent = selectedSize
        ? `₱${sizeMapping[selectedSize].price}`
        : "₱0.00";
    row.appendChild(priceCell);

    const quantityCell = document.createElement("td");
    quantityCell.className = "py-2 px-4 border-b border-gray-200";
    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.step = "1";
    quantityInput.name = "quantities[]";
    quantityInput.min = "0";
    quantityInput.value = selectedQuantity;
    quantityInput.className =
        "quantityInput text-center border rounded-md w-3/4 text-black bg-white hover:bg-gray-300 transition-colors duration-300";
    quantityCell.appendChild(quantityInput);
    row.appendChild(quantityCell);

    const deleteCell = document.createElement("td");
    deleteCell.className = "py-2 px-4 border-b border-gray-200";
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className =
        "bg-red-500 text-white py-1 px-2 rounded hover:bg-red-700 transition";
    deleteButton.innerHTML = `<i class="bi bi-x-lg"></i>`;
    deleteButton.addEventListener("click", () => {
        row.remove();
        updateDropdownOptions();
        updateTotalAmountDisplay();
    });
    deleteCell.appendChild(deleteButton);
    row.appendChild(deleteCell);

    sizeDropdown.addEventListener("change", () => {
        const selectedSize = sizeDropdown.value;
        if (sizeMapping[selectedSize])
            priceCell.textContent = `₱${sizeMapping[selectedSize].price}`;
        updateDropdownOptions();
        updateTotalAmountDisplay();
    });
    quantityInput.addEventListener("input", function () {
        if (this.value.includes(".")) {
            Swal.showValidationMessage("Quantities must be whole numbers");
            this.value = this.value.replace(/\./g, ""); // Remove the dot
            setTimeout(() => {
                Swal.closeValidationMessage();
            }, 2000);
        }
        updateTotalAmountDisplay();
    });

    quantityInput.addEventListener("input", updateTotalAmountDisplay);

    return row;
}

// Function to update dropdown options based on selected sizes
function updateDropdownOptions() {
    const selectedSizes = Array.from(document.querySelectorAll(".sizeDropdown"))
        .map((dropdown) => dropdown.value)
        .filter((value) => value !== "");
    document.querySelectorAll(".sizeDropdown").forEach((dropdown) => {
        const currentValue = dropdown.value;
        const options = Array.from(dropdown.querySelectorAll("option"));
        options.forEach((option) => {
            if (option.value !== "" && option.value !== currentValue)
                option.remove();
        });
        Object.keys(sizeMapping).forEach((key) => {
            const sizeName = key;
            if (
                !selectedSizes.includes(sizeName) ||
                sizeName === currentValue
            ) {
                if (
                    !Array.from(dropdown.options).some(
                        (option) => option.value === sizeName
                    )
                ) {
                    const option = document.createElement("option");
                    option.value = sizeName;
                    option.textContent = sizeName;
                    option.dataset.id = sizeMapping[sizeName].id;
                    dropdown.appendChild(option);
                }
            }
        });
    });
}

// Function to calculate total price based on the selected sizes and quantities
function calculateTotal() {
    let totalAmount = 0;
    const sizeDropdowns = document.querySelectorAll(".sizeDropdown");
    const quantityInputs = document.querySelectorAll(".quantityInput");
    sizeDropdowns.forEach((dropdown, index) => {
        const selectedSize = dropdown.value;
        const quantity = parseInt(quantityInputs[index].value) || 0;
        if (sizeMapping[selectedSize])
            totalAmount += sizeMapping[selectedSize].price * quantity;
    });
    return totalAmount;
}

// Function to update the total amount display
function updateTotalAmountDisplay() {
    const totalAmount = calculateTotal();
    document.getElementById(
        "totalAmountDisplay"
    ).innerText = `Total Amount: ₱${totalAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

// Function to check if user is authenticated
function isAuthenticated() {
    // Check for authentication status in a meta tag or other element
    const authElement = document.querySelector('meta[name="auth-status"]');
    return (
        authElement && authElement.getAttribute("content") === "authenticated"
    );
}

// Function to redirect to login page
function redirectToLogin() {
    window.location.href = "/login";
}

// Function to handle the size selection process
async function handleSizeSelection(collectID, collection) {
    // Check authentication first
    if (!isAuthenticated()) {
        redirectToLogin();
        return null;
    }

    const sizes = await fetchSizes();
    const modalContent = document.createElement("div");
    modalContent.id = "modalSizeInputsContainer";
    const table = document.createElement("table");
    table.className = "min-w-full bg-primary border-collapse";
    table.innerHTML = `
        <thead>
            <tr class="border-b border-gray-200">
                <th class="py-2 px-4 bg-accent text-center text-xs font-semibold text-white uppercase tracking-wider border-b border-gray-200">Size</th>
                <th class="py-2 px-4 bg-accent text-center text-xs font-semibold text-white uppercase tracking-wider price-column border-b border-gray-200" style="width: 200px;">Price</th>
                <th class="py-2 px-4 bg-accent text-center text-xs font-semibold text-white uppercase tracking-wider border-b border-gray-200">Quantity</th>
                <th class="py-2 px-4 bg-accent text-center text-xs font-semibold text-white uppercase tracking-wider border-b border-gray-200">Action</th>
            </tr>
        </thead>
        <tbody id="sizeTableBody"></tbody>
    `;
    const tbody = table.querySelector("#sizeTableBody");
    tbody.appendChild(createSizeRow(sizes));
    modalContent.appendChild(table);

    const totalAmountDisplay = document.createElement("div");
    totalAmountDisplay.id = "totalAmountDisplay";
    totalAmountDisplay.className = "text-right font-semibold mt-4";
    totalAmountDisplay.innerText = `Total Amount: ₱${calculateTotal().toLocaleString(
        "en-US",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )}`;
    modalContent.appendChild(totalAmountDisplay);

    const addSizeButton = document.createElement("button");
    addSizeButton.type = "button";
    addSizeButton.classList.add(
        "bg-secondary",
        "text-white",
        "py-2",
        "px-4",
        "rounded",
        "hover:bg-highlight",
        "transition",
        "mt-2"
    );
    addSizeButton.innerHTML = `<i class="bi bi-plus-lg"></i>`;
    addSizeButton.addEventListener("click", () => {
        tbody.appendChild(createSizeRow(sizes));
        updateDropdownOptions();
        updateTotalAmountDisplay();
    });
    modalContent.appendChild(addSizeButton);

    return Swal.fire({
        title: "Collection Order",
        html: modalContent,
        customClass: {
            popup: "bg-primary text-white shadow-lg rounded-lg w-96",
            title: "text-xl font-semibold mb-4",
            content: "text-lg",
            closeButton: "transition-transform transform hover:text-danger",
            confirmButton:
                "bg-secondary text-white py-2 px-4 rounded hover:bg-highlight transition",
            validationMessage: "bg-secondary p-2 text-white",
        },
        allowEscapeKey: false,
        allowOutsideClick: false,
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: "Next",
        preConfirm: () => {
            const sizeDropdowns = document.querySelectorAll(".sizeDropdown");
            const quantityInputs = document.querySelectorAll(".quantityInput");

            // Extract data-id for each selected size
            const sizeIds = Array.from(sizeDropdowns).map((dropdown) => {
                const selectedOption = dropdown.options[dropdown.selectedIndex];
                return selectedOption ? selectedOption.dataset.id : "";
            });

            const quantities = Array.from(quantityInputs).map(
                (input) => input.value || ""
            );

            if (sizeIds.some((id) => !id)) {
                Swal.showValidationMessage(
                    "Please select a valid size for each row"
                );
                return false;
            }
            if (quantities.some((qty) => qty === "")) {
                Swal.showValidationMessage(
                    "Please enter a quantity for each size"
                );
                return false;
            }
            if (
                quantities.some((qty) => isNaN(qty) || parseInt(qty, 10) <= 0)
            ) {
                Swal.showValidationMessage(
                    "Quantities must be positive numbers"
                );
                return false;
            }
            return { sizes: sizeIds, quantities: quantities };
        },
        width: "800px",
    }).then(async (result) => {
        // Added async here
        console.log("result.isConfirmed:", result.isConfirmed);
        if (result.isConfirmed) {
            // Extract data from the result
            const { sizes, quantities } = result.value;

            // Display the order summary Swal
            console.log("Displaying order summary Swal...");

            // Construct order summary HTML
            let sizeTableRows = "";
            let totalAmount = 0;

            for (let i = 0; i < sizes.length; i++) {
                const sizeId = sizes[i];
                const sizeName = Object.keys(sizeMapping).find(
                    (key) => sizeMapping[key].id == sizeId
                );
                const sizeData = sizeMapping[sizeName];
                if (sizeData && quantities[i] > 0) {
                    const itemTotal = sizeData.price * quantities[i];
                    sizeTableRows += `
                        <tr>
                            <td class="py-1 px-2 border-r border-gray-600 text-left">Size</td>
                            <td class="py-1 px-2 border-r border-gray-600 text-left">${sizeName.toUpperCase()}</td>
                            <td class="py-1 px-2 border-r border-gray-600 text-right">₱${sizeData.price.toFixed(
                                2
                            )}</td>
                            <td class="py-1 px-2 border-r border-gray-600 text-center">${
                                quantities[i]
                            }</td>
                            <td class="py-1 px-2 text-right">₱${itemTotal.toFixed(
                                2
                            )}</td>
                        </tr>`;
                }
            }
            if (!sizeTableRows) {
                sizeTableRows = `<tr><td colspan="5" class="py-1 px-2 text-center italic">No sizes selected or quantity is zero.</td></tr>`;
            }

            totalAmount = 0;
            for (let i = 0; i < sizes.length; i++) {
                const sizeId = sizes[i];
                const sizeName = Object.keys(sizeMapping).find(
                    (key) => sizeMapping[key].id == sizeId
                );
                const sizePrice = sizeMapping[sizeName].price;
                const itemTotal = sizePrice * quantities[i];
                totalAmount += itemTotal;
            }
            totalAmount += collection.collectPrice;

            const breakdownHtml = `
                <div class="text-white w-full flex flex-col">
                    <div class="text-right font-semibold mb-2 flex-shrink-0">
                        Collection: ${collection.collectName}
                    </div>
                    <table class="w-full text-sm border-collapse border border-gray-600 mb-4">
                        <thead class="bg-gray-700">
                            <tr>
                                <th class="py-1 px-2 border-r border-gray-600 text-left">Item</th>
                                <th class="py-1 px-2 border-r border-gray-600 text-left">Details</th>
                                <th class="py-1 px-2 border-r border-gray-600 text-right">Price</th>
                                <th class="py-1 px-2 border-r border-gray-600 text-center">Quantity</th>
                                <th class="py-1 px-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sizeTableRows}
                            <tr>
                                <td class="py-1 px-2 border-r border-gray-600 text-left">Design</td>
                                <td class="py-1 px-2 border-r border-gray-600 text-left">${
                                    collection.collectName
                                }</td>
                                <td class="py-1 px-2 border-r border-gray-600 text-right">₱${collection.collectPrice.toFixed(
                                    2
                                )}</td>
                                <td class="py-1 px-2 border-r border-gray-600 text-center">1</td>
                                <td class="py-1 px-2 text-right">₱${collection.collectPrice.toFixed(
                                    2
                                )}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="text-right font-semibold mb-4 flex-shrink-0">
                        Total Amount: ₱${totalAmount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </div>
                </div>
            `;

            // Show breakdown modal
            Swal.fire({
                title: "Order Summary",
                html: breakdownHtml,
                icon: "info",
                allowEscapeKey: false,
                allowOutsideClick: false,
                showCloseButton: true,
                confirmButtonText: "Confirm Order",
                cancelButtonText: "Cancel",
                buttonsStyling: false,
                customClass: {
                    popup: "bg-primary text-white shadow-lg rounded-lg w-auto max-w-lg",
                    confirmButton:
                        "bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 transition mr-2",
                    closeButton:
                        "transition-transform transform hover:text-danger",
                    title: "text-white font-bold",
                    htmlContainer: "text-left",
                },
                background: "#171c2f",
                color: "#fff",
                width: "600px",
            }).then((summaryResult) => {
                if (summaryResult.isConfirmed) {
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
                    // Call the function to submit the order
                    submitCollectionOrder(collectID, sizes, quantities);
                }
            });
        }
    });
}

async function submitCollectionOrder(collectID, sizes, quantities) {
    try {
        const response = await fetch("/collection-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    .getAttribute("content"),
            },
            body: JSON.stringify({
                collectID: collectID,
                sizes: sizes,
                quantities: quantities,
            }),
        });

        if (response.redirected) {
            window.location.href = response.url;
        } else {
            const result = await response.json();
            if (result.success) {
                window.location.href = `/chat?convoID=${result.convoID}`;
                Swal.close();
            } else {
                Swal.fire({
                    title: "Error",
                    text: result.message,
                    icon: "error",
                    confirmButtonText: "OK",
                    customClass: {
                        popup: "bg-primary text-white shadow-lg rounded-lg w-96",
                        title: "text-xl font-semibold mb-4",
                        content: "text-lg",
                        closeButton:
                            "transition-transform transform hover:text-danger",
                        confirmButton:
                            "bg-secondary text-white py-2 px-4 rounded hover:bg-highlight transition",
                    },
                }).then(() => {
                    Swal.close();
                });
            }
        }
    } catch (error) {
        Swal.fire({
            title: "Error",
            text: error.message || "An unexpected error occurred.",
            icon: "error",
            confirmButtonText: "OK",
            customClass: {
                popup: "bg-primary text-white shadow-lg rounded-lg w-96",
                title: "text-xl font-semibold mb-4",
                content: "text-lg",
                closeButton: "transition-transform transform hover:text-danger",
                confirmButton:
                    "bg-secondary text-white py-2 px-4 rounded hover:bg-highlight transition",
            },
        }).then(() => {
            Swal.close();
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const collectionItems = document.querySelectorAll(".collection-item");
    collectionItems.forEach((item) => {
        item.addEventListener("click", function () {
            const collection = JSON.parse(this.dataset.collection);
            handleSizeSelection(collection.collectID, collection);
        });
    });
});
