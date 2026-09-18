import Swal from "sweetalert2";
import "./swalpopup.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../css/customflatpickr.css";

// Helper function: Convert "YYYY-MM-DD" to "DD-MM-YYYY" for display.
function formatDateForDisplay(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
}

// Add this function at the top of your manageemployee.js file, before your DOMContentLoaded
function setupPasswordToggle(passwordId, toggleId, eyeIconId, eyeOffIconId) {
    const passwordField = document.getElementById(passwordId);
    const toggleButton = document.getElementById(toggleId);
    const eyeIcon = document.getElementById(eyeIconId);
    const eyeOffIcon = document.getElementById(eyeOffIconId);

    if (!passwordField || !toggleButton || !eyeIcon || !eyeOffIcon) {
        console.log(`Password toggle elements not found for ${passwordId}`);
        return; // Exit if any element is missing
    }

    // Make sure icons are properly set initially
    eyeOffIcon.classList.remove("hidden");
    eyeIcon.classList.add("hidden");

    // Toggle password visibility and swap icons when clicked
    toggleButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent any default behavior

        const currentType = passwordField.getAttribute("type");
        if (currentType === "password") {
            passwordField.setAttribute("type", "text");
            eyeIcon.classList.remove("hidden");
            eyeOffIcon.classList.add("hidden");
        } else {
            passwordField.setAttribute("type", "password");
            eyeOffIcon.classList.remove("hidden");
            eyeIcon.classList.add("hidden");
        }

        // Keep focus on the password field
        passwordField.focus();
    });
}

