// Debug statement to verify the JS is loading
console.log("main.js is loaded");

// API URL configuration
const apiUrl = "http://localhost:8000";

// Global variables
let token = localStorage.getItem("token") || null;
let editingPropertyId = null;

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded");
    
    // Set up event listeners
    setupEventListeners();
    
    // Check if user is already logged in
    if (token) {
        document.getElementById("authSection").style.display = "none";
        document.getElementById("appSection").style.display = "block";
        fetchProperties();
    }
});

// Set up all event listeners
function setupEventListeners() {
    // Auth buttons
    document.getElementById("signupButton").addEventListener("click", signup);
    document.getElementById("loginButton").addEventListener("click", login);
    document.getElementById("logoutButton").addEventListener("click", logout);
    
    // Property button
    document.getElementById("addPropertyButton").addEventListener("click", addProperty);
}

// Authentication functions
async function signup() {
    console.log("Signup function called");
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    
    try {
        const res = await fetch(apiUrl + "/signup", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        alert(data.message);
    } catch (error) {
        alert("Error signing up: " + error);
    }
}

async function login() {
    console.log("Login function called");
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);

    try {
        const res = await fetch(apiUrl + "/login", {
            method: "POST",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: form
        });
        const data = await res.json();
        if (data.access_token) {
            token = data.access_token;
            localStorage.setItem("token", token);
            document.getElementById("authSection").style.display = "none";
            document.getElementById("appSection").style.display = "block";
            fetchProperties();
        } else {
            alert("Login failed");
        }
    } catch (error) {
        alert("Error logging in: " + error);
    }
}

function logout() {
    localStorage.removeItem("token");
    token = null;
    document.getElementById("authSection").style.display = "block";
    document.getElementById("appSection").style.display = "none";
}

// Property management functions
async function fetchProperties() {
    try {
        const res = await fetch(apiUrl + "/properties/", {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) {
            alert("Session expired. Please log in again.");
            localStorage.removeItem("token");
            location.reload();
            return;
        }

        const properties = await res.json();
        const propertyList = document.getElementById("property-listings");
        propertyList.innerHTML = "";
        
        properties.forEach(property => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            
            const visitedBadge = property.visited ? 
                '<span class="badge bg-success ms-2">Visited</span>' : 
                '<span class="badge bg-warning ms-2">Not Visited</span>';
                
            li.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5>${property.name} ${visitedBadge}</h5>
                        <p class="mb-1">${property.address}</p>
                        ${property.comments ? `<p class="text-muted small">${property.comments}</p>` : ''}
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary me-2 edit-btn" data-id="${property._id || property.id}">Edit</button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${property._id || property.id}">Delete</button>
                    </div>
                </div>
            `;
            
            propertyList.appendChild(li);
        });
        
        // Add event listeners to the edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editProperty(btn.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteProperty(btn.getAttribute('data-id')));
        });
        
    } catch (error) {
        alert("Error fetching properties: " + error);
    }
}

function editProperty(id) {
    const properties = document.getElementById("property-listings").children;
    
    for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        const editBtn = property.querySelector(".edit-btn");
        
        if (editBtn && editBtn.getAttribute("data-id") === id) {
            const nameElement = property.querySelector("h5");
            const addressElement = property.querySelector("p");
            const commentsElement = property.querySelector(".text-muted");
            const visitedBadge = property.querySelector(".badge");
            
            // Extract name (exclude the badge part)
            // This is the problematic line that needs to be fixed
            const name = nameElement.textContent.replace(visitedBadge.textContent, '').trim();
            
            document.getElementById("name").value = name;
            document.getElementById("address").value = addressElement.textContent.trim();
            document.getElementById("visited").checked = visitedBadge.classList.contains("bg-success");
            document.getElementById("comments").value = commentsElement ? commentsElement.textContent.trim() : "";
            
            editingPropertyId = id;
            
            // Change button text
            document.querySelector("#property-form button").textContent = "Update Property";
            
            break;
        }
    }
}

async function addProperty() {
    const name = document.getElementById("name").value;
    const address = document.getElementById("address").value;
    const visited = document.getElementById("visited").checked;
    const comments = document.getElementById("comments").value;
    
    const propertyData = {
        name,
        address,
        visited,
        comments
    };
    
    try {
        let endpoint, method;
        
        if (editingPropertyId) {
            endpoint = `/properties/${editingPropertyId}`;
            method = "PUT";
        } else {
            endpoint = "/properties/";
            method = "POST";
        }
        
        const res = await fetch(apiUrl + endpoint, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(propertyData)
        });

        if (res.status === 401) {
            alert("Session expired. Please log in again.");
            localStorage.removeItem("token");
            location.reload();
            return;
        }

        // Reset form and editing state
        document.getElementById("property-form").reset();
        document.querySelector("#property-form button").textContent = "Add Property";
        editingPropertyId = null;
        
        fetchProperties();
    } catch (error) {
        alert("Error saving property: " + error);
    }
}

async function deleteProperty(id) {
    if (confirm("Are you sure you want to delete this property?")) {
        try {
            const res = await fetch(apiUrl + "/properties/" + id, {
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                alert("Session expired. Please log in again.");
                localStorage.removeItem("token");
                location.reload();
                return;
            }

            fetchProperties();
        } catch (error) {
            alert("Error deleting property: " + error);
        }
    }
}