import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", function () {
    // console.log("DOM loaded for managefabrics.js");

    window.Livewire.on("showTimeframeModal", () => {
        console.log("showTimeframeModal event received");
        Swal.fire({
            title: "Add New Timeframe",
            html: `
                <div class="mb-4">
                    <label for="timeframeName" class="block text-white">Delivery Timeframe</label>
                    <input type="text" id="timeframeName" class="swal2-input" placeholder="In Weeks">
                </div>
                <div class="mb-4">
                    <label for="timeframeCost" class="block text-white">Cost</label>
                    <input type="number" id="timeframeCost" class="swal2-input" placeholder="0.00" step="0.01" min="0">
                 </div>
                 <div class="mb-4">
                     <label for="timeframeMaxOrders" class="block text-white">Maximum Orders</label>
                     <input type="number" id="timeframeMaxOrders" class="swal2-input" placeholder="100" step="1" min="0">
                 </div>
            `,
            showCancelButton: false,
            showCloseButton: true,
            confirmButtonText: '<i class="fa-solid fa-plus"></i>',
            customClass: {
                popup: "bg-primary",
                title: "text-highlight font-bold",
                confirmButton: "bg-green-600 text-white hover:bg-green-800",
                closeButton: "transition-transform transform hover:text-danger",
                validationMessage: "bg-secondary p-2 text-white",
            },
            preConfirm: () => {
                const timeframeName =
                    document.getElementById("timeframeName").value;
                const timeframeCost =
                    document.getElementById("timeframeCost").value;
                const timeframeMaxOrders =
                    document.getElementById("timeframeMaxOrders").value;

                if (!timeframeName || !timeframeCost || !timeframeMaxOrders) {
                    Swal.showValidationMessage("Please fill in all fields");
                    return false;
                }

                if (
                    timeframeName.includes(".") ||
                    timeframeCost.includes(".")
                ) {
                    Swal.showValidationMessage("Please use whole numbers");
                    return false;
                }

                return [timeframeName, timeframeCost, timeframeMaxOrders];
            },
        }).then((result) => {
            if (result.isConfirmed) {
                Livewire.emit(
                    "addTimeframe",
                    result.value[0],
                    result.value[1],
                    result.value[2]
                );
                window.showAlert("Timeframe Added!", "", "success");
            }
        });
    });

    window.Livewire.on("timeframeUpdated", function () {
        window.showAlert(
            "Success!",
            "Timeframe has been updated successfully",
            "success"
        );
    });

    // Function to show edit timeframe modal
    window.showEditTimeframeModal = function (
        timeframeId,
        timeframeName,
        timeframeCost
    ) {
        Swal.fire({
            title: "Edit Timeframe",
            html: `
            <div class="mb-4">
                <label for="editTimeframeName" class="block text-white">Delivery Timeframe</label>
                <input type="text" id="editTimeframeName" class="swal2-input" value="${timeframeName}">
            </div>
            <div class="mb-4">
                <label for="editTimeframeCost" class="block text-white">Cost</label>
                <input type="number" id="editTimeframeCost" class="swal2-input" value="${parseFloat(
                    timeframeCost
                ).toFixed(2)}" step="0.01" min="0">
            </div>
            <div class="mb-4">
                <label for="editTimeframeMaxOrders" class="block text-white">Maximum Orders</label>
                <input type="number" id="editTimeframeMaxOrders" class="swal2-input" value="${timeframeCost}" step="1" min="0">
            </div>
        `,
            showCancelButton: true,
            confirmButtonText: "Update Timeframe",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            focusConfirm: false,
            preConfirm: () => {
                const timeframeName =
                    document.getElementById("editTimeframeName").value;
                const timeframeCost =
                    document.getElementById("editTimeframeCost").value;
                const timeframeMaxOrders = document.getElementById(
                    "editTimeframeMaxOrders"
                ).value;

                // Validate inputs
                if (!timeframeName) {
                    Swal.showValidationMessage("Please enter a timeframe name");
                    return false;
                }

                if (
                    !timeframeCost ||
                    isNaN(parseFloat(timeframeCost)) ||
                    parseFloat(timeframeCost) < 0
                ) {
                    Swal.showValidationMessage("Please enter a valid cost");
                    return false;
                }
                if (
                    !timeframeMaxOrders ||
                    isNaN(parseFloat(timeframeMaxOrders)) ||
                    parseFloat(timeframeMaxOrders) < 0
                ) {
                    Swal.showValidationMessage(
                        "Please enter a valid maximum orders"
                    );
                    return false;
                }

                return { timeframeName, timeframeCost, timeframeMaxOrders };
            },
        }).then((result) => {
            if (result.isConfirmed) {
                // Send data to Livewire component
                Livewire.emit(
                    "updateTimeframe",
                    timeframeId,
                    result.value.timeframeName,
                    result.value.timeframeCost,
                    result.value.timeframeMaxOrders
                );
            }
        });
    };

    window.livewire.on("confirmDeleteTimeframe", function (id, name) {
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
        }).then((result) => {
            if (result.isConfirmed) {
                // Call Livewire method to archive the record
                window.livewire.emit("archiveTimeframe", id);
            }
        });
    });

    window.Livewire.on("timeframeArchived", function () {
        window.showAlert(
            "Success!",
            "Timeframe has been archived successfully",
            "success"
        );
    });
});
