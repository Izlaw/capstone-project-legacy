import tippy from "tippy.js";
import Swal from "sweetalert2";
import "./swalpopup.js";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";
window.OrbitControls = OrbitControls;
import iro from "@jaames/iro";
window.iro = iro;
import { newcustomorder, updateGrandTotalDisplay } from "./newcustomorder.js"; // Import update function
import { selectedSizes } from "./calculation.js";
import "./fabrictype";
window.selectedSizes = window.selectedSizes || [];

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 512;

let scene, camera, renderer, controls, selectedModel;
let isSpinning = false;
let isRightMouseButton = false;
let previousMousePosition = { x: 0, y: 0 };

let selectedParts = {
    sleeves: false,
    front: false,
    back: false,
    collar: false,
};

let sleevesMesh, frontMesh, backMesh, collarMesh;
let textMesh = null;
let loadedFont = null;
let textDecals = [];
let editingDecal = null;

const fontLoader = new FontLoader();
fontLoader.load(
    "/fonts/helvetiker_regular.typeface.json",
    (font) => {
        loadedFont = font;
    },
    undefined,
    (err) => {}
);

function activateTextDecalPlacement(text, fontSize, textColor) {
    const decalCanvas = document.createElement("canvas");
    const dctx = decalCanvas.getContext("2d");
    decalCanvas.width = 512;
    decalCanvas.height = 256;
    dctx.clearRect(0, 0, decalCanvas.width, decalCanvas.height);
    dctx.font = `${fontSize}px Arial`;
    dctx.textAlign = "center";
    dctx.textBaseline = "middle";
    dctx.fillStyle = textColor;
    dctx.fillText(text, decalCanvas.width / 2, decalCanvas.height / 2);
    const decalTexture = new THREE.CanvasTexture(decalCanvas);
    decalTexture.needsUpdate = true;
    decalTexture.encoding = THREE.sRGBEncoding;
    const decalMaterial = new THREE.MeshBasicMaterial({
        map: decalTexture,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
    });
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onDecalClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1 + 0.05;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
            [sleevesMesh, frontMesh, backMesh],
            true
        );
        if (intersects.length > 0) {
            const intersect = intersects[0];
            const position = intersect.point.clone();
            const intersectedMesh = intersect.object;
            const normal = intersect.face.normal.clone();
            normal.transformDirection(intersectedMesh.matrixWorld).normalize();

            // Create a rotation matrix using lookAt
            const rotationMatrix = new THREE.Matrix4();
            const up = new THREE.Vector3(0, 1, 0); // Assuming standard world up
            const eye = position.clone().add(normal); // Point slightly away along the normal
            rotationMatrix.lookAt(eye, position, up);

            // Extract Euler orientation from the matrix
            const orientation = new THREE.Euler().setFromRotationMatrix(
                rotationMatrix
            );
            const scale = fontSize * 0.01;
            const size = new THREE.Vector3(scale * 4, scale * 2, 1);
            const decalGeometry = new DecalGeometry(
                intersectedMesh,
                position,
                orientation,
                size
            );
            const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
            // Store the computed position and mesh name in userData
            decalMesh.userData = {
                type: "text",
                text: text,
                fontSize: fontSize,
                textColor: textColor,
                position: position,
                meshName: intersectedMesh.name, // <-- Added mesh name
            };
            scene.add(decalMesh);
            textDecals.push(decalMesh);
            updateGrandTotalDisplay(); // Update total when text is added
            window.showAlert(
                "Double click to edit",
                "Double click the text to edit it",
                "info",
                "text-edit-toast"
            );
            makeDecalEditable(decalMesh);

            // Debugging log for text position
            console.log("Text Decal Position:", position);

            renderer.domElement.removeEventListener("click", onDecalClick);
        }
        document.getElementById("openTextModalButton").disabled = false;
    }
    renderer.domElement.addEventListener("click", onDecalClick);
}

// text double click function
function makeDecalEditable(decalMesh) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    function onDoubleClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1 + 0.05;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(textDecals, true);
        if (intersects.length > 0) {
            const clickedDecal = intersects[0].object;
            const textData = clickedDecal.userData;
            if (textData && textData.type === "text") {
                editingDecal = clickedDecal;
                openTextEditModal(
                    textData.text,
                    textData.fontSize,
                    textData.textColor
                );
            }
        }
    }
    renderer.domElement.addEventListener("dblclick", onDoubleClick);
}

