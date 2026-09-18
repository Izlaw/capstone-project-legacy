import "./bootstrap";
import Alpine from "alpinejs";
import Swal from "sweetalert2";
import flatpickr from "flatpickr"; // Make sure flatpickr is properly imported
import "flatpickr/dist/flatpickr.min.css"; // Import flatpickr CSS
import "../css/customflatpickr.css";
import "./swalpopup.js";
import { handleUploadDesignAndSendMessage } from "./uploadorder.js";
import { fetchSizes } from "./calculation.js";
import "./previeworder.js";
import { initNotifications } from "./notification.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

initNotifications();

window.Alpine = Alpine;
Alpine.start();
// Livewire.start();

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

// password toggle in login and register
// Update the password toggle functionality with new SVG icons
document.addEventListener("DOMContentLoaded", function () {
    // Function to set up password toggle functionality
    function setupPasswordToggle(
        passwordId,
        toggleId,
        eyeIconId,
        eyeOffIconId
    ) {
        const passwordField = document.getElementById(passwordId);
        const toggleButton = document.getElementById(toggleId);
        const eyeIcon = document.getElementById(eyeIconId);
        const eyeOffIcon = document.getElementById(eyeOffIconId);

        if (!passwordField || !toggleButton || !eyeIcon || !eyeOffIcon) {
            // console.log(`Password toggle elements not found for ${passwordId}`);
            return; // Exit if any element is missing
        }

        console.log(`Setting up password toggle for ${passwordId}`);

        // Replace the eye-off SVG with the new SVG design
        eyeOffIcon.outerHTML = `<svg id="${eyeOffIconId}" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clip-rule="evenodd"/>
            <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z"/>
        </svg>`;

        // Get the updated reference after replacing the HTML
        const updatedEyeOffIcon = document.getElementById(eyeOffIconId);

        // Make sure icons are properly set initially
        updatedEyeOffIcon.classList.remove("hidden");
        eyeIcon.classList.add("hidden");

        // Show toggle button when field is focused
        passwordField.addEventListener("focus", function () {
            toggleButton.classList.remove("hidden");
        });

        // Hide toggle button when field loses focus (after a short delay)
        passwordField.addEventListener("blur", function (e) {
            // Don't hide if clicking the toggle button caused the blur
            if (e.relatedTarget !== toggleButton) {
                setTimeout(() => {
                    toggleButton.classList.add("hidden");
                }, 200);
            }
        });

        // Toggle password visibility and swap icons when clicked
        toggleButton.addEventListener("click", function () {
            const currentType = passwordField.getAttribute("type");

            if (currentType === "password") {
                passwordField.setAttribute("type", "text");
                eyeIcon.classList.remove("hidden");
                updatedEyeOffIcon.classList.add("hidden");
            } else {
                passwordField.setAttribute("type", "password");
                updatedEyeOffIcon.classList.remove("hidden");
                eyeIcon.classList.add("hidden");
            }

            // Refocus the password field
            passwordField.focus();
        });
    }

    // Set up toggles for both login and registration
    setupPasswordToggle(
        "passwordLogin",
        "togglePasswordLogin",
        "eyeIconLogin",
        "eyeOffIconLogin"
    );
    setupPasswordToggle(
        "passwordRegister",
        "togglePasswordRegister",
        "eyeIconRegister",
        "eyeOffIconRegister"
    );
    setupPasswordToggle(
        "password_confirmation",
        "togglePasswordRegisterConfirm",
        "eyeIconConfirmRegister",
        "eyeOffIconConfirmRegister"
    );
});

// date flatpicker js
document.addEventListener("DOMContentLoaded", function () {
    // Initialize flatpickr on the birthday field
    const bdayInput = document.getElementById("bday");

    if (bdayInput) {
        // Calculate the date 18 years ago
        const today = new Date();
        const maxDate = new Date(
            today.getFullYear() - 18,
            today.getMonth(),
            today.getDate()
        );

        // Initialize flatpickr on the birthday field
        const fp = flatpickr("#bday", {
            dateFormat: "Y-m-d",
            maxDate: maxDate,
            disableMobile: true,
            static: false,
            animate: true,
            onChange: function (selectedDates, dateStr, instance) {
                if (selectedDates.length > 0) {
                    const birthDate = new Date(selectedDates[0]);
                    const age = today.getFullYear() - birthDate.getFullYear();
                    console.log("Selected age:", age);

                    // Add visual feedback when date is selected
                    bdayInput.classList.add("border-highlight");
                }
            },
        });

        // console.log("Flatpickr initialized for birthday field", fp);
    } else {
        // console.log("Birthday input field not found");
    }
});

