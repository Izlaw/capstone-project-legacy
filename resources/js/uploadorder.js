import Swal from "sweetalert2";
import { currencySymbol } from "./newcustomorder.js";
import { sizeDimensions } from "./calculation.js";

// Initialize the sizeMapping object
let sizeMapping = {};
// Global variable to store selected fabric
let selectedFabricType = null;

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
                return `<option value="${sizeName}">${displayText}</option>`;
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
        "quantityInput text-center border rounded-md w-3/4 text-black bg-white hover:bg-gray-300 transition-colors duration-300 focus:outline-none";
    quantityCell.appendChild(quantityInput);
    row.appendChild(quantityCell);

    const deleteCell = document.createElement("td");
    deleteCell.className = "py-2 px-4 border-b border-gray-200";
    deleteCell.innerHTML = `<button type="button" class="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-700 transition"><i class="bi bi-x-lg"></i></button>`;
    const deleteButton = deleteCell.querySelector("button");
    deleteButton.addEventListener("click", () => {
        row.remove();
        updateDropdownOptions();
        updateTotalAmountDisplay();
    });
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
            this.value = this.value.replace(/\\./g, ""); // Remove the dot
            setTimeout(() => {
                Swal.closeValidationMessage();
            }, 2000);
        }
        updateTotalAmountDisplay();
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
                    const dimensions = sizeDimensions[sizeName] || "";
                    const displayText = dimensions
                        ? `${sizeName} (${dimensions})`
                        : sizeName;
                    option.textContent = displayText;
                    option.dataset.id = sizeMapping[sizeName].id;
                    dropdown.appendChild(option);
                }
            }
        });
    });
}

// Function to calculate total price based on the selected sizes and quantities
// Function to calculate total price based on the selected sizes and quantities
function calculateTotal() {
    let totalAmount = 0;
    const sizeDropdowns = document.querySelectorAll(".sizeDropdown");
    const quantityInputs = document.querySelectorAll(".quantityInput");

    // Calculate total using the new formula: (sizeQuantity * sizePrice) + (sizeQuantity * fabricPrice)
    sizeDropdowns.forEach((dropdown, index) => {
        const selectedSize = dropdown.value;
        const quantity = parseInt(quantityInputs[index].value) || 0;

        if (sizeMapping[selectedSize]) {
            const sizePrice = sizeMapping[selectedSize].price;

            // Add size price component: (sizeQuantity * sizePrice)
            totalAmount += quantity * sizePrice;

            // Add fabric price component if a fabric is selected: (sizeQuantity * fabricPrice)
            if (selectedFabricType) {
                const fabricPrice =
                    parseFloat(selectedFabricType.fabricPrice) || 0;
                totalAmount += quantity * fabricPrice;
            }
        }
    });

    return parseFloat(totalAmount.toFixed(2));
}