function openTextEditModal(
    currentText = "",
    currentFontSize = 64,
    currentColor = "#ff0000"
) {
    Swal.fire({
        title: editingDecal ? "Edit Text" : "Add Text",
        showDenyButton: editingDecal !== null,
        denyButtonText: editingDecal ? '<i class="bi bi-trash"></i>' : "",
        html: `
        <div class="w-full">
            <div class="mb-4">
                <label for="swalInputText" class="block text-left mb-2 text-white">Text:</label>
                <input type="text" id="swalInputText" class="w-full p-2 border rounded text-black" value="${currentText}" placeholder="Enter your text here">
            </div>
            <div class="mb-4">
                <label for="swalFontSize" class="block text-left mb-2 text-white">Font Size:</label>
                <input type="range" id="swalFontSize" class="w-full" min="12" max="120" value="${currentFontSize}">
                <div class="flex justify-between text-xs mt-1">
                    <span class="text-white">12px</span>
                    <span class="text-white">120px</span>
                </div>
            </div>
            <div class="mb-4">
                <label for="swalColorPicker" class="block text-left mb-2 text-white">Text Color:</label>
                <input type="color" id="swalColorPicker" class="w-full h-10" value="${currentColor}">
            </div>
            <div class="mt-6 p-4 border rounded bg-gray-100">
                <h3 class="mb-2 text-left font-bold">Preview:</h3>
                <div class="p-4 bg-white border rounded flex items-center justify-center min-h-16">
                    <span id="swalPreviewText" style="font-size: ${currentFontSize}px; color: ${currentColor};">
                        ${currentText || "Your Text Here"}
                    </span>
                </div>
            </div>
        </div>
    `,
        width: "600px",
        padding: "2rem",
        focusConfirm: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        showCloseButton: true,
        confirmButtonText: '<i class="bi bi-plus-lg"></i>',
        showDenyButton: editingDecal !== null,
        denyButtonText: editingDecal ? '<i class="bi bi-trash"></i>' : "",
        customClass: {
            popup: "bg-primary",
            title: "text-white font-bold",
            content: "text-white !important",
            confirmButton: "bg-green-500 text-white hover:bg-green-700",
            denyButton: "bg-red-500 text-white hover:bg-red-700",
            closeButton: "transition-transform transform hover:text-danger",
            validationMessage: "bg-secondary p-2 text-white",
        },
        preConfirm: () => {
            const text = document.getElementById("swalInputText").value;
            const fontSize = parseInt(
                document.getElementById("swalFontSize").value,
                10
            );
            const textColor = document.getElementById("swalColorPicker").value;
            return { text, fontSize, textColor };
        },
        didOpen: () => {
            document.addEventListener("keydown", handleEscapeKey);
        },
        willClose: () => {
            document.removeEventListener("keydown", handleEscapeKey);
        },
    })
        .then((result) => {
            if (result.isConfirmed) {
                const { text, fontSize, textColor } = result.value;

                if (editingDecal) {
                    scene.remove(editingDecal);
                    const index = textDecals.indexOf(editingDecal);
                    if (index > -1) {
                        textDecals.splice(index, 1);
                    }
                    editingDecal = null;

                    window.showAlert(
                        "Place Your Text",
                        "Click anywhere on the t-shirt to place your text",
                        "info",
                        "text-placement-toast"
                    );
                    activateTextDecalPlacement(text, fontSize, textColor);
                } else {
                    window.showAlert(
                        "Place Your Text",
                        "Click on the t-shirt to place your text",
                        "info",
                        "text-placement-toast"
                    );
                    activateTextDecalPlacement(text, fontSize, textColor);
                }
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                editingDecal = null;
            } else if (result.isDenied) {
                if (editingDecal) {
                    scene.remove(editingDecal);
                    const index = textDecals.indexOf(editingDecal);
                    if (index > -1) {
                        textDecals.splice(index, 1);
                    }
                    editingDecal = null;
                    updateGrandTotalDisplay(); // Update total when text is deleted
                    window.showAlert(
                        "Deleted!",
                        "Text has been deleted.",
                        "success",
                        "text-delete-toast"
                    );
                }
            }
        })
        .finally(() => {
            document.getElementById("openTextModalButton").disabled = false;
        });

    function handleEscapeKey(event) {
        if (event.key === "Escape") {
            Swal.close();
            editingDecal = null;
        }
    }

    setTimeout(() => {
        const inputText = document.getElementById("swalInputText");
        const fontSizeSlider = document.getElementById("swalFontSize");
        const colorPickerInput = document.getElementById("swalColorPicker");
        const previewText = document.getElementById("swalPreviewText");
        if (inputText && fontSizeSlider && colorPickerInput && previewText) {
            inputText.addEventListener("input", (e) => {
                previewText.innerText = e.target.value || "Your Text Here";
            });
            fontSizeSlider.addEventListener("input", (e) => {
                previewText.style.fontSize = e.target.value + "px";
            });
            colorPickerInput.addEventListener("input", (e) => {
                previewText.style.color = e.target.value;
            });
        }
    }, 100);
}

