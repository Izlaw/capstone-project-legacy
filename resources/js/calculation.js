import Swal from "sweetalert2";
// Import the function to update the main UI total display
import { updateGrandTotalDisplay } from "./newcustomorder.js";
// Initialize the sizeMapping object
let sizeMapping = {};

// Initialize an array to store the selected sizes and quantities
let selectedSizes = [];

// Size dimensions mapping
const sizeDimensions = {
    "4XS": "W=15 x L=18",
    "3XS": "W=16 x L=19",
    "2XS": "W=17 x L=25",
    XS: "W=19 x L=26",
    S: "W=20 x L=27",
    M: "W=21 x L=28",
    L: "W=22 x L=29",
    XL: "W=23 x L=30",
    XXL: "W=24 x L=31",
    XXXL: "W=25 x L=32",
    "4XL": "W=26 x L=33",
    "5XL": "W=27 x L=34",
    "6XL": "W=28 x L=35",
};

// Fetch sizes data from API
async function fetchSizes() {
    try {
        const response = await fetch("/api/sizes");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const sizes = await response.json();
        // console.log("Fetched sizes data:", sizes);

        // Populate the sizeMapping object with data from the API
        sizeMapping = sizes.reduce((acc, size) => {
            acc[`size_${size.sizeName.toUpperCase()}`] = {
                id: size.sizeID,
                price: parseFloat(size.sizePrice), // Convert price to a number
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
// Function to create a size and quantity row
function createSizeRow(sizes, selectedSize = "", selectedQuantity = 0) {
    const row = document.createElement("tr");

    const sizeCell = document.createElement("td");
    sizeCell.className = "py-2 px-4 border-b border-gray-200";
    const sizeDropdown = document.createElement("select");
    sizeDropdown.name = "sizes[]";
    sizeDropdown.className =
        "sizeDropdown border rounded-md p-2 w-full text-black bg-white hover:bg-gray-300 transition-colors duration-300 focus:outline-none";

    // Create the "Select Size" option
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    placeholderOption.textContent = "Select Size"; // Placeholder text
    sizeDropdown.appendChild(placeholderOption);

    // Create options based on the fetched size data
    sizes.forEach((size) => {
        const option = document.createElement("option");
        const sizeName = size.sizeName.toUpperCase();
        option.value = sizeName; // Match the option value to the case used in the dropdown

        // Add dimensions to option text if available
        const dimensions = sizeDimensions[sizeName] || "";
        const displayText = dimensions
            ? `${sizeName} (${dimensions})`
            : `${sizeName}`;

        option.textContent = displayText;
        sizeDropdown.appendChild(option);
    });

    // Set the selected size if provided
    if (selectedSize) {
        sizeDropdown.value = selectedSize.toUpperCase();
    }

    sizeCell.appendChild(sizeDropdown);
    row.appendChild(sizeCell);

    const priceCell = document.createElement("td");
    priceCell.className = "py-2 px-4 border-b border-gray-200 price-column";
    priceCell.style.width = "200px"; // Set a fixed width for the price column
    priceCell.textContent = selectedSize
        ? `₱${sizeMapping[`size_${selectedSize.toUpperCase()}`].price}`
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
        "quantityInput text-center border rounded-md w-3/4 text-black bg-white hover:bg-gray-300 transition-colors duration-300"; // Slightly decrease the width
    quantityCell.appendChild(quantityInput);
    row.appendChild(quantityCell);

    // Create delete button
    const deleteCell = document.createElement("td");
    deleteCell.className = "py-2 px-4 border-b border-gray-200";
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className =
        "bg-red-500 text-white py-1 px-2 rounded hover:bg-red-700 transition";
    deleteButton.innerHTML = '<i class="bi bi-x-lg"></i>';
    deleteButton.addEventListener("click", () => {
        row.remove();
        updateDropdownOptions(); // Update dropdown options after removing a row
        updateTotalAmountDisplay(); // Update total amount display after removing a row
    });
    deleteCell.appendChild(deleteButton);
    row.appendChild(deleteCell);
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

    sizeDropdown.addEventListener("change", () => {
        const selectedSize = sizeDropdown.value.toUpperCase();
        if (sizeMapping[`size_${selectedSize}`]) {
            priceCell.textContent = `₱${
                sizeMapping[`size_${selectedSize}`].price
            }`;
        }
        updateDropdownOptions();
        updateTotalAmountDisplay(); // Update total amount display after changing a size
    });

    quantityInput.addEventListener("input", () => {
        updateTotalAmountDisplay(); // Update total amount display after changing quantity
    });

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

        // Remove all options except the current value and the placeholder
        options.forEach((option) => {
            if (option.value !== "" && option.value !== currentValue) {
                option.remove();
            }
        });

        // Add back the available options
        Object.keys(sizeMapping).forEach((key) => {
            const sizeName = key.replace("size_", "").toUpperCase();
            if (
                !selectedSizes.includes(sizeName) ||
                sizeName === currentValue
            ) {
                // Check if the option already exists before adding
                if (
                    !Array.from(dropdown.options).some(
                        (option) => option.value === sizeName
                    )
                ) {
                    const option = document.createElement("option");
                    option.value = sizeName;

                    // Add dimensions to option text if available
                    const dimensions = sizeDimensions[sizeName] || "";
                    const displayText = dimensions
                        ? `${sizeName} (${dimensions})`
                        : `${sizeName}`;

                    option.textContent = displayText;
                    dropdown.appendChild(option);
                }
            }
        });
    });
}

// Function to calculate total price based on the selected sizes and quantities
function calculateTotal() {
    let totalAmount = 0;

    // Get all size and quantity inputs
    const sizeInputs = document.querySelectorAll(".sizeDropdown");
    const quantityInputs = document.querySelectorAll(".quantityInput");

    selectedSizes = []; // Reset the selected sizes array

    sizeInputs.forEach((sizeInput, index) => {
        const selectedSize = sizeInput.value;
        const quantity = parseInt(quantityInputs[index].value) || 0; // Get quantity or default to 0

        // Check if the selected size exists in the sizeMapping
        if (sizeMapping[`size_${selectedSize.toUpperCase()}`]) {
            const sizeDetails =
                sizeMapping[`size_${selectedSize.toUpperCase()}`];
            totalAmount += sizeDetails.price * quantity; // Calculate total amount

            // Store the selected size and quantity
            selectedSizes.push({ size: selectedSize, quantity: quantity });
        }
    });

    return totalAmount;
}

// Function to update the total amount display
function updateTotalAmountDisplay() {
    // Calculate the size-based total for the modal display
    const totalAmount = calculateTotal();
    const totalAmountDisplayElement =
        document.getElementById("totalAmountDisplay");
    if (totalAmountDisplayElement) {
        totalAmountDisplayElement.innerText = `Total Amount: ₱${totalAmount.toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}`;
    }

    // Remove the direct update to the main #totalAmount element
    // document.getElementById(
    //     "totalAmount"
    // ).innerText = `₱${totalAmount.toLocaleString("en-US", {
    //     minimumFractionDigits: 2,
    //     maximumFractionDigits: 2,
    // })}`;

    // Instead, trigger the update of the grand total in the main UI
    updateGrandTotalDisplay();
}

// Function to update the hover window with selected sizes
function updateHoverWindow() {
    const hoverWindow = document.getElementById("hoverWindow");
    const selectedSizesList = document.getElementById("selectedSizesList");

    // Ensure both elements exist before proceeding
    if (!hoverWindow || !selectedSizesList) {
        return;
    }

    // Clear the current list
    selectedSizesList.innerHTML = "";

    // Add the selected sizes to the list
    selectedSizes.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${item.size}: ${item.quantity}`;
        selectedSizesList.appendChild(listItem);
    });

    // Show the hover window if there are selected sizes
    if (selectedSizes.length > 0) {
        hoverWindow.classList.remove("hidden");
    } else {
        hoverWindow.classList.add("hidden");
    }
}

// Function to open the SweetAlert2 modal
async function openSizeModal() {
    const sizes = await fetchSizes();

    const modalContent = document.createElement("div");
    modalContent.id = "modalSizeInputsContainer";

    // Create the table element
    const table = document.createElement("table");
    table.className = "min-w-full bg-primary";

    // Create the table header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    const sizeHeader = document.createElement("th");
    sizeHeader.className =
        "py-2 px-4 bg-accent text-center text-xs font-semibold text-white uppercase tracking-wider";
    sizeHeader.textContent = "Size";
    headerRow.appendChild(sizeHeader);

    const priceHeader = document.createElement("th");
    priceHeader.className =
        "py-2 px-4 bg-accent text-center text-xs font-semibold text-white uppercase tracking-wider price-column";
    priceHeader.style.width = "200px"; // Set a fixed width for the price column
    priceHeader.textContent = "Price";
    headerRow.appendChild(priceHeader);

    const quantityHeader = document.createElement("th");
    quantityHeader.className =
        "py-2 px-4 bg-accent text-center text-xs font-semibold text-white uppercase tracking-wider";
    quantityHeader.textContent = "Quantity";
    headerRow.appendChild(quantityHeader);

    const deleteHeader = document.createElement("th");
    deleteHeader.className =
        "py-2 px-4 bg-accent text-center text-xs font-semibold text-white uppercase tracking-wider";
    deleteHeader.textContent = "Action";
    headerRow.appendChild(deleteHeader);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create the table body
    const tbody = document.createElement("tbody");
    tbody.id = "sizeTableBody";

    // Create size rows based on the selected sizes (use module-scoped selectedSizes)
    if (Array.isArray(selectedSizes) && selectedSizes.length > 0) {
        // Check the module-scoped variable
        selectedSizes.forEach((selected) => {
            // Iterate over module-scoped variable
            const sizeRow = createSizeRow(
                sizes,
                selected.size,
                selected.quantity
            );
            tbody.appendChild(sizeRow);
        });
    }

    // Create the initial size row if no sizes are selected
    if (!selectedSizes || selectedSizes.length === 0) {
        // Check the module-scoped variable
        const initialSizeRow = createSizeRow(sizes);
        tbody.appendChild(initialSizeRow);
    }

    table.appendChild(tbody);
    modalContent.appendChild(table);

    // Add total amount display
    const totalAmountDisplay = document.createElement("div");
    totalAmountDisplay.id = "totalAmountDisplay";
    totalAmountDisplay.className = "text-right font-semibold mt-4";
    totalAmountDisplay.innerText = `Total Amount: ₱${calculateTotal().toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
    modalContent.appendChild(totalAmountDisplay);

    // Add button to add more size rows
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
        const newSizeRow = createSizeRow(sizes);
        tbody.appendChild(newSizeRow); // Append new size row to the table body
        updateDropdownOptions(); // Update dropdown options after adding a new row
        updateHoverWindow(); // Update hover window after adding a new row
        updateTotalAmountDisplay(); // Update total amount display after adding a new row
    });

    modalContent.appendChild(addSizeButton);

    Swal.fire({
        title: "Size Selection",
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
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: "Save",
        allowOutsideClick: false,
        preConfirm: () => {
            const sizeInputs = document.querySelectorAll(".sizeDropdown");
            let sizeSelected = false;

            sizeInputs.forEach((sizeInput) => {
                if (sizeInput.value !== "") {
                    sizeSelected = true;
                }
            });

            if (!sizeSelected) {
                Swal.showValidationMessage("Please select a size.");
                return false; // Prevent modal from closing
            }
            Swal.resetValidationMessage();
            calculateTotal();
            updateHoverWindow();
            updateTotalAmountDisplay(); // Update total amount display when saving the modal
        },
        width: "800px", // Set the width of the SweetAlert2 modal
        allowOutsideClick: false, // Prevent closing the modal when clicking outside
    });

    updateDropdownOptions(); // Update dropdown options when the modal is opened
}

// Function to handle the initial design upload
async function handleDesignUpload() {
    return Swal.fire({
        title: "Upload your design",
        input: "file",
        inputAttributes: {
            accept: "image/*",
            "aria-label": "Upload your design",
        },
        showCancelButton: true,
        confirmButtonText: "Next",
        cancelButtonText: "Cancel",
        customClass: {
            popup: "bg-primary text-white shadow-lg rounded-lg w-96",
            title: "text-xl font-semibold mb-4",
            content: "text-lg",
            closeButton: "transition-transform transform hover:text-danger",
            confirmButton:
                "bg-accent text-white py-2 px-4 rounded hover:bg-highlight transition",
            cancelButton:
                "bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition",
        },
        preConfirm: (file) => {
            if (!file) {
                Swal.showValidationMessage("Please select an image to upload");
                return false;
            }

            return file;
        },
    });
}

// Function to handle the upload design and send message process
async function handleUploadDesignAndSendMessage() {
    const designUploadResult = await handleDesignUpload();

    if (designUploadResult.isConfirmed) {
        const file = designUploadResult.value;

        const sizeSelectionResult = await handleSizeSelection();

        if (sizeSelectionResult.isConfirmed) {
            const { sizes, quantities } = sizeSelectionResult.value;

            const formData = new FormData();
            formData.append("image", file);
            formData.append("message", "Hi! I have an existing design");
            formData.append("sizes", JSON.stringify(sizes));
            formData.append("quantities", JSON.stringify(quantities));

            return fetch("/upload-design-and-send-message", {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    if (!data.success) {
                        throw new Error(data.message);
                    }
                    return data;
                })
                .catch((error) => {
                    Swal.showValidationMessage(`Upload failed: ${error}`);
                });
        }
    }
}

// Event listeners for modal button
document.addEventListener("DOMContentLoaded", function () {
    // Add event listener to the "Open Size Modal" button
    const openSizeModalButton = document.getElementById("openSizeModalButton");
    if (openSizeModalButton) {
        openSizeModalButton.addEventListener("click", openSizeModal);

        // Show hover window on hover
        openSizeModalButton.addEventListener("mouseenter", () => {
            const hoverWindow = document.getElementById("hoverWindow");
            if (hoverWindow) {
                hoverWindow.classList.remove("hidden");
            }
        });

        // Hide hover window when not hovering
        openSizeModalButton.addEventListener("mouseleave", () => {
            const hoverWindow = document.getElementById("hoverWindow");
            if (hoverWindow) {
                hoverWindow.classList.add("hidden");
            }
        });
    }

    // Update hover window on page load
    updateHoverWindow();
});

// Export functions for use in other files
export {
    fetchSizes,
    createSizeRow,
    handleUploadDesignAndSendMessage,
    calculateTotal,
    sizeMapping,
    selectedSizes,
    sizeDimensions, // Export sizeDimensions object
    openSizeModal, // Export openSizeModal function
};
