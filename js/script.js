/*function loadProfile() {
    const userData = JSON.parse(localStorage.getItem("user"));

    if (!userData) {
        window.location.href = "./"; // Redirect to login if no user data
        return;
    }

    // Fetch latest data from MongoDB to update localStorage
    fetch("http://localhost:3000/getUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email }) // Fetch user by email
    })
        .then(res => res.json())
        .then(data => {
            if (data.user) {
                console.log("Updated User Data from MongoDB:", data.user);

                // Update localStorage with fresh data
                localStorage.setItem("user", JSON.stringify(data.user));

                // Update UI with new data
                if (document.getElementById("profile-pic")) {
                    document.getElementById("profile-pic").src = data.user.picture;
                    document.getElementById("profile-role").textContent = data.user.occupation;
                    document.getElementById("profile-name").textContent = data.user.name;
                    document.getElementById("followers-count").textContent = data.user.followers;
                    document.getElementById("following-count").textContent = data.user.following;
                }


                document.getElementById("top-right-profile").src = data.user.picture;
                document.getElementById("top-right-profile").alt = data.user.name;

            } else {
                console.error("Failed to fetch updated user data.");
            }
        })
        .catch(err => console.error("Error fetching updated user data:", err));
}*/

function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("selectedUser");
    window.location.href = "./";
}

function initializeGoogleLogin() {
    google.accounts.id.initialize({
        client_id: "711965293983-4g0ra7q68bnl03gg5kisiegpo5amabhe.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        { theme: "outline", size: "large" }
    );

    google.accounts.id.prompt();
}

function handleCredentialResponse(response) {
    const idToken = response.credential;

    fetch("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + idToken)
        .then(res => res.json())
        .then(userData => {
            console.log("User Info:", userData);

            fetch("http://localhost:3000/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    googleId: userData.sub,
                    name: userData.name,
                    email: userData.email,
                    picture: userData.picture
                })
            })
                .then(async res => {
                    const data = await res.json();
                    console.log("Server Response:", data);

                    if (!res.ok) throw new Error(data.error || "Unknown error");

                    localStorage.setItem("user", JSON.stringify(data.user));
                    window.location.href = "/html/home.html";
                })
                .catch(err => console.error("Error sending data to server:", err));
        })
        .catch(err => console.error("Error verifying ID token:", err));
}

window.onload = function () {
    const selectedUser = JSON.parse(localStorage.getItem("selectedUser"));
    const loggedInUser = JSON.parse(localStorage.getItem("user"));

    if (window.location.pathname.includes("profile.html")) {
        if (selectedUser) {
            loadProfile(selectedUser);
        } else if (loggedInUser) {
            loadProfile(loggedInUser);
        } else {
            console.error("No user data found.");
            window.location.href = "/html/home.html";
        }
    } else if (window.location.pathname.includes("home.html")) {
        loadProfile(loggedInUser);
    } else if (window.location.pathname.includes("create.html")) {
        loadProfile(loggedInUser);
    } else {
        if (!loggedInUser) {
            initializeGoogleLogin();
        } else {
            window.location.href = "/html/home.html";
        }
    }
};



function loadProfile(user) {
    if (!user) {
        console.error("User data is missing.");
        return;
    }

    console.log("Loading profile for:", user.name); // Debugging

    document.getElementById("top-right-profile").src = user.picture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
    if (document.getElementById("profile-pic")) {
        document.getElementById("profile-pic").src = user.picture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
        document.getElementById("profile-name").textContent = user.name;
        document.getElementById("profile-role").textContent = user.occupation || "Unknown";
        document.getElementById("followers-count").textContent = user.followers.length || 0;
        document.getElementById("following-count").textContent = user.following.length || 0;

        checkFollowStatus(user.email, document.getElementById("follow-btn"));
        document.getElementById("follow-btn").onclick = () => toggleFollow(user.email, document.getElementById("follow-btn")); // Attach event
    }
}

function home() {
    window.location.href = "/html/home.html"
    localStorage.setItem("selectedUser", localStorage.getItem("user"));
}

function profileOpen() {
    localStorage.setItem("selectedUser", localStorage.getItem("user"));
}