function resetDesign(isBackNavigation = false) {
    Swal.fire({
        title: "Reset Design?",
        text: "This will remove all customizations and revert to the original design. Are you sure?",
        icon: "warning",
        showCancelButton: false,
        showCloseButton: true,
        confirmButtonText: "Yes, reset it!",
        customClass: {
            popup: "bg-primary",
            title: "text-white font-bold",
            content: "text-white !important",
            confirmButton: "bg-green-500 text-white hover:bg-green-700",
            closeButton: "transition-transform transform hover:text-danger",
            validationMessage: "bg-secondary p-2 text-white",
        },
    }).then((result) => {
        if (result.isConfirmed) {
            if (isBackNavigation) {
                clearCustomizationState();
            }

            selectedParts = {
                sleeves: false,
                front: false,
                back: false,
                collar: false,
            };

            document
                .getElementById("toggleSleeves")
                .classList.remove("bg-green-500");
            document.getElementById("toggleSleeves").classList.add("bg-accent");
            document
                .getElementById("toggleFront")
                .classList.remove("bg-green-500");
            document.getElementById("toggleFront").classList.add("bg-accent");
            document
                .getElementById("toggleBack")
                .classList.remove("bg-green-500");
            document.getElementById("toggleBack").classList.add("bg-accent");
            document
                .getElementById("toggleCollar")
                .classList.remove("bg-green-500");
            document.getElementById("toggleCollar").classList.add("bg-accent");

            // Reset color variables
            window.selectedSleevesColor = null;
            window.selectedFrontBodyColor = null;
            window.selectedBackColor = null;
            window.selectedCollarColor = null;

            // Reset the color picker if available
            try {
                const colorPickerContainer = document.querySelector(
                    "#colorPickerContainer"
                );
                if (
                    colorPickerContainer &&
                    colorPickerContainer._iroColorPicker
                ) {
                    colorPickerContainer._iroColorPicker.color.set("#ffffff");
                }
            } catch (error) {
                console.warn("Could not reset color picker:", error);
            }

            // Remove all text decals
            while (textDecals.length > 0) {
                const decal = textDecals.pop();
                scene.remove(decal);
            }

            // Reset spinning state
            isSpinning = false;
            const spinButton = document.getElementById("toggleSpin");
            if (spinButton) {
                // Add null check for spinButton
                const spinIcon = spinButton.querySelector("img");
                spinButton.classList.remove("bg-green-500");
                spinButton.classList.add("bg-red-500");
                if (spinIcon) {
                    // Add null check for spinIcon
                    spinIcon.classList.remove("animate-spin");
                } else {
                    console.warn(
                        "Spin icon not found within #toggleSpin button during reset."
                    );
                }
            } else {
                console.warn("#toggleSpin button not found during reset.");
            }

            // Reset camera and controls
            camera.position.set(-0.075, 2.4, 3.85);
            controls.target.set(0, 0, 0);
            controls.update();
            camera.zoom = 0.9;
            camera.updateProjectionMatrix();

            // Complete reset of the model to original state by removing and reloading
            if (selectedModel) {
                // Store rotation before removing
                const currentRotation = selectedModel.rotation.clone();

                // Remove the current model from the scene
                scene.remove(selectedModel);

                // Load a fresh model
                const modelPath = "/models/shirtmockup.gltf";
                const loader = new GLTFLoader();
                loader.load(
                    modelPath,
                    (gltf) => {
                        selectedModel = gltf.scene;
                        selectedModel.scale.set(5, 5, 5);
                        selectedModel.position.y = -5.3;

                        // Reset rotation to zero
                        selectedModel.rotation.set(0, 0, 0);

                        // Get reference to important meshes
                        sleevesMesh =
                            selectedModel.getObjectByName("Object_123");
                        frontMesh = selectedModel.getObjectByName("Object_115");
                        backMesh = selectedModel.getObjectByName("Object_113");
                        collarMesh =
                            selectedModel.getObjectByName("Object_121");

                        // Add the fresh model to the scene
                        scene.add(selectedModel);

                        // Show success message
                        window.showAlert(
                            "Design Reset",
                            "Your design has been successfully reset",
                            "success",
                            "design-reset-toast"
                        );
                    },
                    undefined,
                    (error) => {
                        console.error("Error reloading model:", error);
                        window.showAlert(
                            "Reset Error",
                            "Could not fully reset the model",
                            "error",
                            "reset-error-toast"
                        );
                    }
                );
            } else {
                // Show success message even if no model was loaded yet
                window.showAlert(
                    "Design Reset",
                    "Your design has been reset to default",
                    "success",
                    "design-reset-toast"
                );
            }
        }
    });
}

// Add event listener for the reset design button
document.addEventListener("DOMContentLoaded", function () {
    const resetDesignButton = document.getElementById("resetDesign");
    if (resetDesignButton) {
        resetDesignButton.addEventListener("click", () => resetDesign());
    }
});

// Export the reset function
window.resetDesign = resetDesign;

