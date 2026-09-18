import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", function () {
    // console.log("DOM loaded for managefabrics.js");

    window.Livewire.on("showFabricModal", () => {
        console.log("showFabricModal event received");
        Swal.fire({
            title: "Add New Fabric",
            html: `
                <div class="mb-4">
                    <label for="fabricName" class="block text-white">Fabric Name</label>
                    <input type="text" id="fabricName" class="swal2-input" placeholder="Fabric Name">
                </div>
                <div class="mb-4">
                    <label for="fabricPrice" class="block text-white">Fabric Price</label>
                    <input type="number" id="fabricPrice" class="swal2-input" placeholder="0.00" step="0.01" min="0">
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
            preConfirm: () => {
                const fabricName = document.getElementById("fabricName").value;
                const fabricPrice =
                    document.getElementById("fabricPrice").value;

                if (!fabricName || !fabricPrice) {
                    Swal.showValidationMessage("Please fill in both fields");
                    return false;
                }

                if (fabricName.includes(".") || fabricPrice.includes(".")) {
                    Swal.showValidationMessage("Please use whole numbers");
                    return false;
                }

                return [fabricName, fabricPrice];
            },
        }).then((result) => {
            if (result.isConfirmed) {
                window.Livewire.emit(
                    "createFabric",
                    result.value[0],
                    result.value[1]
                );
                window.showAlert("Fabric Added!", "", "success");
            }
        });
    });

    window.Livewire.on("fabricUpdated", function () {
        window.showAlert(
            "Success!",
            "Fabric has been updated successfully",
            "success"
        );
    });

    // Function to show edit fabric modal
    window.showEditFabricModal = function (fabricId, fabricName, fabricPrice) {
        Swal.fire({
            title: "Edit Fabric",
            html: `
                <div class="mb-4">
                    <label for="editFabricName" class="block text-white">Fabric Name</label>
                    <input type="text" id="editFabricName" class="swal2-input" value="${fabricName}">
                </div>
                <div class="mb-4">
                    <label for="editFabricPrice" class="block text-white">Fabric Price</label>
                    <input type="number" id="editFabricPrice" class="swal2-input" value="${parseFloat(
                        fabricPrice
                    ).toFixed(2)}" step="0.01" min="0">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Update Fabric",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            focusConfirm: false,
            preConfirm: () => {
                const fabricName =
                    document.getElementById("editFabricName").value;
                const fabricPrice =
                    document.getElementById("editFabricPrice").value;

                // Validate inputs
                if (!fabricName) {
                    Swal.showValidationMessage("Please enter a fabric name");
                    return false;
                }

                if (
                    !fabricPrice ||
                    isNaN(parseFloat(fabricPrice)) ||
                    parseFloat(fabricPrice) < 0
                ) {
                    Swal.showValidationMessage("Please enter a valid price");
                    return false;
                }

                return { fabricName, fabricPrice };
            },
        }).then((result) => {
            if (result.isConfirmed) {
                // Send data to Livewire component
                window.Livewire.emit(
                    "updateFabric",
                    fabricId,
                    result.value.fabricName,
                    result.value.fabricPrice
                );
            }
        });
    };

    window.Livewire.on("confirmDeleteFabric", (fabricId, fabricName) => {
        Swal.fire({
            title: "Are you sure?",
            html: `<p class="text-white">You are about to delete the "${fabricName}" size. This action can be undone.</p>`,
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
                window.Livewire.emit("archiveFabric", fabricId);
                window.showAlert.fire(
                    "Archived!",
                    `${fabricName} has been archived.`,
                    "success"
                );
            }
        });
    });
});