const sidebar = document.querySelector(".sidebar");
const profileContainer = document.querySelector(".profile-container");
const postContainer = document.querySelector("#post-container")
const accountContainer = document.querySelector("#account-container-small")
const featuredContainer = document.querySelector("#featured-container")
const sidebarToggle = document.getElementById("sidebar-toggle");

sidebarToggle.addEventListener("click", function (event) {
    if (profileContainer) {
        profileContainer.classList.toggle("shifted");
    }

    if (postContainer) {
        postContainer.classList.toggle("shifted");
    }


    if (featuredContainer) {
        featuredContainer.classList.toggle("shifted");
    }

    if (accountContainer) {
        accountContainer.classList.toggle("shifted")
    }

    if (sidebar.classList.contains("open")) {
        sidebarToggle.style.opacity = "0";
        sidebarToggle.style.pointerEvents = "none";
    } else {
        sidebarToggle.style.opacity = "1";
        sidebarToggle.style.pointerEvents = "auto";
    }

    sidebar.classList.toggle("open");

    event.stopPropagation();
});

document.addEventListener("click", function (event) {
    if (sidebar.classList.contains("open") && !sidebar.contains(event.target) && event.target !== sidebarToggle) {
        sidebar.classList.remove("open");
        if (profileContainer) {
            profileContainer.classList.remove("shifted");
        }

        if (postContainer) {
            postContainer.classList.remove("shifted");
        }

        if (featuredContainer) {
            featuredContainer.classList.remove("shifted");
        }

        if (accountContainer) {
            accountContainer.classList.remove("shifted")
        }

        sidebarToggle.style.opacity = "1";
        sidebarToggle.style.pointerEvents = "auto";
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const searchElement = document.getElementById("searchElement");
    const searchBox = document.getElementById("searchBox");
    const searchInput = document.getElementById("searchInput");
    const suggestionsBox = document.getElementById("suggestions");

    if (searchElement) {
        // Open Search Box
        searchElement.addEventListener("click", () => {
            searchElement.classList.add("hidden");
            setTimeout(() => {
                searchElement.style.display = "none";
                searchBox.style.display = "flex";
                setTimeout(() => {
                    searchBox.classList.add("active");
                    searchInput.focus();
                }, 10);
            }, 300);
        });

        // Close Search Box when clicking outside
        document.addEventListener("click", (event) => {
            if (!searchBox.contains(event.target) && event.target !== searchElement) {
                searchBox.classList.remove("active");
                setTimeout(() => {
                    searchBox.style.display = "none";
                    searchElement.style.display = "inline-block";
                    setTimeout(() => {
                        searchElement.classList.remove("hidden");
                    }, 10);
                }, 300);
                suggestionsBox.style.display = "none";
            }
        });

        // Fetch user suggestions from backend
        searchInput.addEventListener("input", async () => {
            const query = searchInput.value.trim();

            if (!query) {
                suggestionsBox.style.display = "none";
                return;
            }

            try {
                const response = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(query)}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const users = await response.json();

                // Ensure users is an array
                if (!Array.isArray(users) || users.length === 0) {
                    suggestionsBox.innerHTML = "<h2>No Results Found</h2>";
                    suggestionsBox.style.display = "block";
                    return;
                }

                suggestionsBox.innerHTML = ""; // Clear previous suggestions

                const fragment = document.createDocumentFragment(); // Optimize DOM updates

                users.forEach(user => {
                    const div = document.createElement("div");
                    div.classList.add("suggestion");

                    div.innerHTML = `
                        <img src="${user.picture || '/img/default-profile.png'}" alt="${user.name}">
                        <div>
                            <strong>${user.name}</strong>
                            <br>
                            <span style="font-size: 12px; opacity: 0.8;">${user.occupation || 'Unknown'}</span>
                        </div>
                    `;

                    div.addEventListener("click", () => {
                        // Save user data in localStorage & Redirect to profile
                        localStorage.setItem("selectedUser", JSON.stringify(user));
                        window.location.href = `./profile.html?user=${encodeURIComponent(user.name)}`;
                    });

                    fragment.appendChild(div);
                });

                suggestionsBox.appendChild(fragment); // Batch append to reduce reflows
                suggestionsBox.style.display = "flex";
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            }
        });
    }

    if (window.location.pathname.includes("profile.html")) {
        const urlParams = new URLSearchParams(window.location.search);
        const userName = urlParams.get("user");

        if (!userName) {
            console.error("No user specified in URL");
            return;
        }

        try {
            // Fetch the selected user’s data from the backend
            const response = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(userName)}`);

            if (!response.ok) {
                throw new Error(`User not found: ${response.status}`);
            }

            const unparsed = await response.json();
            const user = unparsed[0]

            console.log(user)

            // Save selected user in localStorage (override current session)
            localStorage.setItem("selectedUser", JSON.stringify(user));

            // Update UI with fetched user data
            const profilePic = document.getElementById("profile-pic");
            const profileName = document.getElementById("profile-name");
            const profileRole = document.getElementById("profile-role");
            const followersCount = document.getElementById("followers-count");
            const followingCount = document.getElementById("following-count");

            if (profilePic && profileName && profileRole && followersCount && followingCount) {
                profilePic.src = user.picture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
                profileName.textContent = user.name;
                profileRole.textContent = user.occupation || "Unknown";
                followersCount.textContent = user.followers.length || 0;
                followingCount.textContent = user.following.length || 0;
            } else {
                console.error("Profile elements not found.");
            }

            // Load logged-in user for top-right profile icon
            const loggedin = JSON.parse(localStorage.getItem("user"));
            if (loggedin) {
                document.getElementById("top-right-profile").src = loggedin.picture || "/img/default-profile.png";
            }

        } catch (error) {
            console.error("Profile Fetch Error:", error);
        }
    }

    const profileLink = document.getElementById("profile-link"); // Sidebar profile button
    const loggedInUser = JSON.parse(localStorage.getItem("user"));

    if (profileLink && loggedInUser && loggedInUser.name) {
        profileLink.href = `./profile.html?user=${encodeURIComponent(loggedInUser.name)}`;
    } else if (profileLink) {
        profileLink.href = "./login.html"; // Redirect to login if not logged in
    }
});

const user = JSON.parse(localStorage.getItem("user"));
let localmail = user ? user.email : null;

async function loadUsers() {
    try {
        const response = await fetch("http://localhost:3000/api/users"); // Fetch from backend
        const users = await response.json();
        const container = document.getElementById("account-content-small");
        if (!container) {
            return
        }

        users.forEach(async (user) => {
            const userDiv = document.createElement("div");
            userDiv.classList.add("scroll-item-small");

            // Create profile link
            const profileLink = document.createElement("a");
            profileLink.href = `/html/profile.html?user=${user.name}`;
            profileLink.style.textDecoration = "none"; // Removes underline
            profileLink.style.color = "inherit"; // Keeps original text color
            profileLink.onclick = () => loadUserProfile(user); // Pass user data

            // User profile picture
            const img = document.createElement("img");
            img.classList.add("profile-pic-small");
            img.src = user.picture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
            img.alt = "Profile Picture";

            // Username
            const usernameDiv = document.createElement("div");
            usernameDiv.classList.add("username-small");
            usernameDiv.textContent = user.name;

            // Append image & username to profile link
            profileLink.appendChild(img);
            profileLink.appendChild(usernameDiv);

            // Follow button
            const followBtn = document.createElement("button");
            followBtn.classList.add("follow-small");
            followBtn.textContent = "Follow";
            followBtn.dataset.userEmail = user.email; // Store target user email

            let you = followBtn.getAttribute("data-user-email");

            if (you === localmail) {
                followBtn.innerHTML = "<b>You</b>"
                followBtn.style.backgroundColor = "#1a7a54"
            }

            // Check follow status before rendering
            await checkFollowStatus(user.email, followBtn);

            followBtn.onclick = () => toggleFollow(user.email, followBtn); // Attach event

            // Append elements to userDiv
            userDiv.appendChild(profileLink);
            userDiv.appendChild(followBtn);
            container.appendChild(userDiv);
        });
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

async function updateFollowerCount(viewmail) {
    try {
        const response = await fetch(`http://localhost:3000/get-followers?targetEmail=${encodeURIComponent(viewmail)}`);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            if (document.getElementById("followers-count")) {
                document.getElementById("followers-count").textContent = data.followerCount;
            }
        }
    } catch (error) {
        console.error("Error fetching updated follower count:", error);
    }
}