function applyTextDecal(text, fontSize, textColor, relX, relY) {
    const decalCanvas = document.createElement("canvas");
    const dctx = decalCanvas.getContext("2d");
    decalCanvas.width = 512;
    decalCanvas.height = 256;
    dctx.clearRect(0, 0, decalCanvas.width, decalCanvas.height);
    dctx.font = `${fontSize}px Arial`;
    dctx.textAlign = "center";
    dctx.textBaseline = "middle";
    dctx.fillStyle = textColor;
    dctx.fillText(text, decalCanvas.width / 2, decalCanvas.height / 2);
    const decalTexture = new THREE.CanvasTexture(decalCanvas);
    decalTexture.needsUpdate = true;
    decalTexture.encoding = THREE.sRGBEncoding;
    const decalMaterial = new THREE.MeshPhongMaterial({
        map: decalTexture,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
    });
    const zOffset = -1;
    const bbox = new THREE.Box3().setFromObject(frontMesh);
    const boxCenter = bbox.getCenter(new THREE.Vector3());
    const boxSize = bbox.getSize(new THREE.Vector3());
    const offsetX = (relX - 0.5) * boxSize.x;
    const offsetY = (relY - 0.5) * boxSize.y;
    const decalPosition = boxCenter
        .clone()
        .add(new THREE.Vector3(offsetX, offsetY, zOffset));
    const worldQuat = new THREE.Quaternion();
    frontMesh.getWorldQuaternion(worldQuat);
    const decalOrientation = new THREE.Euler().setFromQuaternion(worldQuat);
    const scale = fontSize * 0.005;
    const decalSize = new THREE.Vector3(scale * 2, scale, scale);
    // Determine which mesh to use based on relX and relY
    // For simplicity, we'll use a basic heuristic:
    // - If relX is small (< 0.3), likely on the sides or sleeves
    // - If relX is large (> 0.7), likely on the sides or sleeves
    // - If relY is large (> 0.7), likely on the back
    let targetMesh = frontMesh; // Default to front

    if ((relX < 0.3 || relX > 0.7) && sleevesMesh) {
        targetMesh = sleevesMesh;
    } else if (relY > 0.7 && backMesh) {
        targetMesh = backMesh;
    }

    const decalGeometry = new DecalGeometry(
        targetMesh,
        decalPosition,
        decalOrientation,
        decalSize
    );
    const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
    decalMesh.userData = {
        type: "text",
        text: text,
        fontSize: fontSize,
        textColor: textColor,
    };
    (sleevesMesh || frontMesh || backMesh).add(decalMesh);
    textDecals.push(decalMesh);
    makeDecalEditable(decalMesh);
}

function initializeScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#374256");
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(-0.075, 2.4, 3.85);
    camera.zoom = 0.9;
    camera.updateProjectionMatrix();
    setupLighting();
    setupRenderer();
    loadModel();
    setupOrbitControls();
    window.addEventListener("resize", onWindowResize);
    setupMouseEvents();
    setupResetCamera();
    setupToggleSpin();
    setupColorPicker();
    setupToggleButtons();
    setupTextModal();
    animate();
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 2, 2).normalize();
    scene.add(directionalLight);
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
}

function setupRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document
        .getElementById("tshirt-container")
        .appendChild(renderer.domElement);
}

function setupOrbitControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.zoomSpeed = 1.5;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function setupMouseEvents() {
    window.addEventListener("mousedown", (event) => {
        if (event.button === 2) {
            isRightMouseButton = true;
            previousMousePosition = { x: event.clientX, y: event.clientY };
            controls.enableRotate = false;
        }
    });
    window.addEventListener("mouseup", () => {
        isRightMouseButton = false;
        controls.enableRotate = true;
    });
    window.addEventListener("mousemove", (event) => {
        if (isRightMouseButton) {
            const deltaX = event.clientX - previousMousePosition.x;
            const deltaY = event.clientY - previousMousePosition.y;
            const scale = camera.position.z / 10;
            camera.position.x -= deltaX * 0.001 * scale;
            camera.position.y += deltaY * 0.001 * scale;
            previousMousePosition = { x: event.clientX, y: event.clientY };
        }
    });
}

function setupResetCamera() {
    document.getElementById("resetCamera").addEventListener("click", () => {
        if (selectedModel) {
            camera.position.set(-0.075, 2.4, 3.85);
            selectedModel.rotation.set(0, 0, 0);
        } else {
            camera.position.set(0, 2, 5);
        }
        controls.target.set(0, 0, 0);
        controls.update();
        camera.zoom = 0.9;
        camera.updateProjectionMatrix();
    });
}

function setupToggleSpin() {
    const toggleSpinButton = document.getElementById("toggleSpin");

    // Add null check before setting up the event listener
    if (!toggleSpinButton) {
        // console.warn("Toggle spin button not found in the DOM");
        return;
    }

    toggleSpinButton.addEventListener("click", () => {
        const button = document.getElementById("toggleSpin");
        const spinIcon = button.querySelector("img");

        button.classList.toggle("bg-green-500");
        button.classList.toggle("bg-red-500");

        if (isSpinning) {
            spinIcon.classList.remove("animate-spin");
        } else {
            spinIcon.classList.add("animate-spin");
        }

        isSpinning = !isSpinning;
    });
}

