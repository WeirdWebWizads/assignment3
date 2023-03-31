document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
        const response = await fetch("/auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.status === 200) {
            window.location.href = "/";
        } else if (response.status === 401) {
            const data = await response.json();
            showError(data.error);
        } else {
            throw new Error("Unexpected response status");
        }
    } catch (error) {
        showError("An error occurred. Please try again later.");
    }
});

function showError(message) {
    const errorMessage = document.getElementById("error-message");
    errorMessage.innerText = message;
    errorMessage.style.display = "block";
}
