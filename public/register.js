document.getElementById("register-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const username = formData.get("username");
    const password = formData.get("password");
    const avatar = formData.get("avatar");

    try {
        const response = await fetch("/reg", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password, avatar }),
        });

        const data = await response.json();

        if (response.status === 201) {
            // Redirect to the login page
            showOk('User created successfully!')
            // Wait for 2 seconds
            setTimeout(function () {
                // Redirect to the login page
                window.location.href = "/login";
            }, 1000);
        } else if (response.status === 400) {
            // Handle validation errors
            showError(data.errors.map(error => error.msg).join(", "));
        } else if (response.status === 409) {
            // Handle the "Username already exists" error
            showError(data.error);
        } else {
            // Handle unexpected response statuses
            throw new Error("Unexpected response status");
        }
    } catch (error) {
        // Show a generic error message
        showError("An error occurred. Please try again later.");
    }
});

function showError(message) {
    const errorMessage = document.getElementById("error-message");
    errorMessage.innerText = message;
    errorMessage.style.display = "block";
}

function showOk(message) {
    const successMessage = document.getElementById("error-message");
    successMessage.classList.remove("error-message");
    successMessage.classList.add("new-class");
    successMessage.setAttribute("id", 'success-message');
    successMessage.innerText = message;
    successMessage.style.display = "block";
}