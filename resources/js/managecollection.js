import Swal from "sweetalert2";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Function to get Livewire component
const getLivewireComponent = () => {
    // First try to find the component by class and wire:id
    let component = document.querySelector(".containerCollections[wire\\:id]");
    if (!component) {
        // Fallback to any element with wire:id
        component = document.querySelector("[wire\\:id]");
    }
    if (!component) {
        console.error("No Livewire component found");
        return null;
    }
    return component.getAttribute("wire:id");
};

// Get initial component ID
// const livewireId = getLivewireComponent();

window.addEventListener("showCreateCollectionPopup", function () {
    Swal.fire({
        title: "<span style='color: #fff;'>Create Design</span>",
        html: `
            <input type="text" id="collectName" class="swal2-input" placeholder="Design Name" style="color: #fff; background-color: #2d3748; border: 1px solid #4a5568;">
            <input type="number" id="collectPrice" class="swal2-input" placeholder="Design Price" style="color: #fff; background-color: #2d3748; border: 1px solid #4a5568;">
            <input type="file" id="collectImage" class="swal2-input" style="color: #fff; background-color: #2d3748; border: 1px solid #4a5568;">
        `,
        showCancelButton: false,
        showCloseButton: true,
        confirmButtonText: '<i class="fa fa-save"></i>',
        customClass: {
            popup: "bg-primary",
            title: "text-highlight font-bold",
            confirmButton:
                "bg-green-600 hover:bg-green-800 border-2 transition",
            closeButton: "transition-transform transform hover:text-danger",
            validationMessage: "bg-secondary p-2 text-white",
        },
        preConfirm: () => {
            const collectName =
                Swal.getPopup().querySelector("#collectName").value;
            const collectPrice =
                Swal.getPopup().querySelector("#collectPrice").value;
            const collectImage =
                Swal.getPopup().querySelector("#collectImage").files[0];
            if (!collectName || !collectPrice || !collectImage) {
                Swal.showValidationMessage(`Please enter all fields`);
            }
            return {
                collectName: collectName,
                collectPrice: collectPrice,
                image: collectImage,
            };
        },
    }).then((result) => {
        if (result.isConfirmed) {
            console.log("Creating design with data:", result.value);

            // Create FormData to properly handle file upload
            const formData = new FormData();
            formData.append("collectName", result.value.collectName);
            formData.append("collectPrice", result.value.collectPrice);
            formData.append("image", result.value.image);

            // Use Livewire's uploadFileAndEmit method, but now use the cached livewireId
            const componentId = getLivewireComponent();
            if (!componentId) {
                Swal.fire({
                    title: "Error",
                    text: "Could not find Livewire component",
                    icon: "error",
                });
                return;
            }

            // Get the original filename before upload
            const originalFilename = result.value.image.name;

            Livewire.find(componentId).upload(
                "image",
                result.value.image,
                (uploadedFilename) => {
                    // After upload is complete, emit the createCollection event with data
                    Livewire.emit("createCollection", {
                        collectName: result.value.collectName,
                        collectPrice: result.value.collectPrice,
                        image: uploadedFilename,
                        originalFilename: originalFilename, // Pass the original filename
                    });
                },
                () => {
                    // Error handling
                    console.error("Upload failed");
                    Swal.fire({
                        title: "Error",
                        text: "Image upload failed",
                        icon: "error",
                    });
                }
            );
        }
    });
});