// addorder js with authentication check
document.addEventListener("DOMContentLoaded", function () {
    const addCustomOrder = document.getElementById("addCustomOrder");

    if (addCustomOrder) {
        addCustomOrder.addEventListener("click", function () {
            // Check authentication first
            if (!isAuthenticated()) {
                redirectToLogin();
                return;
            }

            Swal.fire({
                title: "Do you have an existing design?",
                icon: "question",
                html: `
                    <div class="flex flex-col items-center space-y-4">
                        <div class="flex space-x-4">
                            <button id="swal-yes" class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 transition transform">
                                Yes
                            </button>
                            <button id="swal-no" class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 transition transform">
                                No
                            </button>
                        </div>
                    </div>
                `,
                showConfirmButton: false,
                showCancelButton: false,
                showCloseButton: true,
                customClass: {
                    popup: "bg-primary text-white shadow-lg rounded-lg w-96",
                    title: "text-xl font-semibold mb-4",
                    content: "text-lg",
                    closeButton:
                        "transition-transform transform hover:text-danger",
                },
            }).then(() => {
                // This promise will resolve once Swal.close() is called by any button
            });

            // Attach event listeners after the popup is rendered
            setTimeout(() => {
                const yesButton = document.getElementById("swal-yes");
                const noButton = document.getElementById("swal-no");
                const cancelButton = document.getElementById("swal-cancel");

                if (yesButton) {
                    yesButton.addEventListener("click", () => {
                        Swal.close();
                        handleUploadDesignAndSendMessage();
                    });
                }

                if (noButton) {
                    noButton.addEventListener("click", () => {
                        Swal.close();
                        window.location.href = "/customize";
                    });
                }

                if (cancelButton) {
                    cancelButton.addEventListener("click", () => {
                        Swal.close();
                        // Optional: perform additional actions for cancel if needed
                    });
                }
            }, 100); // Delay to ensure Swal content is rendered
        });
    }
});

// faq js
document.addEventListener("DOMContentLoaded", function () {
    const revealAnswers = document.querySelectorAll(".RevealAnswer");

    revealAnswers.forEach(function (revealAnswer) {
        revealAnswer.addEventListener("click", function () {
            // Instead of using nextElementSibling, we will search for the closest parent QuestionContainer
            const hiddenAnswer = revealAnswer
                .closest(".QuestionContainer")
                .querySelector(".HiddenAnswer");

            // Ensure we found the HiddenAnswer element
            if (hiddenAnswer) {
                hiddenAnswer.classList.toggle("max-h-0");
                hiddenAnswer.classList.toggle("opacity-0");
                hiddenAnswer.classList.toggle("max-h-screen");
                hiddenAnswer.classList.toggle("opacity-100");
            }
        });
    });
});

// user icon
document.addEventListener("DOMContentLoaded", function () {
    const userIcon = document.querySelector(".userIcon");
    const dropdown = document.querySelector(".userIconDropdown");

    if (userIcon && dropdown) {
        userIcon.addEventListener("click", function () {
            dropdown.classList.toggle("hidden");
        });
    }
});

// Show Pricing Modal
document.addEventListener("DOMContentLoaded", async function () {
    const showPricingButton = document.getElementById("showPricingButton");
    if (showPricingButton) {
        const sizes = await fetchSizes();
        showPricingButton.addEventListener("click", function () {
            if (sizes && Array.isArray(sizes)) {
                Swal.fire({
                    title: "Size Pricing",
                    html: `
                        <ul class="text-lg">
                            ${sizes
                                .map(
                                    (size) => `
                                <li class="mb-2 text-white">
                                    <span class="font-semibold">${
                                        size.sizeName
                                    }</span>: ₱${parseFloat(
                                        size.sizePrice
                                    ).toFixed(2)}
                                </li>
                            `
                                )
                                .join("")}
                        </ul>
                    `,
                    customClass: {
                        popup: "bg-primary text-highlight shadow-lg rounded-lg w-64",
                        title: "text-2xl font-semibold mb-4",
                        content: "text-lg",
                        closeButton:
                            "transition-transform transform hover:scale-125 hover:text-danger",
                    },
                    showCloseButton: true,
                    showConfirmButton: false,
                });
            } else {
                console.error("Sizes data is not available or not an array.");
            }
        });
    }
});