// Function to update the total amount display
function updateTotalAmountDisplay() {
    const totalAmount = calculateTotal();
    document.getElementById(
        "totalAmountDisplay"
    ).innerText = `Total Amount: ${currencySymbol}${totalAmount.toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
}

// Function to handle the size selection process
async function handleSizeSelection() {
    let fabricTypeSelect;
    console.log("Fetching fabric options...");
    const fabricResponse = await fetch("/api/fabric?is_custom=false");
    if (!fabricResponse.ok) throw new Error("Network response was not ok");
    const fabrics = await fabricResponse.json();
    console.log("Fetched fabrics:", fabrics);

    const sizes = await fetchSizes(); // Fetch sizes here
    const modalContent = document.createElement("div");
    modalContent.id = "modalSizeInputsContainer";
    modalContent.className = "flex flex-col";

    // File Upload Input
    const fileUploadDiv = document.createElement("div");
    fileUploadDiv.className = "mb-4 text-black";
    fileUploadDiv.innerHTML = `
        <label for="design_upload" class="block font-medium text-white">Design Upload</label>
        <input type="file" id="design_upload" name="design_upload" accept="image/*" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md p-2 bg-accent text-white">
    `;
    modalContent.appendChild(fileUploadDiv);

    // Fabric Type Selection
    const fabricTypeDiv = document.createElement("div");
    fabricTypeDiv.className = "mb-4";
    let fabricOptionsHtml = `<option value="" disabled selected>Select Fabric</option>`;
    fabrics
        .filter((fabric) => fabric.is_custom != 1)
        .forEach((fabric) => {
            fabricOptionsHtml += `<option value="${fabric.fabricID}">${fabric.fabricName} (${currencySymbol}${fabric.fabricPrice})</option>`;
        });
    fabricTypeDiv.innerHTML = `
        <label for="fabric_type" class="block font-medium text-white">Fabric Type</label>
        <select id="fabric_type" name="fabric_type" class="mt-1 block w-full pl-3 pr-10 py-2 text-black border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md">
            ${fabricOptionsHtml}
        </select>
        <input type="text" id="custom_fabric_type" name="custom_fabric_type" class="mt-1 block w-full pl-3 pr-10 py-2 text-black border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md hidden" placeholder="Enter custom fabric">
    `;
    modalContent.appendChild(fabricTypeDiv);

    const sizeSelectionDiv = document.createElement("div");
    sizeSelectionDiv.className = "mb-4 text-black";
    sizeSelectionDiv.innerHTML = `
        <label for="sizes" class="block font-medium text-white">Size Selection</label>
    `;
    modalContent.appendChild(sizeSelectionDiv);

    const table = document.createElement("table");
    table.className = "min-w-full bg-primary border-collapse mb-4";
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
    modalContent.appendChild(table);
    const totalAmountDisplay = document.createElement("div");
    totalAmountDisplay.id = "totalAmountDisplay";
    totalAmountDisplay.className = "text-right font-semibold mt-4";
    totalAmountDisplay.innerText = `Total Amount: ₱${calculateTotal().toLocaleString(
        "en-US",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )}`;
    modalContent.insertBefore(sizeSelectionDiv, table);
    modalContent.appendChild(totalAmountDisplay);
    totalAmountDisplay.innerText = `Total Amount: ₱0.00`;
    const tbody = table.querySelector("#sizeTableBody");
    tbody.appendChild(createSizeRow(sizes));

    // Add Size Button
    const addSizeButtonDiv = document.createElement("div");
    // addSizeButtonDiv.className = "mb-4 text-black";
    addSizeButtonDiv.innerHTML = `
        <button type="button" id="addSizeButton" class="bg-secondary text-white py-2 px-4 rounded hover:bg-highlight transition mt-2"><i class="bi bi-plus-lg"></i></button>
    `;
    modalContent.appendChild(addSizeButtonDiv);

    const addSizeButton = modalContent.querySelector("#addSizeButton");
    addSizeButton.addEventListener("click", () => {
        tbody.appendChild(createSizeRow(sizes));
        updateDropdownOptions();
        updateTotalAmountDisplay();
    });

    // Reset selected fabric type
    selectedFabricType = null;

    fabricTypeSelect = fabricTypeDiv.querySelector("#fabric_type");
    const customFabricTypeInput = fabricTypeDiv.querySelector(
        "#custom_fabric_type"
    );
    fabricTypeSelect.addEventListener("change", function () {
        if (this.value == 1) {
            customFabricTypeInput.style.display = "block";
        } else {
            customFabricTypeInput.style.display = "none";
        }

        //Find the selected fabric object
        const selectedFabricId = this.value;
        selectedFabricType = fabrics.find(
            (fabric) => fabric.fabricID == selectedFabricId
        );

        updateTotalAmountDisplay();
    });

    // Initialize the visibility of the custom fabric input
    if (fabricTypeSelect.value === "custom") {
        customFabricTypeInput.style.display = "block";
    } else {
        customFabricTypeInput.style.display = "none";
    }
    return Swal.fire({
        title: "Upload Order",
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
            const sizes = Array.from(sizeDropdowns).map(
                (dropdown) => dropdown.value || ""
            );
            const quantities = Array.from(quantityInputs).map(
                (input) => input.value || ""
            );
            let fabricType =
                fabrics.find(
                    (fabric) => fabric.fabricID == fabricTypeSelect.value
                ) || null;

            console.log("fabricType", fabricType);
            const customFabricType = customFabricTypeInput.value || "";
            const designUpload =
                document.getElementById("design_upload").files[0];

            if (!designUpload) {
                Swal.showValidationMessage("Please upload your design");
                return false;
            }

            // Check if the dropdown value itself is empty
            if (!fabricTypeSelect.value) {
                Swal.showValidationMessage("Please select a fabric type");
                return false;
            }

            if (
                sizes.some((size) => size === "") ||
                quantities.some((qty) => qty === "")
            ) {
                Swal.showValidationMessage(
                    "Please select sizes and quantities"
                );
                return false;
            }
            if (
                quantities.some((qty) => qty === "" || parseInt(qty, 10) <= 0)
            ) {
                Swal.showValidationMessage(
                    "Quantities must be positive numbers"
                );
                return false;
            }
            return {
                sizes,
                quantities,
                fabricType,
                customFabricType,
                designUpload,
            };
        },
        width: "800px",
    }).then((result) => (result.isConfirmed ? result.value : null));
}

// Function to handle the initial design upload
async function handleDesignUpload() {}

// Function to handle the upload design and send message process
async function handleUploadDesignAndSendMessage() {
    const sizeSelectionResult = await handleSizeSelection();
    if (sizeSelectionResult) {
        // Calculate total amount
        let totalAmount = calculateTotal();
        const {
            sizes,
            quantities,
            fabricType,
            customFabricType,
            designUpload,
        } = sizeSelectionResult;

        // Prepare selectedSizes for calculateGrandTotal
        const selectedSizes = sizes.map((size, index) => {
            const sizeName = size;
            const quantity = parseInt(quantities[index], 10) || 0;
            return { size: sizeName, quantity: quantity };
        });

        // Calculate total amount (already done by calculateTotal)
        // Calculate total quantity for the breakdown display
        let totalQuantity = 0;
        selectedSizes.forEach((item) => {
            totalQuantity += item.quantity;
        });

        // Construct order summary HTML
        let sizeTableRows = "";
        selectedSizes.forEach((item) => {
            const sizeKey = item.size;
            const sizeData = sizeMapping[sizeKey];
            if (sizeData && item.quantity > 0) {
                const itemTotal = sizeData.price * item.quantity;
                sizeTableRows += `
                    <tr>
                        <td class="py-1 px-2 border-r border-gray-600 text-left">Size</td>
                        <td class="py-1 px-2 border-r border-gray-600 text-left">${item.size.toUpperCase()}</td>
                        <td class="py-1 px-2 border-r border-gray-600 text-right">₱${sizeData.price.toFixed(
                            2
                        )}</td>
                        <td class="py-1 px-2 border-r border-gray-600 text-center">${
                            item.quantity
                        }</td>
                        <td class="py-1 px-2 text-right">₱${itemTotal.toFixed(
                            2
                        )}</td>
                    </tr>`;
            }
        });
        if (!sizeTableRows) {
            sizeTableRows = `<tr><td colspan="5" class="py-1 px-2 text-center italic">No sizes selected or quantity is zero.</td></tr>`;
        }

        const breakdownHtml = `
                    <div class="text-white w-full flex flex-col">
                        <div class="text-right font-semibold mb-2 flex-shrink-0">
                            Uploaded File: ${
                                designUpload
                                    ? designUpload.name
                                    : "No file selected"
                            }
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
                                    <td class="py-1 px-2 border-r border-gray-600 text-left">Fabric</td>
                                    <td class="py-1 px-2 border-r border-gray-600 text-left">${
                                        customFabricType
                                            ? customFabricType
                                            : fabricType
                                            ? fabricType.fabricName
                                            : "No Fabric Selected"
                                    }</td>
                                    <td class="py-1 px-2 border-r border-gray-600 text-right">₱${
                                        fabricType
                                            ? parseFloat(
                                                  fabricType.fabricPrice
                                              ).toFixed(2)
                                            : "0.00"
                                    }</td>
                                  <td class="py-1 px-2 border-r border-gray-600 text-center">${totalQuantity}</td>
                                  <td class="py-1 px-2 text-right">₱${
                                      fabricType
                                          ? (
                                                parseFloat(
                                                    fabricType.fabricPrice
                                                ) * totalQuantity
                                            ).toFixed(2)
                                          : "0.00"
                                  }</td>
                              </tr>
                            </tbody>
                        </table>
                        <div class="text-right font-semibold mb-4 flex-shrink-0">
                            Total Amount: ₱${totalAmount.toLocaleString(
                                "en-US",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
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
                closeButton: "transition-transform transform hover:text-danger",
                title: "text-white font-bold",
                htmlContainer: "text-left",
            },
            background: "#171c2f",
            color: "#fff",
            width: "600px",
        }).then((result) => {
            if (result.isConfirmed) {
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
                // If user confirms the breakdown, proceed with the original submission logic
                const formData = new FormData();
                formData.append("image", designUpload);
                formData.append("upName", designUpload.name); // Set upName as the file name
                formData.append("message", "Hi! I have an existing design");
                formData.append(
                    "fabric_id",
                    fabricType ? fabricType.fabricID : null
                );
                formData.append(
                    "fabric_name",
                    fabricType ? fabricType.fabricName : null
                );
                formData.append("custom_fabric_name", customFabricType); // This matches the validation in the controller
                // Redundant block removed - custom_fabric_name is already appended on line 522
                sizes.forEach((size, index) => {
                    formData.append(`sizes[${index}]`, size);
                });
                quantities.forEach((quantity, index) => {
                    formData.append(`quantities[${index}]`, quantity);
                });
                fetch("/upload-design-and-send-message", {
                    method: "POST",
                    headers: {
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute("content"),
                    },
                    body: formData,
                })
                    .then((response) => {
                        if (!response.ok)
                            throw new Error("Network response was not ok");
                        return response.json();
                    })
                    .then((data) => {
                        if (data.success) {
                            window.location.href = data.redirectUrl;
                            Swal.close();
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Upload failed",
                                text: data.message,
                            });
                        }
                    })
                    .catch((error) => {
                        Swal.fire({
                            icon: "error",
                            title: "Upload failed",
                            text: error.message,
                        });
                        Swal.close();
                    });
            }
        });
    }
}
export { fetchSizes, createSizeRow, handleUploadDesignAndSendMessage };