window.addEventListener("showEditCollectionPopup", function (event) {
    const { collectID, collectName, collectPrice, collectFilePath } =
        event.detail;
    Swal.fire({
        title: "<span style='color: #fff;'>Edit Design</span>",
        html: `
            <div style="margin-bottom: 1em;">
                <label for="collectName" style="display: block; color: #fff;">Design Name</label>
                <input type="text" id="collectName" class="swal2-input" placeholder="Design Name" value="${collectName}" style="color: #fff; background-color: #2d3748; border: 1px solid #4a5568;">
            </div>
            <div style="margin-bottom: 1em;">
                <label for="collectPrice" style="display: block; color: #fff;">Price</label>
                <input type="number" id="collectPrice" class="swal2-input" placeholder="Design Price" value="${collectPrice}" style="color: #fff; background-color: #2d3748; border: 1px solid #4a5568;">
            </div>
            <div style="margin-bottom: 1em;">
                <label for="collectImage" style="display: block; color: #fff;">Design Image (Optional)</label>
                <input type="file" id="collectImage" class="swal2-input" style="color: #fff; background-color: #2d3748; border: 1px solid #4a5568;">
                <p style="color: #a0aec0; font-size: 0.8rem;">Leave blank to keep current image</p>
            </div>
        `,
        showCancelButton: false,
        showCloseButton: true,
        confirmButtonText: '<i class="fa fa-save"></i>',
        customClass: {
            popup: "bg-primary",
            title: "text-highlight font-bold",
            confirmButton:
                "bg-green-500 hover:bg-green-700 border-2 transition",
            closeButton: "transition-transform transform hover:text-danger",
            validationMessage: "bg-secondary p-2 text-white",
        },
        preConfirm: () => {
            const collectName =
                Swal.getPopup().querySelector("#collectName").value;
            const collectPrice =
                Swal.getPopup().querySelector("#collectPrice").value;
            const collectImage =
                Swal.getPopup().querySelector("#collectImage").files[0];

            if (!collectName || !collectPrice) {
                Swal.showValidationMessage(`Please enter name and price`);
            }

            return {
                collectID: collectID,
                collectName: collectName,
                collectPrice: collectPrice,
                image: collectImage || null,
            };
        },
    }).then((result) => {
        if (result.isConfirmed) {
            console.log("Updating design with data:", result.value);

            if (result.value.image) {
                // If there's a new image, upload it first
                // Get the original filename before upload
                const originalFilename = result.value.image.name;

                const componentId = getLivewireComponent();
                if (!componentId) {
                    Swal.fire({
                        title: "Error",
                        text: "Could not find Livewire component",
                        icon: "error",
                    });
                    return;
                }
                Livewire.find(componentId).upload(
                    "image",
                    result.value.image,
                    (uploadedFilename) => {
                        // After upload is complete, emit the updateCollection event with data
                        Livewire.emit("updateCollection", {
                            collectID: result.value.collectID,
                            collectName: result.value.collectName,
                            collectPrice: result.value.collectPrice,
                            image: uploadedFilename,
                            originalFilename: originalFilename, // Pass the original filename
                        });

                        window.showAlert(
                            "Saved!",
                            "The design has been updated successfully.",
                            "success"
                        );
                    },
                    () => {
                        // Error handling
                        console.error("Upload failed");
                        Swal.fire({
                            title: "Error",
                            text: "Image upload failed",
                            icon: "error",
                        });
                    }
                );
            } else {
                // If no new image, just update the other data
                Livewire.emit("updateCollection", {
                    collectID: result.value.collectID,
                    collectName: result.value.collectName,
                    collectPrice: result.value.collectPrice,
                });

                window.showAlert(
                    "Saved!",
                    "The design has been updated successfully.",
                    "success"
                );
            }
        }
    });
});

window.addEventListener("showDeleteCollectionPopup", function (event) {
    const { collectID } = event.detail;
    Swal.fire({
        title: "Are you sure you want to delete?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        customClass: {
            popup: "bg-primary",
            title: "font-bold text-white",
            content: "text-white",
            confirmButton: "bg-green-500 hover:bg-green-700 transition",
            cancelButton: "bg-red-500 hover:bg-red-700 transition",
        },
    }).then((result) => {
        if (result.isConfirmed) {
            console.log("Deleting design with ID:", collectID);
            Livewire.emit("deleteCollection", collectID);
            window.showAlert(
                "Success!",
                "The design has been deleted.",
                "success"
            );
        }
    });
});