async function checkFollowStatus(targetEmail, button) {
    if (!localmail || !targetEmail) return;
    if (localmail === targetEmail) {
        if (document.querySelector(".follow-small")) {
            button.innerHTML = "<b>You</b>"
        } else if (document.getElementById("follow-btn")) {
            button.textContent = "Configure Profile"
            button.onclick = () => {
                window.location.href = "/html/settings.html";
            };
        }
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/check-follow?userEmail=${encodeURIComponent(localmail)}&targetEmail=${encodeURIComponent(targetEmail)}`);
        const data = await response.json();

        if (data.success) {
            button.textContent = data.isFollowing ? "Following" : "Follow";
            if (document.querySelector(".follow-small")) {
                button.classList.toggle("followed-small", data.isFollowing);
            } else if (document.getElementById("follow-btn")) {
                button.classList.toggle("followed-button", data.isFollowing);
            }

            await updateFollowerCount(targetEmail)
        }
    } catch (error) {
        console.error("Error checking follow status:", error);
    }
}

async function toggleFollow(targetEmail, button) {
    if (!localmail || !targetEmail) return;
    if (localmail === targetEmail) {
        if (document.querySelector(".follow-small")) {
            button.innerHTML = "<b>You</b>"
        } else if (document.getElementById("follow-btn")) {
            button.textContent = "Configure Profile"
            button.onclick = () => {
                window.location.href = "/html/settings.html";
            };
        }
        return;
    }

    try {
        button.disabled = true;

        const response = await fetch(`http://localhost:3000/follow?userEmail=${encodeURIComponent(localmail)}&targetEmail=${encodeURIComponent(targetEmail)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();
        if (data.success) {
            const isFollowing = data.isFollowing;
            button.textContent = isFollowing ? "Following" : "Follow";
            if (document.querySelector(".follow-small")) {
                button.classList.toggle("followed-small", data.isFollowing);
            } else if (document.getElementById("follow-btn")) {
                button.classList.toggle("followed-button", data.isFollowing);
            }

            await updateFollowerCount(targetEmail)

            const profileFollowBtn = document.getElementById("follow-btn");
            if (profileFollowBtn) {
                profileFollowBtn.textContent = isFollowing ? "Following" : "Follow";
                profileFollowBtn.classList.toggle("followed-button", isFollowing);
            }

        }
    } catch (error) {
        console.error("Follow request failed:", error);
    } finally {
        button.disabled = false;
    }
}