function setupColorPicker() {
    // Initialize with saved color or default
    const initialColor = window.selectedColor || "#ffffff";

    const colorPicker = new iro.ColorPicker("#colorPickerContainer", {
        width: 150,
        color: initialColor,
    });

    colorPicker.on("color:change", (color) => {
        window.selectedColor = color.hexString;

        if (selectedModel) {
            selectedModel.traverse((child) => {
                if (child.isMesh) {
                    // Apply color to selected parts
                    if (
                        selectedParts.sleeves &&
                        (child.name === "Object_123" ||
                            child.name === "Object_125")
                    ) {
                        window.selectedSleevesColor = color.hexString;
                        child.material.emissive.set(color.hexString);
                        child.material.emissiveIntensity = 0.4;
                        child.material.needsUpdate = true;
                    }

                    if (selectedParts.front && child.name === "Object_115") {
                        window.selectedFrontBodyColor = color.hexString;
                        child.material.emissive.set(color.hexString);
                        child.material.emissiveIntensity = 0.4;
                        child.material.needsUpdate = true;
                    }

                    if (selectedParts.back && child.name === "Object_113") {
                        window.selectedBackColor = color.hexString;
                        child.material.emissive.set(color.hexString);
                        child.material.emissiveIntensity = 0.4;
                        child.material.needsUpdate = true;
                    }

                    if (selectedParts.collar && child.name === "Object_121") {
                        window.selectedCollarColor = color.hexString;
                        child.material.emissive.set(color.hexString);
                        child.material.emissiveIntensity = 0.4;
                        child.material.needsUpdate = true;
                    }
                }
            });

            // Save state after color change
            saveStateToSessionStorage();

            // Reset selected parts after applying color
            selectedParts = {
                sleeves: false,
                front: false,
                back: false,
                collar: false,
            };
            updateToggleButtons();
            updateGrandTotalDisplay(); // Update total when color changes
        }
    });

    // Store the color picker instance for later reference
    document.querySelector("#colorPickerContainer")._iroColorPicker =
        colorPicker;
}
function updateToggleButtons() {
    const toggleButtons = ["sleeves", "front", "back", "collar"];
    toggleButtons.forEach((part) => {
        const buttonId =
            "toggle" + part.charAt(0).toUpperCase() + part.slice(1);
        const button = document.getElementById(buttonId);
        button.classList.remove("bg-green-500");
        button.classList.add("bg-accent");
    });
}

function setupToggleButtons() {
    const toggleButtons = ["sleeves", "front", "back", "collar"];
    toggleButtons.forEach((part) => {
        const buttonId =
            "toggle" + part.charAt(0).toUpperCase() + part.slice(1);
        const button = document.getElementById(buttonId);
        button.addEventListener("click", () => {
            selectedParts[part] = !selectedParts[part];
            button.classList.toggle("bg-green-500", selectedParts[part]);
            button.classList.toggle("bg-accent", !selectedParts[part]);
        });
    });
    document
        .getElementById("toggleAll")
        .addEventListener("click", toggleAllParts);
}
function toggleAllParts() {
    const toggleButtons = ["sleeves", "front", "back", "collar"];
    toggleButtons.forEach((part) => {
        selectedParts[part] = !selectedParts[part];
        const buttonId =
            "toggle" + part.charAt(0).toUpperCase() + part.slice(1);
        const button = document.getElementById(buttonId);
        button.classList.toggle("bg-green-500", selectedParts[part]);
        button.classList.toggle("bg-accent", !selectedParts[part]);
    });
}

function setupTextModal() {
    document
        .getElementById("openTextModalButton")
        .addEventListener("click", function () {
            const button = this;
            button.disabled = true;
            window.editingDecal = null;
            openTextEditModal("", 64, "#000000");
        });
}

function loadModel() {
    const modelPath = "/models/shirtmockup.gltf";
    const loader = new GLTFLoader();
    loader.load(
        modelPath,
        (gltf) => {
            selectedModel = gltf.scene;
            selectedModel.scale.set(5, 5, 5);
            selectedModel.position.y = -5.3;
            sleevesMesh = selectedModel.getObjectByName("Object_123");
            frontMesh = selectedModel.getObjectByName("Object_115");
            backMesh = selectedModel.getObjectByName("Object_113");
            collarMesh = selectedModel.getObjectByName("Object_121");
            scene.add(selectedModel);
        },
        undefined,
        (error) => {}
    );
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    if (isSpinning && selectedModel) {
        selectedModel.rotation.y += 0.01;
    }
}

window.onload = () => {
    initializeScene();
};

function saveStateToSessionStorage() {
    const state = {
        selectedParts,
        sleevesColor: window.selectedSleevesColor,
        frontColor: window.selectedFrontBodyColor,
        backColor: window.selectedBackColor,
        collarColor: window.selectedCollarColor,
        textDecals: textDecals.map((decal) => ({
            type: decal.userData.type,
            text: decal.userData.text,
            fontSize: decal.userData.fontSize,
            textColor: decal.userData.textColor,
            position: decal.userData.position
                ? {
                      x: decal.userData.position.x,
                      y: decal.userData.position.y,
                      z: decal.userData.position.z,
                  }
                : null,
            meshName: decal.userData.meshName || null, // <-- Added mesh name
        })),
        isSpinning,
        selectedSizes,
        fabricType: document.getElementById("fabric_type")?.value || null,
    };

    sessionStorage.setItem(
        "tshirtCustomization",
        JSON.stringify(state, (key, value) => {
            // Handle circular references in userData.position
            if (key === "position" && value && typeof value === "object") {
                return { x: value.x, y: value.y, z: value.z };
            }
            return value;
        })
    );
    // console.log("State saved to session storage");
}

// Function to load state from sessionStorage
// function loadStateFromSessionStorage() {
//     const savedState = sessionStorage.getItem("tshirtCustomization");
//     if (!savedState) {
//         console.log("No saved state found");
//         return false;
//     }

//     try {
//         const state = JSON.parse(savedState);
//         // console.log("Loading saved state:", state);