// Helper function to format contact number input
function formatContactNumber(inputElement) {
    let value = inputElement.value.replace(/\D/g, ""); // Remove non-digits

    let formattedValue = "";
    // Allow typing '0' and '09' initially
    if (value.length > 0 && value.length <= 2) {
        formattedValue = value;
    } else if (value.length > 2) {
        // Format after '09' is potentially entered
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
    const showModalButton = document.getElementById("showAddEmployeeButton");

    if (!showModalButton) {
        console.error("Add New Employee button not found");
        return;
    }

    // ------------------------------
    // Add Employee Modal
    // ------------------------------
    function openAddEmployeeModal() {
        const modalContent = `
      <form id="addEmployeeForm">
          <div class="grid grid-cols-2 gap-4">
              <!-- Row 1: First Name and Last Name -->
              <div>
                  <label for="first_name" class="block font-medium text-white">First Name</label>
                  <input type="text" id="first_name" class="block w-full p-2 text-black rounded border-2 border-secondary" placeholder="First Name" required>
              </div>
              <div>
                  <label for="last_name" class="block font-medium text-white">Last Name</label>
                  <input type="text" id="last_name" class="block w-full p-2 text-black rounded border-2 border-secondary" placeholder="Last Name" required>
              </div>
              <!-- Row 2: Contact Number and Email -->
              <div>
                  <label for="contact" class="block font-medium text-white">Contact Number</label>
                  <input type="tel" id="contact" class="block w-full p-2 text-black rounded border-2 border-secondary" placeholder="Contact Number" required>
              </div>
              <div>
                  <label for="email" class="block font-medium text-white">Email</label>
                  <input type="email" id="email" class="block w-full p-2 text-black rounded border-2 border-secondary" placeholder="Email" required>
              </div>
              <!-- Row 3: Password and Confirm Password -->
              <div>
                  <label for="password" class="block font-medium text-white">Password</label>
                  <div class="relative">
                      <input type="password" id="password" class="block w-full p-2 text-black rounded border-2 border-secondary" placeholder="Password" required>
                      <button type="button" id="togglePasswordAdd" class="absolute inset-y-0 right-0 flex items-center pr-2 focus:outline-none">
                          <!-- Eye Off Icon -->
                          <svg id="eyeOffIconAdd" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clip-rule="evenodd"/>
                              <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z"/>
                          </svg>
                          <!-- Eye Icon (hidden by default) -->
                          <svg id="eyeIconAdd" class="h-5 w-5 hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                      </button>
                  </div>
              </div>
              <div>
                  <label for="password_confirmation" class="block font-medium text-white">Confirm Password</label>
                  <div class="relative">
                      <input type="password" id="password_confirmation" class="block w-full p-2 text-black rounded border-2 border-secondary" placeholder="Confirm Password" required>
                      <button type="button" id="togglePasswordConfirmAdd" class="absolute inset-y-0 right-0 flex items-center pr-2 focus:outline-none">
                          <!-- Eye Off Icon -->
                          <svg id="eyeOffIconConfirmAdd" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clip-rule="evenodd"/>
                              <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z"/>
                          </svg>
                          <svg id="eyeIconConfirmAdd" class="h-5 w-5 hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                      </button>
                  </div>
              </div>
              <!-- Row 4: Birthday and Sex -->
              <div>
                  <label for="bday" class="block font-medium text-white">Birthday</label>
                  <input type="text" id="bday" class="block w-full p-2 text-black rounded border-2 border-secondary" placeholder="Month Day, Year" required>
              </div>
              <div>
                  <label for="sex" class="block font-medium text-white">Sex</label>
                  <select id="sex" class="block w-full p-2 text-black rounded border-2 border-secondary" required>
                      <option value="">Select Sex</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                  </select>
              </div>
              <!-- Row 5: Address spanning two columns -->
              <div class="col-span-2">
                  <label for="address" class="block font-medium text-white">Address</label>
                  <input type="text" id="address" class="block w-full p-2 text-black rounded border-2 border-secondary" placeholder="Address" required>
              </div>
          </div>
      </form>
    `;

        Swal.fire({
            title: "Add New Employee",
            html: modalContent,
            didOpen: () => {
                // Initialize flatpickr for birthday
                const today = new Date();
                const maxDate = new Date(
                    today.getFullYear() - 18,
                    today.getMonth(),
                    today.getDate()
                );
                flatpickr("#bday", {
                    dateFormat: "Y-m-d",
                    altInput: true,
                    altFormat: "F j, Y",
                    maxDate: maxDate,
                });

                // Set up password toggles using your globally defined setupPasswordToggle
                // (Assuming setupPasswordToggle is available globally from your app.js)
                setupPasswordToggle(
                    "password",
                    "togglePasswordAdd",
                    "eyeIconAdd",
                    "eyeOffIconAdd"
                );
                setupPasswordToggle(
                    "password_confirmation",
                    "togglePasswordConfirmAdd",
                    "eyeIconConfirmAdd",
                    "eyeOffIconConfirmAdd"
                );

                // Add input formatting for contact number
                const contactInputAdd = document.getElementById("contact");
                if (contactInputAdd) {
                    contactInputAdd.addEventListener("input", () =>
                        formatContactNumber(contactInputAdd)
                    );
                    // Set max length attribute for visual cue, though formatting handles actual limit
                    contactInputAdd.setAttribute("maxlength", "13");
                }
            },
            showCancelButton: false,
            showCloseButton: true,
            confirmButtonText: '<i class="fa fa-user-plus"></i>',
            customClass: {
                popup: "bg-primary",
                title: "text-highlight font-bold",
                confirmButton: "bg-green-500 text-white hover:bg-green-700",
                closeButton: "transition-transform transform hover:text-danger",
                validationMessage: "bg-secondary p-2 text-white",
            },
            preConfirm: () => {
                const firstName = document
                    .getElementById("first_name")
                    .value.trim();
                const lastName = document
                    .getElementById("last_name")
                    .value.trim();
                const email = document.getElementById("email").value.trim();
                const password = document.getElementById("password").value;
                const confirmPassword = document.getElementById(
                    "password_confirmation"
                ).value;
                const sex = document.getElementById("sex").value;
                const bday = document.getElementById("bday").value;
                const contact = document.getElementById("contact").value.trim();
                const address = document.getElementById("address").value.trim();

                if (
                    !firstName ||
                    !lastName ||
                    !email ||
                    !password ||
                    !confirmPassword ||
                    !sex ||
                    !bday ||
                    !contact ||
                    !address
                ) {
                    Swal.showValidationMessage("All fields are required.");
                    return false;
                }
                if (password !== confirmPassword) {
                    Swal.showValidationMessage("Passwords do not match.");
                    return false;
                }

                // Validate birthday using the raw value (YYYY-MM-DD)
                const birthDate = new Date(bday);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (
                    monthDiff < 0 ||
                    (monthDiff === 0 && today.getDate() < birthDate.getDate())
                ) {
                    age--;
                }
                if (birthDate > today) {
                    Swal.showValidationMessage(
                        "Birthday cannot be set to a future date."
                    );
                    return false;
                }
                if (age < 18) {
                    Swal.showValidationMessage(
                        "Employee must be at least 18 years old."
                    );
                    return false;
                }

                // Validate contact number format
                const contactRegex = /^09\d{2}-\d{3}-\d{4}$/;
                if (!contactRegex.test(contact)) {
                    Swal.showValidationMessage(
                        "Contact number must be in the format 09XX-XXX-XXXX."
                    );
                    // Keep focus on the contact field
                    const contactInput = document.getElementById("contact");
                    if (contactInput) contactInput.focus();
                    return false;
                }

                return fetch("/api/validateUser")
                    .then((response) => response.json())
                    .then((users) => {
                        const emailExists = users.some(
                            (user) => user.email === email
                        );
                        const contactExists = users.some(
                            (user) => user.contact === contact
                        );
                        if (emailExists) {
                            Swal.showValidationMessage(
                                "Email is already in use."
                            );
                            return false;
                        }
                        if (contactExists) {
                            Swal.showValidationMessage(
                                "Contact number is already in use."
                            );
                            return false;
                        }
                        return {
                            first_name: firstName,
                            last_name: lastName,
                            email: email,
                            password: password,
                            password_confirmation: confirmPassword,
                            sex: sex,
                            bday: bday,
                            contact: contact,
                            address: address,
                        };
                    })
                    .catch((error) => {
                        Swal.showValidationMessage(`Request failed: ${error}`);
                        return false;
                    });
            },
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                window.Livewire.emit("addEmployee", result.value);
                showAlert(
                    "Success!",
                    "Employee added successfully!",
                    "success"
                );
            }
        });
    }

    // ------------------------------
    // Edit Employee Modal
    // ------------------------------
    function openEditEmployeeModal(employee) {
        // Format birthday for display if needed
        const displayBday = formatDateForDisplay(employee.bday);

        // Added password fields to allow editing (optional)
        const modalContent = `
      <form id="editEmployeeForm">
          <div class="grid grid-cols-2 gap-4">
              <!-- Row 1: First Name and Last Name -->
              <div>
                  <label for="first_name" class="block font-medium text-white">First Name</label>
                  <input type="text" id="first_name" class="block w-full p-2 text-black rounded border-2 border-secondary" value="${
                      employee.first_name || ""
                  }" placeholder="First Name">
              </div>
              <div>
                  <label for="last_name" class="block font-medium text-white">Last Name</label>
                  <input type="text" id="last_name" class="block w-full p-2 text-black rounded border-2 border-secondary" value="${
                      employee.last_name || ""
                  }" placeholder="Last Name">
              </div>
              <!-- Row 2: Contact Number and Email -->
              <div>
                  <label for="contact" class="block font-medium text-white">Contact Number</label>
                  <input type="tel" id="contact" class="block w-full p-2 text-black rounded border-2 border-secondary" value="${
                      employee.contact || ""
                  }" placeholder="Contact Number">
              </div>
              <div>
                  <label for="email" class="block font-medium text-white">Email</label>
                  <input type="email" id="email" class="block w-full p-2 text-black rounded border-2 border-secondary" value="${
                      employee.email || ""
                  }" placeholder="Email">
              </div>
              <!-- Row 3: Optional Password and Confirm Password for editing -->
              <div>
                  <label for="password_edit" class="block font-medium text-white">Password</label>
                  <div class="relative">
                      <input type="password" id="password_edit" class="block w-full p-2 text-black rounded border-2 border-secondary" placeholder="New Password (optional)">
                      <button type="button" id="togglePasswordEdit" class="absolute inset-y-0 right-0 flex items-center pr-2 focus:outline-none">
                          <svg id="eyeOffIconEdit" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clip-rule="evenodd"/>
                              <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z"/>
                          </svg>
                          <svg id="eyeIconEdit" class="h-5 w-5 hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                      </button>
                  </div>
              </div>
              <div>
                  <label for="password_confirmation_edit" class="block font-medium text-white">Confirm Password</label>
                  <div class="relative">
                      <input type="password" id="password_confirmation_edit" class="block w-full p-2 text-black rounded border-2 border-secondary" placeholder="Confirm New Password (optional)">
                      <button type="button" id="togglePasswordConfirmEdit" class="absolute inset-y-0 right-0 flex items-center pr-2 focus:outline-none">
                          <svg id="eyeOffIconConfirmEdit" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clip-rule="evenodd"/>
                              <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z"/>
                          </svg>
                          <svg id="eyeIconConfirmEdit" class="h-5 w-5 hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                      </button>
                  </div>
              </div>
              <!-- Row 4: Birthday and Sex -->
              <div>
                  <label for="bday" class="block font-medium text-white">Birthday</label>
                  <input type="text" id="bday" class="block w-full p-2 text-black rounded border-2 border-secondary" value="${
                      employee.bday
                  }" placeholder="YYYY-MM-DD">
              </div>
              <div>
                  <label for="sex" class="block font-medium text-white">Sex</label>
                  <select id="sex" class="block w-full p-2 text-black rounded border-2 border-secondary">
                      <option value="">Select Sex</option>
                      <option value="male" ${
                          employee.sex === "male" ? "selected" : ""
                      }>Male</option>
                      <option value="female" ${
                          employee.sex === "female" ? "selected" : ""
                      }>Female</option>
                      <option value="other" ${
                          employee.sex === "other" ? "selected" : ""
                      }>Other</option>
                  </select>
              </div>
              <!-- Row 5: Address spanning two columns -->
              <div class="col-span-2">
                  <label for="address" class="block font-medium text-white">Address</label>
                  <input type="text" id="address" class="block w-full p-2 text-black rounded border-2 border-secondary" value="${
                      employee.address || ""
                  }" placeholder="Address">
              </div>
          </div>
      </form>
    `;

        Swal.fire({
            title: "Edit Employee Profile",
            html: modalContent,
            didOpen: () => {
                // Initialize flatpickr for birthday
                const today = new Date();
                const maxDate = new Date(
                    today.getFullYear() - 18,
                    today.getMonth(),
                    today.getDate()
                );
                flatpickr("#bday", {
                    dateFormat: "Y-m-d",
                    altInput: true,
                    altFormat: "F j, Y",
                    maxDate: maxDate,
                    defaultDate: employee.bday,
                });

                // Set up password toggles for edit modal fields
                setupPasswordToggle(
                    "password_edit",
                    "togglePasswordEdit",
                    "eyeIconEdit",
                    "eyeOffIconEdit"
                );
                setupPasswordToggle(
                    "password_confirmation_edit",
                    "togglePasswordConfirmEdit",
                    "eyeIconConfirmEdit",
                    "eyeOffIconConfirmEdit"
                );

                // Add input formatting for contact number in edit modal
                const contactInputEdit = document.getElementById("contact");
                if (contactInputEdit) {
                    contactInputEdit.addEventListener("input", () =>
                        formatContactNumber(contactInputEdit)
                    );
                    // Set max length attribute for visual cue
                    contactInputEdit.setAttribute("maxlength", "13");
                    // Initial format on load
                    formatContactNumber(contactInputEdit);
                }
            },
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
                const firstName = document
                    .getElementById("first_name")
                    .value.trim();
                const lastName = document
                    .getElementById("last_name")
                    .value.trim();
                const email = document.getElementById("email").value.trim();
                const sex = document.getElementById("sex").value;
                const bday = document.getElementById("bday").value;
                const contact = document.getElementById("contact").value.trim();
                const address = document.getElementById("address").value.trim();

                const birthDate = new Date(bday);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (
                    monthDiff < 0 ||
                    (monthDiff === 0 && today.getDate() < birthDate.getDate())
                ) {
                    age--;
                }
                if (birthDate > today) {
                    Swal.showValidationMessage(
                        "Birthday cannot be set to a future date."
                    );
                    return false;
                }
                if (age < 18) {
                    Swal.showValidationMessage(
                        "Employee must be at least 18 years old."
                    );
                    return false;
                }

                // Validate contact number format in edit modal
                const contactRegex = /^09\d{2}-\d{3}-\d{4}$/;
                if (!contactRegex.test(contact)) {
                    Swal.showValidationMessage(
                        "Contact number must be in the format 09XX-XXX-XXXX."
                    );
                    // Keep focus on the contact field
                    const contactInput = document.getElementById("contact");
                    if (contactInput) contactInput.focus();
                    return false;
                }

                return fetch("/api/validateUser")
                    .then((response) => response.json())
                    .then((users) => {
                        const emailExists = users.some(
                            (user) =>
                                user.email === email &&
                                user.user_id !== employee.id
                        );
                        const contactExists = users.some(
                            (user) =>
                                user.contact === contact &&
                                user.user_id !== employee.id
                        );
                        if (emailExists) {
                            Swal.showValidationMessage(
                                "Email is already in use."
                            );
                            setTimeout(
                                () => Swal.hideValidationMessage(),
                                3000
                            );
                            return false;
                        }
                        if (contactExists) {
                            Swal.showValidationMessage(
                                "Contact number is already in use."
                            );
                            setTimeout(
                                () => Swal.hideValidationMessage(),
                                3000
                            );
                            return false;
                        }

                        return {
                            first_name: firstName,
                            last_name: lastName,
                            email: email,
                            sex: sex,
                            bday: bday,
                            contact: contact,
                            address: address,
                        };
                    })
                    .catch((error) => {
                        Swal.showValidationMessage(`Request failed: ${error}`);
                        return false;
                    });
            },
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                window.Livewire.emit("editEmployee", result.value);
                showAlert(
                    "Success!",
                    "Employee updated successfully!",
                    "success"
                );
            }
        });
    }

    // ------------------------------
    // Archive Employee Function
    // ------------------------------
    function archiveEmployee(event) {
        event.preventDefault();
        const button = event.target.closest(".archiveEmployeeButton");
        if (!button) return;
        const row = button.closest("tr");
        if (!row) return;
        const employeeId = row.getAttribute("data-employee-id");
        if (!employeeId) {
            console.error("Employee ID not found on row");
            return;
        }
        Swal.fire({
            title: "Are you sure?",
            html: '<p class="text-white">Are you sure you want to delete this employee?</p>',
            icon: "warning",
            customClass: {
                popup: "bg-primary",
                title: "font-bold text-white",
                content: "text-white",
                confirmButton:
                    "bg-green-500 hover:bg-green-700 border-2 transition",
                closeButton: "transition-transform transform hover:text-danger",
                icon: "text-white",
            },
            showCancelButton: false,
            showCloseButton: true,
            confirmButtonText: "Yes",
        }).then((result) => {
            if (result.isConfirmed) {
                window.Livewire.emit("archiveEmployee", parseInt(employeeId));
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: "Employee has been archived.",
                    background: "#171c2f",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    customClass: {
                        title: "text-white",
                    },
                });
            }
        });
    }

    document.addEventListener("click", function (event) {
        const archiveButton = event.target.closest(".archiveEmployeeButton");
        if (archiveButton) {
            archiveEmployee(event);
        }
    });

    document.addEventListener("show-edit-employee-form", function (e) {
        openEditEmployeeModal(e.detail.employee);
    });

    showModalButton.addEventListener("click", openAddEmployeeModal);
});
