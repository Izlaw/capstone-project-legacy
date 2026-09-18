import moment from "moment-timezone"; // Make sure to import moment-timezone

document.addEventListener("DOMContentLoaded", function () {
    const messageInput = document.getElementById("message-input");
    const messageForm = document.getElementById("message-form");
    const messageList = document.getElementById("messages");
    const conversationId = document
        .querySelector('meta[name="conversation-id"]')
        .getAttribute("content");
    const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content");
    const userId = parseInt(
        document.querySelector('meta[name="user-id"]').getAttribute("content")
    );

    // Ensure the conversation ID exists
    if (!conversationId) {
        console.error("Conversation ID is not defined!");
    } else {
        // Listen for new messages in the private channel using Echo
        window.Echo.private("chat." + conversationId).listen(
            "MessageSent",
            (event) => {
                console.log("Message received:", event); // Debug logging

                // Check if the message content is an image URL
                const messageContent =
                    event.message.messContent || event.message; // Try both formats
                console.log("Message content:", messageContent); // Debug logging

                const imageExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
                const isImage =
                    typeof messageContent === "string" &&
                    imageExtensions.test(messageContent);

                // Create the message element
                const newMessageElement = document.createElement("li");
                newMessageElement.classList.add(
                    "mb-2",
                    "flex",
                    event.senderId === userId ? "text-right" : "text-left",
                    event.senderId === userId ? "ml-auto" : "mr-auto"
                );

                // Use moment-timezone to format the time
                const messageTime = moment();
                const formattedTime = messageTime.format("hh:mm A");

                // Prepare message content HTML based on whether it's an image or text
                let messageHTML = "";
                if (isImage) {
                    // Add a timestamp to bust cache
                    const timestamp = new Date().getTime();
                    const imageUrl = messageContent + "?" + timestamp;
                    messageHTML = `<img src="${imageUrl}" alt="Uploaded Image" class="max-w-xs mx-auto mt-2">`;
                } else {
                    // For text messages, use the appropriate content property
                    const textContent =
                        typeof messageContent === "string"
                            ? messageContent
                            : event.message.messContent ||
                              event.message ||
                              "No content available";
                    messageHTML = `<span class="bg-accent text-white p-2 rounded-lg inline-block">${textContent}</span>`;
                }

                // Set the HTML content
                newMessageElement.innerHTML = `
                <div>
                    <strong class="text-white">${
                        event.senderId === userId
                            ? "You"
                            : event.user.first_name + " " + event.user.last_name
                    } (${messageTime.format("h:mm A")})</strong><br>
                    ${messageHTML}
                </div>
                `;

                messageList.appendChild(newMessageElement);
                messageList.scrollTop = messageList.scrollHeight;
            }
        );
    }

    messageForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const message = messageInput.value.trim();

        if (message) {
            let sendMessageUrl = "/send-message";
            if (window.location.pathname.includes("/helpdesk/")) {
                sendMessageUrl = "/send-message"; // Employee uses the same route
            }

            fetch(sendMessageUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    message: message,
                    convoID: conversationId,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        messageInput.value = "";
                    } else if (data.error) {
                        console.error(data.error);
                    }
                })
                .catch((error) =>
                    console.error("Error sending message:", error)
                );
        }
    });

    function fetchMessages(convoID) {
        let messagesUrl = `/messages/${convoID}`;
        if (window.location.pathname.includes("/helpdesk/")) {
            messagesUrl = `/helpdesk/messages/${convoID}`;
        }
        fetch(messagesUrl)
            .then((response) => response.json())
            .then((data) => {
                if (data.messages && data.messages.length) {
                    messageList.innerHTML = ""; // Clear existing messages

                    const fragment = document.createDocumentFragment();

                    data.messages.forEach((message) => {
                        const newMessage = document.createElement("li");
                        newMessage.className =
                            message.user_id === userId
                                ? "text-right ml-auto"
                                : "text-left mr-auto";

                        const messageTime = moment(message.messDate);

                        const isOlderThanDay = messageTime.isBefore(
                            moment().subtract(1, "day")
                        );

                        const formattedDate = isOlderThanDay
                            ? messageTime.format("MMM D YYYY")
                            : "";
                        const formattedTime = messageTime.format("hh:mm A");

                        // Check if the message content is a valid image URL
                        let messageContent = "";

                        const imageExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
                        if (imageExtensions.test(message.messContent)) {
                            // If it's an image, display the image with cache busting
                            const timestamp = new Date().getTime();
                            const imageUrl =
                                message.messContent + "?" + timestamp;
                            messageContent = `<img src="${imageUrl}" alt="Uploaded Image" class="max-w-xs mx-auto mt-2">`;
                        } else {
                            // If it's a regular text message, display the text
                            messageContent = `<span class="bg-accent text-white p-2 rounded-lg inline-block">${message.messContent}</span>`;
                        }

                        newMessage.innerHTML = `
                        <div>
                            <strong class="text-white">${
                                message.user_id === userId
                                    ? "You"
                                    : message.user.first_name +
                                      " " +
                                      message.user.last_name
                            } (<span class="text-white">${formattedTime}</span>)</strong><br>
                            ${messageContent}
                        </div>
                    `;

                        fragment.appendChild(newMessage);
                    });

                    messageList.appendChild(fragment);

                    scrollToBottom();
                }
            })
            .catch((error) => {
                console.error("Error fetching messages:", error);
            });
    }

    function scrollToBottom() {
        const messageList = document.getElementById("messages");
        const chatContainer = document.getElementById("chat-container");
        if (messageList && chatContainer) {
            messageList.scrollTop = messageList.scrollHeight;
        }
    }

    fetchMessages(conversationId);
});

window.uploadImage = function uploadImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var formData = new FormData();
            formData.append("image", input.files[0]);
            formData.append(
                "_token",
                document
                    .querySelector('meta[name="csrf-token"]')
                    .getAttribute("content")
            );
            formData.append(
                "convoID",
                document
                    .querySelector('meta[name="conversation-id"]')
                    .getAttribute("content")
            );

            fetch("/send-image", {
                method: "POST",
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        console.log("Image uploaded successfully");
                        // Optionally, clear the input
                        input.value = "";
                    } else {
                        console.error("Error uploading image:", data.error);
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        };

        reader.readAsDataURL(input.files[0]);
    }
};