//         // Restore selected parts
//         selectedParts = state.selectedParts;

//         // Update UI toggle buttons
//         document
//             .getElementById("toggleSleeves")
//             .classList.toggle("bg-green-500", selectedParts.sleeves);
//         document
//             .getElementById("toggleSleeves")
//             .classList.toggle("bg-accent", !selectedParts.sleeves);
//         document
//             .getElementById("toggleFront")
//             .classList.toggle("bg-green-500", selectedParts.front);
//         document
//             .getElementById("toggleFront")
//             .classList.toggle("bg-accent", !selectedParts.front);
//         document
//             .getElementById("toggleBack")
//             .classList.toggle("bg-green-500", selectedParts.back);
//         document
//             .getElementById("toggleBack")
//             .classList.toggle("bg-accent", !selectedParts.back);
//         document
//             .getElementById("toggleCollar")
//             .classList.toggle("bg-green-500", selectedParts.collar);
//         document
//             .getElementById("toggleCollar")
//             .classList.toggle("bg-accent", !selectedParts.collar);

//         // Store colors
//         window.selectedSleevesColor = state.sleevesColor;
//         window.selectedFrontBodyColor = state.frontColor;
//         window.selectedBackColor = state.backColor;
//         window.selectedCollarColor = state.collarColor;

//         // Restore isSpinning state
//         isSpinning = state.isSpinning;
//         const spinButton = document.getElementById("toggleSpin");
//         if (spinButton) {
//             // Add null check for spinButton
//             const spinIcon = spinButton.querySelector("img");
//             spinButton.classList.toggle("bg-green-500", isSpinning);
//             spinButton.classList.toggle("bg-red-500", !isSpinning);
//             if (spinIcon) {
//                 // Add null check for spinIcon
//                 if (isSpinning) {
//                     spinIcon.classList.add("animate-spin");
//                 } else {
//                     spinIcon.classList.remove("animate-spin");
//                 }
//             } else {
//                 console.warn(
//                     "Spin icon not found within #toggleSpin button during state load."
//                 );
//             }
//         } else {
//             // console.warn("#toggleSpin button not found during state load.");
//         }

//         // Try to apply colors immediately if model is loaded
//         if (selectedModel) {
//             applyColorsToModel();
//             textDecals.length = 0; // Clear existing decals
//             restoreTextDecals(state.textDecals);
//         }

//         // Set a more robust check for model loading
//         let attempts = 0;
//         const maxAttempts = 50;
//         const checkModelInterval = setInterval(() => {
//             attempts++;
//             if (selectedModel) {
//                 clearInterval(checkModelInterval);
//                 // console.log("Model loaded, applying colors and text decals");
//                 applyColorsToModel();
//                 restoreTextDecals(state.textDecals);
//             } else if (attempts >= maxAttempts) {
//                 clearInterval(checkModelInterval);
//                 console.warn("Model not loaded after maximum attempts");
//             }
//         }, 500);

//         // Restore selected sizes
//         if (state.selectedSizes) {
//             // Assuming selectedSizes is defined in calculation.js
//             // and is used to manage the size selection state
//             if (Array.isArray(state.selectedSizes)) {
//                 window.selectedSizes = state.selectedSizes;
//             }
//         }

//         // Restore fabric type
//         if (state.fabricType) {
//             const fabricSelect = document.getElementById("fabric_type");
//             if (fabricSelect) {
//                 fabricSelect.value = state.fabricType;
//             }
//         }
//         return true;
//     } catch (error) {
//         console.error("Error loading state from session storage:", error);
//         return false;
//     }
// }

// Function to apply saved colors to model
function applyColorsToModel() {
    if (!selectedModel) {
        console.warn("Model not loaded yet, can't apply colors");
        return;
    }

    // console.log("Applying colors to model:", {
    //     sleeves: window.selectedSleevesColor,
    //     front: window.selectedFrontBodyColor,
    //     back: window.selectedBackColor,
    //     collar: window.selectedCollarColor,
    // });

    selectedModel.traverse((child) => {
        if (child.isMesh) {
            if (child.name === "Object_123" || child.name === "Object_125") {
                // Apply sleeves color regardless of selectedParts for testing
                if (window.selectedSleevesColor) {
                    child.material.emissive.set(window.selectedSleevesColor);
                    child.material.emissiveIntensity = 0.4;
                    child.material.needsUpdate = true;
                    console.log(
                        "Applied sleeves color:",
                        window.selectedSleevesColor
                    );
                }
            } else if (child.name === "Object_115") {
                if (window.selectedFrontBodyColor) {
                    child.material.emissive.set(window.selectedFrontBodyColor);
                    child.material.emissiveIntensity = 0.4;
                    child.material.needsUpdate = true;
                    console.log(
                        "Applied front color:",
                        window.selectedFrontBodyColor
                    );
                }
            } else if (child.name === "Object_113") {
                if (window.selectedBackColor) {
                    child.material.emissive.set(window.selectedBackColor);
                    child.material.emissiveIntensity = 0.4;
                    child.material.needsUpdate = true;
                    console.log(
                        "Applied back color:",
                        window.selectedBackColor
                    );
                }
            } else if (child.name === "Object_121") {
                if (window.selectedCollarColor) {
                    child.material.emissive.set(window.selectedCollarColor);
                    child.material.emissiveIntensity = 0.4;
                    child.material.needsUpdate = true;
                    console.log(
                        "Applied collar color:",
                        window.selectedCollarColor
                    );
                }
            }
        }
    });
}

