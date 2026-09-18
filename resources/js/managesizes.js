import Swal from "sweetalert2";
import "./swalpopup";

document.addEventListener("DOMContentLoaded", function () {
    // Initialize event listeners
    initSizeManagement();

    // Listen for Livewire events
    window.livewire.on("sizeAdded", function () {
        showAlert("Success!", "Size has been added successfully", "success");
    });

    window.livewire.on("sizeUpdated", function () {
        showAlert("Success!", "Size has been updated successfully", "success");
    });

    window.livewire.on("sizeDeleted", function () {
        showAlert("Deleted!", "Size has been deleted", "success");
    });

    // Add listener for confirmDelete event
    window.livewire.on("confirmDeleteSize", function (id, name) {
        Swal.fire({
            title: "Are you sure?",
            html: `<p class="text-white">You are about to delete the "${name}" size. This action can be undone.</p>`,
            icon: "warning",
            customClass: {
                popup: "bg-primary",
                title: "font-bold text-white",
                confirmButton:
                    "bg-green-600 hover:bg-green-800 border-2 transition",
                closeButton: "transition-transform transform hover:text-danger",
                icon: "text-white",
            },
            showCancelButton: false,
            showCloseButton: true,
            confirmButtonText: "Yes",
        }).then((result) => {
            if (result.isConfirmed) {
                // Call Livewire method to archive the record
                window.livewire.emit("deleteSize", id);
            }
        });
    });

    // For error notifications (used in showErrors event)
    window.livewire.on("showErrors", function (errors) {
        let errorMessage = "";
        for (const key in errors) {
            errorMessage += `<p>${errors[key]}</p>`;
        }

        Swal.fire({
            title: "Error!",
            html: errorMessage,
            icon: "error",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            iconColor: "#EF4444",
            customClass: {
                popup: "bg-white rounded-lg shadow-md border-l-4 border-red-500 p-4",
                title: "text-red-600 font-bold text-base mb-1",
                htmlContainer: "text-gray-600 text-sm",
                timerProgressBar: "bg-red-500",
            },
        });
    });

    window.livewire.on("showErrors", function (errors) {
        let errorMessage = "";
        for (const key in errors) {
            errorMessage += `<p>${errors[key]}</p>`;
        }

        Swal.fire({
            title: "Error!",
            html: errorMessage,
            icon: "error",
            confirmButtonColor: "#d33",
        });
    });
});

function initSizeManagement() {
    // Button to show the add size modal
    document
        .getElementById("showAddSizeButton")
        .addEventListener("click", function () {
            showAddSizeModal();
        });
}

function showAddSizeModal() {
    Swal.fire({
        title: "Add New Size",
        html: `
            <div class="mb-4">
                <label for="sizeName" class="block text-white">Size Name</label>
                <input type="text" id="sizeName" class="swal2-input" placeholder="e.g. Small, Medium, Large">
            </div>
            <div class="mb-4">
                <label for="sizePrice" class="block text-white">Price</label>
                <input type="number" id="sizePrice" class="swal2-input" placeholder="0.00" step="0.01" min="0">
            </div>
        `,
        showCancelButton: false,
        showCloseButton: true,
        confirmButtonText: '<i class="fa-solid fa-plus"></i>',
        customClass: {
            popup: "bg-primary",
            title: "text-highlight font-bold",
            confirmButton: "bg-green-500 text-white hover:bg-green-700",
            closeButton: "transition-transform transform hover:text-danger",
            validationMessage: "bg-secondary p-2 text-white",
        },
        didOpen: () => {
            // Add custom styling to the modal if needed
            const modal = Swal.getPopup();
            modal.querySelector("#sizeName").focus();
        },
        preConfirm: () => {
            const sizeName = Swal.getPopup().querySelector("#sizeName").value;
            const sizePrice = Swal.getPopup().querySelector("#sizePrice").value;

            // Validate inputs
            if (!sizeName) {
                Swal.showValidationMessage("Please enter a size name");
                return false;
            }

            if (
                !sizePrice ||
                isNaN(parseFloat(sizePrice)) ||
                parseFloat(sizePrice) < 0
            ) {
                Swal.showValidationMessage("Please enter a valid price");
                return false;
            }

            return { sizeName, sizePrice };
        },
    }).then((result) => {
        if (result.isConfirmed) {
            // Send data to Livewire component
            window.livewire.emit(
                "addSize",
                result.value.sizeName,
                result.value.sizePrice
            );
        }
    });
}

// Function to show edit size modal
function showEditSizeModal(sizeId, sizeName, currentPrice) {
    Swal.fire({
        title: "Edit Size",
        html: `
            <div class="mb-4">
                <label for="editSizeName" class="block text-sm font-medium text-gray-700 text-left mb-1">Size Name</label>
                <input type="text" id="editSizeName" class="swal2-input w-full" value="${sizeName}">
            </div>
            <div class="mb-4">
                <label for="editSizePrice" class="block text-sm font-medium text-gray-700 text-left mb-1">Price</label>
                <input type="number" id="editSizePrice" class="swal2-input w-full" value="${currentPrice}" step="0.01" min="0">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Update Size",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        focusConfirm: false,
        didOpen: () => {
            const modal = Swal.getPopup();
            modal.querySelector("#editSizeName").focus();
        },
        preConfirm: () => {
            const sizeName =
                Swal.getPopup().querySelector("#editSizeName").value;
            const sizePrice =
                Swal.getPopup().querySelector("#editSizePrice").value;

            // Validate inputs
            if (!sizeName) {
                Swal.showValidationMessage("Please enter a size name");
                return false;
            }

            if (
                !sizePrice ||
                isNaN(parseFloat(sizePrice)) ||
                parseFloat(sizePrice) < 0
            ) {
                Swal.showValidationMessage("Please enter a valid price");
                return false;
            }

            return { sizeName, sizePrice };
        },
    }).then((result) => {
        if (result.isConfirmed) {
            // Send data to Livewire component
            window.livewire.emit(
                "updateSizeDetails",
                sizeId,
                result.value.sizeName,
                result.value.sizePrice
            );
        }
    });
}