window.Echo.channel("order-status").listen(".OrderStatusUpdatedEvent", (e) => {
    console.log("Broadcast event received:", e);
    Livewire.emit("refreshStatus", e.order_id, e.status);
});

function formatContactNumber(inputElement) {
    let value = inputElement.value.replace(/\D/g, ""); // Remove non-digits

    let formattedValue = "";
    if (value.length > 0) {
        formattedValue = value.substring(0, 4); // First 4 digits (09XX)
    }
    if (value.length > 4) {
        formattedValue += "-" + value.substring(4, 7); // Next 3 digits (XXX)
    }
    if (value.length > 7) {
        formattedValue += "-" + value.substring(7, 11); // Last 4 digits (XXXX)
    }

    // Limit length to 13 characters (09XX-XXX-XXXX)
    inputElement.value = formattedValue.substring(0, 13);
}

document.addEventListener("DOMContentLoaded", function () {
    const contactInput = document.getElementById("contact");
    if (contactInput) {
        contactInput.addEventListener("input", function () {
            formatContactNumber(this);
        });
        contactInput.setAttribute("maxlength", "13");
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.querySelector('form[action*="register"]');

    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            // Check for visible error messages
            const errorMessages =
                registerForm.querySelectorAll('[id$="-error"]');
            let hasErrors = false;

            errorMessages.forEach((errorElement) => {
                if (
                    errorElement.style.display !== "none" &&
                    errorElement.textContent.trim() !== ""
                ) {
                    hasErrors = true;
                }
            });

            // Check for empty required fields
            const requiredFields = registerForm.querySelectorAll("[required]");
            requiredFields.forEach((field) => {
                if (!field.value.trim()) {
                    hasErrors = true;
                    const fieldId = field.id;
                    const errorElement =
                        document.getElementById(`${fieldId}-error`) ||
                        document.getElementById(
                            `${fieldId.replace("_", "-")}-error`
                        );

                    if (errorElement) {
                        errorElement.textContent = "This field is required";
                        errorElement.style.display = "block";
                        field.classList.add("border-red-500");
                    }
                }
            });

            if (hasErrors) {
                event.preventDefault();
                // Scroll to the first error
                const firstError =
                    registerForm.querySelector(".border-red-500");
                if (firstError) {
                    firstError.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                    firstError.focus();
                }
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    // Form field validation
    const validateField = (field, errorSelector, validationFn) => {
        const errorElement = document.querySelector(errorSelector);
        if (!field || !errorElement) return;

        // Initial state - hide errors
        errorElement.innerHTML = ""; // Clear existing content
        errorElement.style.display = "none";

        // Validate on input/change
        field.addEventListener("input", function () {
            const result = validationFn(field.value);
            if (result.valid) {
                errorElement.innerHTML = "";
                errorElement.style.display = "none";
                field.classList.remove("border-red-500");
                field.classList.add("border-green-500");
            } else {
                errorElement.innerHTML = ""; // Clear existing content
                result.message.forEach((message) => {
                    const messageDiv = document.createElement("div");
                    messageDiv.textContent = message;
                    errorElement.appendChild(messageDiv);
                });
                errorElement.style.display = "block";
                field.classList.remove("border-green-500");
                field.classList.add("border-red-500");
            }
        });

        // Validate on blur (when user leaves the field)
        field.addEventListener("blur", function () {
            const result = validationFn(field.value);
            if (result.valid) {
                errorElement.innerHTML = "";
                errorElement.style.display = "none";
                field.classList.remove("border-red-500");
                field.classList.add("border-green-500");
            } else {
                errorElement.innerHTML = ""; // Clear existing content
                result.message.forEach((message) => {
                    const messageDiv = document.createElement("div");
                    messageDiv.textContent = message;
                    errorElement.appendChild(messageDiv);
                });
                errorElement.style.display = "block";
                field.classList.remove("border-green-500");
                field.classList.add("border-red-500");
            }
        });
    };

    // Birthday validation
    const bdayInput = document.getElementById("bday");
    if (bdayInput) {
        validateField(
            bdayInput,
            "#bday-error", // Create this element in your HTML
            (value) => {
                if (!value)
                    return { valid: false, message: "Birthday is required" };

                const selectedDate = new Date(value);
                const today = new Date();
                const minAgeDate = new Date();
                minAgeDate.setFullYear(today.getFullYear() - 18);

                if (selectedDate > minAgeDate) {
                    return {
                        valid: false,
                        message: "You must be 18 years or older!",
                    };
                }
                return { valid: true, message: "" };
            }
        );
    }

    // Email validation
    const emailInput = document.getElementById("email");
    if (emailInput) {
        validateField(
            emailInput,
            "#email-error", // Create this element in your HTML
            (value) => {
                if (!value)
                    return { valid: false, message: "Email is required" };

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    return {
                        valid: false,
                        message: "Please enter a valid email address",
                    };
                }
                return { valid: true, message: "" };
            }
        );
    }

    // Password validation
    const passwordInput = document.getElementById("passwordRegister");
    if (passwordInput) {
        validateField(
            passwordInput,
            "#password-error", // Create this element in your HTML
            (value) => {
                if (!value) {
                    return { valid: false, message: "Password is required." };
                }

                let messages = [];
                let isValid = true;

                const minLength = 8;
                const maxLength = 16;
                const hasUpperCase = /[A-Z]/.test(value);
                const hasLowerCase = /[a-z]/.test(value);
                const hasNumber = /[0-9]/.test(value);
                const hasSpecialChar = /[@$!%*?&]/.test(value);

                if (value.length < minLength || value.length > maxLength) {
                    messages.push(
                        `Password must be between ${minLength} and ${maxLength} characters.`
                    );
                    isValid = false;
                }
                if (!hasUpperCase) {
                    messages.push(
                        "Password must contain at least one uppercase letter."
                    );
                    isValid = false;
                }
                if (!hasLowerCase) {
                    messages.push(
                        "Password must contain at least one lowercase letter."
                    );
                    isValid = false;
                }
                if (!hasNumber) {
                    messages.push("Password must contain at least one number.");
                    isValid = false;
                }
                if (!hasSpecialChar) {
                    messages.push(
                        "Password must contain at least one special character (@$!%*?&)."
                    );
                    isValid = false;
                }

                if (!isValid) {
                    return { valid: false, message: messages };
                }

                return { valid: true, message: "" };
            }
        );
    }

    // Password confirmation validation
    const passwordConfirmInput = document.getElementById(
        "password_confirmation"
    );
    if (passwordConfirmInput && passwordInput) {
        validateField(
            passwordConfirmInput,
            "#password-confirmation-error", // Create this element in your HTML
            (value) => {
                if (!value)
                    return {
                        valid: false,
                        message: "Please confirm your password",
                    };

                if (value !== passwordInput.value) {
                    return { valid: false, message: "Passwords do not match" };
                }
                return { valid: true, message: "" };
            }
        );
    }

    // Contact number validation
    const contactInput = document.getElementById("contact");
    if (contactInput) {
        validateField(
            contactInput,
            "#contact-error", // Create this element in your HTML
            (value) => {
                if (!value)
                    return {
                        valid: false,
                        message: "Contact number is required",
                    };

                // Format: 09XX-XXX-XXXX or 09XXXXXXXXX
                const cleanedValue = value.replace(/[^0-9]/g, "");
                if (
                    cleanedValue.length !== 11 ||
                    !cleanedValue.startsWith("09")
                ) {
                    return {
                        valid: false,
                        message:
                            "Please enter a valid 11-digit contact number starting with 09",
                    };
                }
                return { valid: true, message: "" };
            }
        );
    }

    // Add validation for other fields as needed (first_name, last_name, address, sex)
    // First name validation
    const firstNameInput = document.getElementById("first_name");
    if (firstNameInput) {
        validateField(
            firstNameInput,
            "#first-name-error", // Create this element in your HTML
            (value) => {
                if (!value.trim())
                    return { valid: false, message: "First name is required" };
                return { valid: true, message: "" };
            }
        );
    }

    // Last name validation
    const lastNameInput = document.getElementById("last_name");
    if (lastNameInput) {
        validateField(
            lastNameInput,
            "#last-name-error", // Create this element in your HTML
            (value) => {
                if (!value.trim())
                    return { valid: false, message: "Last name is required" };
                return { valid: true, message: "" };
            }
        );
    }

    // Address validation
    const addressInput = document.getElementById("address");
    if (addressInput) {
        validateField(
            addressInput,
            "#address-error", // Create this element in your HTML
            (value) => {
                if (!value.trim())
                    return { valid: false, message: "Address is required" };
                return { valid: true, message: "" };
            }
        );
    }

    // Sex validation
    const sexInput = document.getElementById("sex");
    if (sexInput) {
        validateField(
            sexInput,
            "#sex-error", // Create this element in your HTML
            (value) => {
                if (!value)
                    return { valid: false, message: "Please select your sex" };
                return { valid: true, message: "" };
            }
        );
    }
});