function loadUserProfile(user) {
    localStorage.setItem("selectedUser", JSON.stringify(user));
}

document.addEventListener("DOMContentLoaded", loadUsers);

document.addEventListener("DOMContentLoaded", function () {
    const loadingBar = document.getElementById("loading-bar");

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        loadingBar.style.width = progress + "%";
    }, 150);

    window.addEventListener("load", () => {
        clearInterval(interval);
        loadingBar.style.width = "100%";
        setTimeout(() => {
            loadingBar.style.opacity = "0";
        }, 400);
    });
});

function renderPosts(posts) {
    const postContainer = document.getElementById("posts-container-containing");
    postContainer.innerHTML = "";

    posts.forEach(post => {
        const postElement = document.createElement("div");
        postElement.classList.add("post");

        let postContent = `<h3 class="post-title">${post.title}</h3>`;
        
        postContent += `
            <p class="post-content">${post.content}</p>
        `;

        if (post.image) {
            postContent += `<img src="${post.image}" alt="Post Image" class="post-image">`;
        }

        postElement.innerHTML = postContent;
        postContainer.appendChild(postElement);
    });
}



async function fetchAndRenderPosts() {
    try {
        let email = JSON.parse(localStorage.getItem("selectedUser")).email;
        const response = await fetch(`http://localhost:3000/api/posts/${email}`);

        if (!response.ok) {
            throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        renderPosts(data.posts); // Call renderPosts with the posts array
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
}

if (document.querySelector("#post-container")) {
    document.addEventListener("DOMContentLoaded", fetchAndRenderPosts);
}