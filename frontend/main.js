const apiUrl = 'http://127.0.0.1:8000'; 

async function fetchProperties() {
  const response = await fetch(`${apiUrl}/properties/`);
  const properties = await response.json();
  const propertyList = document.getElementById("property-listings");
  propertyList.innerHTML = '';
  properties.forEach(property => {
    const li = document.createElement("li");
    li.classList.add("list-group-item"); 
    li.innerHTML = `
      <strong>${property.name}</strong> - ${property.address}
      <button class="btn btn-sm edit-btn float-end ms-2" onclick="editProperty(${property.id}, '${property.name}', '${property.address}', '${property.comments}', ${property.visited})">Edit</button>
      <button class="btn btn-sm delete-btn float-end" onclick="deleteProperty(${property.id})">Delete</button>
      <p>Visited: ${property.visited ? 'Yes' : 'No'}</p>
      <p>Comments: ${property.comments}</p>
    `;
    propertyList.appendChild(li); 
  });
}

// Adding new prop.
async function addProperty() {
  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;
  const newProperty = { id: Date.now(), name, address, visited: false, comments: '' };

  await fetch(`${apiUrl}/properties/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProperty)
  });
  
  fetchProperties();
}

// editing property
async function editProperty(id, originalName, originalAddress, originalComments, originalVisited) {
  const visited = prompt("Mark as visited? (yes/no)", originalVisited ? "yes" : "no") === "yes";
  const comments = prompt("Add comments:", originalComments);

  const updatedProperty = {
    id,
    name: originalName, // keeps the name
    address: originalAddress, // keeps the address
    visited,
    comments
  };

  await fetch(`${apiUrl}/properties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedProperty)
  });

  fetchProperties();
}

// Delete 
async function deleteProperty(id) {
  await fetch(`${apiUrl}/properties/${id}`, {
    method: 'DELETE',
  });

  fetchProperties();
}


fetchProperties();
