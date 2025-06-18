document.addEventListener("DOMContentLoaded", () => {
    const postForm = document.getElementById("post-form");
    const postTitle = document.getElementById("post-title");
    const postContent = document.getElementById("post-content");
    const postImage = document.getElementById("post-image");

    const previewTitle = document.getElementById("preview-title");
    const previewText = document.getElementById("preview-text");
    const previewImg = document.getElementById("preview-img");

    let imageData = null;
    let email = JSON.parse(localStorage.user);
    const userId = email.email;

    postTitle.addEventListener("input", () => {
        previewTitle.textContent = postTitle.value || "Your Title Preview";
    });

    postContent.addEventListener("input", () => {
        previewText.textContent = postContent.value || "Your post preview will appear here...";
    });

    postImage.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                imageData = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            previewImg.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/800px-Placeholder_view_vector.svg.png";
            imageData = null;
        }
    });

    postForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const postData = {
            title: postTitle.value,
            content: postContent.value,
            image: imageData
        };

        try {
            const response = await fetch(`http://localhost:3000/api/posts/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(postData)
            });

            if (response.ok) {
                alert("Post submitted successfully!");
                postForm.reset();
                previewTitle.textContent = "Your Title Preview";
                previewText.textContent = "Your post preview will appear here...";
                previewImg.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/800px-Placeholder_view_vector.svg.png";
            } else {
                alert("Failed to submit post. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting post:", error);
            alert("An error occurred. Please try again later.");
        }
    });
});