// Function to restore text decals
function restoreTextDecals(savedDecals) {
    if (
        !savedDecals ||
        !Array.isArray(savedDecals) ||
        savedDecals.length === 0
    ) {
        return;
    }

    savedDecals.forEach((decalData) => {
        if (decalData.type === "text" && decalData.text && decalData.position) {
            // Create decal canvas
            const decalCanvas = document.createElement("canvas");
            const dctx = decalCanvas.getContext("2d");
            decalCanvas.width = 512;
            decalCanvas.height = 256;
            dctx.clearRect(0, 0, decalCanvas.width, decalCanvas.height);
            dctx.font = `${decalData.fontSize}px Arial`;
            dctx.textAlign = "center";
            dctx.textBaseline = "middle";
            dctx.fillStyle = decalData.textColor;
            dctx.fillText(
                decalData.text,
                decalCanvas.width / 2,
                decalCanvas.height / 2
            );

            const decalTexture = new THREE.CanvasTexture(decalCanvas);
            decalTexture.needsUpdate = true;
            decalTexture.encoding = THREE.sRGBEncoding;

            const decalMaterial = new THREE.MeshBasicMaterial({
                map: decalTexture,
                transparent: true,
                depthTest: true,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: -4,
            });

            // Create position and orientation for the decal
            const position = new THREE.Vector3(
                decalData.position.x,
                decalData.position.y,
                decalData.position.z
            );

            // Determine target mesh based on saved meshName
            let decalTargetMesh = null;
            if (selectedModel && decalData.meshName) {
                selectedModel.traverse((child) => {
                    if (child.isMesh && child.name === decalData.meshName) {
                        decalTargetMesh = child;
                    }
                });
            }
            // Fallback to frontMesh if specific mesh not found
            if (!decalTargetMesh) {
                console.warn(
                    `Mesh '${decalData.meshName}' not found for restored decal, defaulting to frontMesh.`
                );
                decalTargetMesh = frontMesh;
            }
            if (!decalTargetMesh) {
                console.error(
                    "Front mesh also not available for decal restoration."
                );
                return; // Cannot restore decal without a target mesh
            }

            // Recreate orientation based on position and target mesh normal
            // Use raycasting to find the face normal at the saved position on the target mesh
            const raycaster = new THREE.Raycaster();
            const direction = new THREE.Vector3()
                .subVectors(camera.position, position)
                .normalize(); // Ray from camera towards position
            raycaster.set(
                position.clone().addScaledVector(direction, -0.1),
                direction
            ); // Start ray slightly behind position

            const intersects = raycaster.intersectObject(decalTargetMesh);
            let normal = new THREE.Vector3(0, 0, 1); // Default normal

            if (intersects.length > 0 && intersects[0].face) {
                normal = intersects[0].face.normal.clone();
                normal
                    .transformDirection(decalTargetMesh.matrixWorld)
                    .normalize();
            } else {
                console.warn(
                    "Could not determine normal for restored decal, using default."
                );
                // Attempt to get world normal if raycast fails (less accurate)
                const tempQuat = new THREE.Quaternion();
                decalTargetMesh.getWorldQuaternion(tempQuat);
                normal.applyQuaternion(tempQuat);
            }

            // Create orientation using lookAt, similar to placement logic
            const rotationMatrix = new THREE.Matrix4();
            const up = new THREE.Vector3(0, 1, 0);
            const eye = position.clone().add(normal);
            rotationMatrix.lookAt(eye, position, up);
            const orientation = new THREE.Euler().setFromRotationMatrix(
                rotationMatrix
            );

            // Create and add the decal
            const scale = decalData.fontSize * 0.01;
            const size = new THREE.Vector3(scale * 4, scale * 2, 1);

            const decalGeometry = new DecalGeometry(
                decalTargetMesh,
                position,
                orientation,
                size
            );

            const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
            decalMesh.userData = {
                type: "text",
                text: decalData.text,
                fontSize: decalData.fontSize,
                textColor: decalData.textColor,
                position: position,
                meshName: decalTargetMesh.name, // Store the determined mesh name
            };

            scene.add(decalMesh);
            textDecals.push(decalMesh);
            makeDecalEditable(decalMesh);
        }
    });
}

// Function to clear session storage
function clearCustomizationState() {
    sessionStorage.removeItem("tshirtCustomization");
    const fabricSelect = document.getElementById("fabric_type");
    if (fabricSelect) {
        fabricSelect.value = ""; // Reset fabric type
    }
    console.log("Customization state cleared from session storage");
}

// Add auto-save functionality - Save every 5 seconds and on important changes
function setupAutoSave() {
    // Save periodically
    setInterval(saveStateToSessionStorage, 5000);

    // Save on color changes
    const colorPicker = document.querySelector("#colorPickerContainer");
    if (colorPicker) {
        const observer = new MutationObserver(saveStateToSessionStorage);
        observer.observe(colorPicker, { attributes: true, subtree: true });
    }

    // Save when parts are toggled
    document
        .getElementById("toggleSleeves")
        .addEventListener("click", saveStateToSessionStorage);
    document
        .getElementById("toggleFront")
        .addEventListener("click", saveStateToSessionStorage);
    document
        .getElementById("toggleBack")
        .addEventListener("click", saveStateToSessionStorage);
    document
        .getElementById("toggleCollar")
        .addEventListener("click", saveStateToSessionStorage);

    // Save when text is added/modified
    const originalActivateTextDecalPlacement = activateTextDecalPlacement;
    window.activateTextDecalPlacement = function () {
        originalActivateTextDecalPlacement.apply(this, arguments);
        saveStateToSessionStorage();
    };

    const originalMakeDecalEditable = makeDecalEditable;
    window.makeDecalEditable = function () {
        originalMakeDecalEditable.apply(this, arguments);
        saveStateToSessionStorage();
    };
}

// Modify the document.addEventListener("DOMContentLoaded") to include our new functionality
document.addEventListener("DOMContentLoaded", function () {
    newcustomorder(); // Initialize order confirmation logic

    // Add listener for fabric type changes
    const fabricSelect = document.getElementById("fabric_type");
    if (fabricSelect) {
        fabricSelect.addEventListener("change", () => {
            updateGrandTotalDisplay(); // Update total on fabric change
        });
    }
    // Also listen to custom fabric input if it exists
    const customFabricInput = document.getElementById("custom_fabric_type");
    if (customFabricInput) {
        customFabricInput.addEventListener("input", () => {
            // Only update if the main select is 'custom'
            if (fabricSelect && fabricSelect.value === "custom") {
                updateGrandTotalDisplay();
            }
        });
    }

    // Load state from session storage after the scene is initialized
    setTimeout(() => {
        const loaded = loadStateFromSessionStorage(); // Check if state was loaded
        setupAutoSave();
        // Initial total calculation after potential state load
        updateGrandTotalDisplay();
    }, 1000);
});

// Detect back navigation
window.addEventListener("popstate", function (event) {
    resetDesign(true);
});

window.textDecals = textDecals;

// Initialize tooltips
// document.addEventListener("DOMContentLoaded", function () {
//     function createTooltip(element, content) {
//         const tooltipKey = "tooltip-" + element.id;
//         if (!localStorage.getItem(tooltipKey)) {
//             tippy(element, {
//                 content: content,
//                 placement: "top",
//                 arrow: true,
//                 interactive: false,
//                 trigger: "mouseenter focus",
//                 onShow(instance) {
//                     setTimeout(() => {
//                         instance.hide();
//                     }, 3000);
//                 },
//                 onHidden(instance) {
//                     localStorage.setItem(tooltipKey, "true");
//                 },
//             });
//         }
//     }

//     // Initialize tooltips for interactive elements
//     createTooltip(document.getElementById("resetCamera"), "Reset camera view.");
//     createTooltip(
//         document.getElementById("resetDesign"),
//         "Reset the design to default."
//     );
//     createTooltip(
//         document.getElementById("toggleFront"),
//         "Toggle the front part of the t-shirt."
//     );
//     createTooltip(
//         document.getElementById("toggleSleeves"),
//         "Toggle the sleeves of the t-shirt."
//     );
//     createTooltip(
//         document.getElementById("toggleBack"),
//         "Toggle the back part of the t-shirt."
//     );
//     createTooltip(
//         document.getElementById("toggleCollar"),
//         "Toggle the collar of the t-shirt."
//     );
//     createTooltip(
//         document.getElementById("toggleAll"),
//         "Toggle all parts of the t-shirt."
//     );
//     createTooltip(
//         document.getElementById("colorPickerContainer"),
//         "Pick a color for the t-shirt."
//     );
//     createTooltip(
//         document.getElementById("openSizeModalButton"),
//         "Select sizes for the order."
//     );
//     createTooltip(
//         document.getElementById("fabric_type"),
//         "Select the fabric type."
//     );
//     createTooltip(
//         document.getElementById("openTextModalButton"),
//         "Customize the text on the t-shirt."
//     );
//     createTooltip(
//         document.getElementById("showPricingButton"),
//         "Show the pricing details."
//     );
//     createTooltip(
//         document.getElementById("confirmOrder"),
//         "Confirm the order."
//     );
//     createTooltip(
//         document.getElementById("modalCloseButton"),
//         "Close the text customization modal."
//     );
//     createTooltip(
//         document.getElementById("modalInputText"),
//         "Enter your text here."
//     );
//     createTooltip(
//         document.getElementById("fontSizeSlider"),
//         "Adjust the font size."
//     );
//     createTooltip(
//         document.getElementById("colorPickerInput"),
//         "Pick a color for the text."
//     );
//     createTooltip(
//         document.getElementById("modalCancelButton"),
//         "Cancel the text customization."
//     );
//     createTooltip(
//         document.getElementById("modalApplyButton"),
//         "Apply the text customization."
//     );
// });
