const logOutButton = document.getElementById("logOut");
const profile = document.getElementById("profile");
const contentDiv = document.querySelector(".content-div");
const projectsMenu = document.getElementById("projectsmenu");
const subscribe = document.getElementById("subscribeButton");

logOutButton.addEventListener("click", () => {
    fetch("/logout", { method: "GET" })
    .then(response => {
        if (response.ok) {
            if (response.redirected) {
                window.location.href = response.url; 
            }
        } else {
            console.error("Logout failed", response.status);
        }
    })
    .catch(error => {
        console.error("Error during logout:", error);
    });
});

document.getElementById("offLogOut").addEventListener("click", () => {
  fetch("/logout", { method: "GET" })
  .then(response => {
      if (response.ok) {
          if (response.redirected) {
              window.location.href = response.url; 
          }
      } else {
          console.error("Logout failed", response.status);
      }
  })
  .catch(error => {
      console.error("Error during logout:", error);
  });
});

function attachEventListeners() {
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const field = e.target.getAttribute('data-field');
      const displaySpan = document.getElementById(field + 'Display');

      if (e.target.textContent === 'Edit') {
        const currentValue = displaySpan.textContent;
        displaySpan.innerHTML = `<input type="text" id="${field}Input" value="${currentValue}" />`;
        e.target.textContent = 'Save';
      } else {
        const newValue = document.getElementById(field + 'Input').value;
        if (newValue !== previousData[field]) {
          updateData[field] = newValue;
        } else {
          delete updateData[field];
        }
        displaySpan.textContent = newValue;
        e.target.textContent = 'Edit';
      }
    });
  });

  document.getElementById("confirmChanges").addEventListener("click", () => {
    fetch('/profile/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        console.log("Profile updated successfully:", updateData);
        document.getElementById("profileUpdateInfo").textContent = "Profile updated successfully";
        previousData = { ...previousData, ...updateData };
        updateData = {};
      } else {
        console.error("Error updating profile:", result.message);
        document.getElementById("profileUpdateInfo").textContent = "Error updating profile: " + result.message;
      }
    })
    .catch(err => console.error(err));
  });

  document.getElementById("cancelChanges").addEventListener("click", () => {
    contentDiv.innerHTML = profileChange(previousData);
    updateData = {};
    attachEventListeners(); // Reapply listeners again after canceling
  });
}

let updateData = {};
let previousData = {};

const profileChange = (data) => {
  return `
    <div id = "profileDiv">
    <ul class="list-group list-group-flush" style = "background-color:rgb(162, 164, 165);font-size:15px;">
      <li class="list-group-item">
        <b>Name (Company/Person): </b><span class = "profileSpan" id="usernameDisplay">${data.username || ''}</span>
      </li>
      <li class="list-group-item">
      <b>Position: </b><span  class = "profileSpan" id="positionDisplay">${data.position || ''}</span>
        <button class="edit-btn" data-field="position">Edit</button>
      </li>
      <li class="list-group-item">
      <b>Email Address: </b><span  class = "profileSpan" id="emailDisplay">${data.email || ''}</span>
      </li>
      <li class="list-group-item">
      <b>Phone Number: </b><span  class = "profileSpan" id="phoneDisplay">${data.phone || ''}</span>
      </li>
      <li class="list-group-item">
      <b>Business Address: </b><span  class = "profileSpan" id="addressDisplay">${data.address || ''}</span>
        <button class="edit-btn" data-field="address">Edit</button>
      </li>
      <li class="list-group-item">
      <b>Nature of Business: </b><span  class = "profileSpan" id="natureDisplay">${data.nature || ''}</span>
        <button class="edit-btn" data-field="nature">Edit</button>
      </li>
    </ul>
    <p id = "profileUpdateInfo" class = "text-center fw-bold text-light m-2"></p>
    <div class="d-flex justify-content-start">
    <button id="confirmChanges" class = "mt-3">Confirm Changes</button>
    <button id="cancelChanges" class = "mt-3">Cancel</button>
    </div>
    </div>
  `;
};

function loadProfile() {
  document.getElementById("welcomeMsg").style.display = "none";

  fetch("/epdmxapi/profile")
    .then(response => response.json())
    .then(data => {
      previousData = { ...data };
      updateData = {}; 
      contentDiv.innerHTML = profileChange(data);

      document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          const field = e.target.getAttribute('data-field');
          const displaySpan = document.getElementById(field + 'Display');

          if (e.target.textContent === 'Edit') {
            const currentValue = displaySpan.textContent;
            displaySpan.innerHTML = `<input type="text" id="${field}Input" value="${currentValue}" />`;
            e.target.textContent = 'Save';
          } else {
            const newValue = document.getElementById(field + 'Input').value;
            if (newValue !== previousData[field]) {
              updateData[field] = newValue;  
            } else {
              delete updateData[field];
            }
            displaySpan.textContent = newValue;
            e.target.textContent = 'Edit';
          }
        });
      });

      document.getElementById("confirmChanges").addEventListener("click", () => {
        fetch('/profile/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })
          .then(response => response.json())
          .then(result => {
            if (result.success) {
              console.log("Profile updated successfully:", updateData);
              document.getElementById("profileUpdateInfo").textContent = "Profile updated successfully";
              previousData = { ...previousData, ...updateData };
              updateData = {};
            } else {
              console.error("Error updating profile:", result.message);
              document.getElementById("profileUpdateInfo").textContent = "Error updating profile: " + result.message;
            }
          })
          .catch(err => console.error(err));
      });

      document.getElementById("cancelChanges").addEventListener("click", () => {
        contentDiv.innerHTML = profileChange(previousData);
        updateData = {};
        attachEventListeners();
      });
    })
    .catch(err => console.error(err));
}

// Attach event listeners to multiple elements
document.querySelectorAll("#profile, #offProfile").forEach(element => {
  element.addEventListener("click", loadProfile);
});


const fieldMappings = {
  projectId: "Project ID",
  projectName: "Project Name",
  location: "Location",
  capacity: "Capacity",
  client: "Client",
  clientHomeCounty: "Client Home County",
  projectPartnersStakeholders: "Project Partners & Stakeholders",
  mainContractor: "Main Contractor",
  estimatedBudget: "Estimated Budget",
  contractValue: "Contract Value",
  localSpending: "Local Spending",
  foreignSpending: "Foreign Spending",
  projectScope: "Project Scope",
  awardDate: "Award Date",
  projectStartUpDate: "Project Start-up Date",
  projectCompletionDate: "Project Completion Date",
  projectStatus: "Project Status",
  projectSchedule: "Project Schedule",
  localContentPlans: "Local Content Plans",
  majorMilestones: "Major Milestones",
  projectOverview: "Project Overview",
  classification: "Classification",
  projectFinance: "Project Finance",
  subContractors: "Subcontractors",
  section: "Section",
  
  // Client-side project manager details
  projectManagerNameClient: "Project Manager Name (Client)",
  projectManagerTelephoneClient: "Project Manager Telephone (Client)",
  projectManagerEmailClient: "Project Manager Email (Client)",
  projectCoordinatorNameClient: "Project Coordinator Name (Client)",
  projectCoordinatorTelephoneClient: "Project Coordinator Telephone (Client)",
  projectCoordinatorEmailClient: "Project Coordinator Email (Client)",
  projectProcurementManagerNameClient: "Procurement Manager Name (Client)",
  projectProcurementManagerTelephoneClient: "Procurement Manager Telephone (Client)",
  projectProcurementManagerEmailClient: "Procurement Manager Email (Client)",

  // Main contractor project manager details
  projectManagerNameMainContractor: "Project Manager Name (Main Contractor)",
  projectManagerTelephoneMainContractor: "Project Manager Telephone (Main Contractor)",
  projectManagerEmailMainContractor: "Project Manager Email (Main Contractor)",
  projectCoordinatorNameMainContractor: "Project Coordinator Name (Main Contractor)",
  projectCoordinatorTelephoneMainContractor: "Project Coordinator Telephone (Main Contractor)",
  projectCoordinatorEmailMainContractor: "Project Coordinator Email (Main Contractor)",
  projectProcurementManagerNameMainContractor: "Procurement Manager Name (Main Contractor)",
  projectProcurementManagerTelephoneMainContractor: "Procurement Manager Telephone (Main Contractor)",
  projectProcurementManagerEmailMainContractor: "Procurement Manager Email (Main Contractor)"
};

function filterEmptyValues(obj) {
  return Object.entries(obj)
    .filter(([key, value]) =>
      key !== '_id' &&           // Remove mongoose id
      key !== '__v' &&           // Optionally remove version key
      value !== null &&
      value !== '' &&
      value !== undefined
    )
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
}

projectsMenu.addEventListener("click", (event) => {
  loadProjects(event);
});

document.getElementById("offProjectsmenu").addEventListener("click", (event) => {
  loadProjects(event);
});

function loadProjects(event) {
  event.preventDefault();
  document.getElementById("welcomeMsg").innerHTML = ""; // Clear existing content

  // Create checkboxes for filtering
  const filterDiv = document.createElement("div");
  filterDiv.id = "filterOptions";
  filterDiv.style.marginBottom = "10px";

  const filters = [
    { id: "all", label: "All", checked: true },
    { id: "upstream", label: "Upstream", checked: false },
    { id: "midstream", label: "Midstream", checked: false }
  ];

  filters.forEach(filter => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = filter.id;
    checkbox.checked = filter.checked;
    checkbox.style.marginRight = "5px";

    const label = document.createElement("label");
    label.htmlFor = filter.id;
    label.textContent = filter.label;
    label.style.marginRight = "15px";

    filterDiv.appendChild(checkbox);
    filterDiv.appendChild(label);
  });

  document.getElementById("welcomeMsg").appendChild(filterDiv);

  fetch("/projects")
    .then(response => response.json())
    .then(data => {
      if (data.subscription === false) {
        contentDiv.innerHTML = "";

        const projectInfoDiv = document.createElement("div");
        projectInfoDiv.classList.add("infoDiv");
        projectInfoDiv.innerHTML = `
            <p><strong>Access Restricted!</strong> You are not allowed to view projects until you have subscribed.</p>
            <p>Please click below if you want to proceed with the subscription.</p>
        `;

        const payHereButton = document.createElement("button");
        payHereButton.textContent = "Pay Here";
        payHereButton.classList.add("payNowButton");
        payHereButton.addEventListener("click", () => {
          messageParagraph.textContent = "Redirecting to payment...";
          makePayment();
        });

        const messageParagraph = document.createElement("p");
        messageParagraph.id = "payMessage";
        messageParagraph.textContent = "";

        projectInfoDiv.appendChild(messageParagraph);
        projectInfoDiv.appendChild(payHereButton);
        contentDiv.appendChild(projectInfoDiv);
        return; // Exit function if user is not subscribed
      }

      let filteredData = data.map(project => filterEmptyValues(project));
      contentDiv.innerHTML = "";

      // Create accordion container.
      const accordionDiv = document.createElement("div");
      accordionDiv.id = "projectsAccordion";
      accordionDiv.classList.add("accordion");

      function updateProjectList() {
        const allChecked = document.getElementById("all").checked;
        const upstreamChecked = document.getElementById("upstream").checked;
        const midstreamChecked = document.getElementById("midstream").checked;

        let displayedProjects = filteredData.filter(project => {
          if (allChecked) return true;
          if (upstreamChecked && project.section === "Upstream") return true;
          if (midstreamChecked && project.section === "Midstream") return true;
          return false;
        });

        accordionDiv.innerHTML = "";

        displayedProjects.forEach((project, index) => {
          const accordionItem = document.createElement("div");
          accordionItem.classList.add("accordion-item");

          const headerId = "heading" + index;
          const collapseId = "collapse" + index;
          const accordionHeader = document.createElement("h2");
          accordionHeader.classList.add("accordion-header");
          accordionHeader.id = headerId;

          const accordionButton = document.createElement("button");
          accordionButton.classList.add("accordion-button", "collapsed");
          accordionButton.type = "button";
          accordionButton.setAttribute("data-bs-toggle", "collapse");
          accordionButton.setAttribute("data-bs-target", "#" + collapseId);
          accordionButton.setAttribute("aria-expanded", "false");
          accordionButton.setAttribute("aria-controls", collapseId);
          accordionButton.innerHTML = `<strong>${project.projectName || project.projectId}</strong>`;
          accordionHeader.appendChild(accordionButton);
          accordionItem.appendChild(accordionHeader);

          const collapseDiv = document.createElement("div");
          collapseDiv.id = collapseId;
          collapseDiv.classList.add("accordion-collapse", "collapse");
          collapseDiv.setAttribute("aria-labelledby", headerId);
          collapseDiv.setAttribute("data-bs-parent", "#projectsAccordion");

          const accordionBody = document.createElement("div");
          accordionBody.classList.add("accordion-body");

          const ul = document.createElement("ul");
          ul.classList.add("list-group", "mb-3");

          Object.entries(project).forEach(([key, value]) => {
            let displayName = fieldMappings[key] || key;
            const li = document.createElement("li");
            li.classList.add("list-group-item");  

            const valueStr = (value || "").toString().toLowerCase();
         
            li.setAttribute("data-field", displayName.toLowerCase());
            li.setAttribute("data-value", valueStr);
            li.innerHTML = `<strong>${displayName}:</strong> ${value}`;
            ul.appendChild(li);
          });
          accordionBody.appendChild(ul);

          const footerDiv = document.createElement("div");
          footerDiv.classList.add("accordion-footer", "d-flex", "justify-content-between", "align-items-center", "mt-3");

          const checkboxDiv = document.createElement("div");

          const favCheckbox = document.createElement("input");
          favCheckbox.type = "checkbox";
          favCheckbox.id = "favourite-" + project.projectId;
          favCheckbox.classList.add("form-check-input", "mb-3");
          favCheckbox.name = "favourite";

          const favLabel = document.createElement("label");
          favLabel.htmlFor = favCheckbox.id;
          favLabel.textContent = "Add to favourites";
          favLabel.style.marginLeft = "5px";

          checkboxDiv.appendChild(favCheckbox);
          checkboxDiv.appendChild(favLabel);
          checkboxDiv.appendChild(document.createElement("br"));

          const newsGroup = document.createElement("div");
          newsGroup.classList.add("d-flex", "align-items-center", "gap-2");
          
          const newsCheckbox = document.createElement("input");
          newsCheckbox.type = "checkbox";
          newsCheckbox.classList.add("form-check-input");
          newsCheckbox.id = "newsletter-" + project.projectId;
          newsCheckbox.name = "newsletter";
          
          const newsLabel = document.createElement("label");
          newsLabel.htmlFor = newsCheckbox.id;
          newsLabel.textContent = "Subscribe to newsletter";
          
          // Append elements
          newsGroup.appendChild(newsCheckbox);
          newsGroup.appendChild(newsLabel);
          checkboxDiv.appendChild(newsGroup);

          favCheckbox.addEventListener("change", () => {
            const payload = {
              projectId: project.projectId,
              favourite: favCheckbox.checked
            };

            fetch("/user/favourite", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            })
              .then(response => response.json())
              .then(data => console.log("Favourite status saved:", data))
              .catch(error => console.error("Error saving favourite:", error));
          });

          footerDiv.appendChild(checkboxDiv);

          const noteSpan = document.createElement("span");
          noteSpan.classList.add("text-muted", "m-0");
          noteSpan.textContent = "Click header to collapse.";
          footerDiv.appendChild(noteSpan);

          accordionBody.appendChild(footerDiv);

          collapseDiv.appendChild(accordionBody);
          accordionItem.appendChild(collapseDiv);
          accordionDiv.appendChild(accordionItem);
        });

        contentDiv.appendChild(accordionDiv);
      }

      updateProjectList();
      // Attach event listeners to checkboxes
      filters.forEach(filter => {
        document.getElementById(filter.id).addEventListener("change", () => {
          if (filter.id === "all") {
            // If "All" is checked, uncheck others
            if (document.getElementById("all").checked) {
              document.getElementById("upstream").checked = false;
              document.getElementById("midstream").checked = false;
            }
          } else {
            // If any other checkbox is checked, uncheck "All"
            if (document.getElementById("upstream").checked || document.getElementById("midstream").checked) {
              document.getElementById("all").checked = false;
            }
      
            // If neither "Upstream" nor "Midstream" is checked, recheck "All"
            if (!document.getElementById("upstream").checked && !document.getElementById("midstream").checked) {
              document.getElementById("all").checked = true;
            }
          }
      
          updateProjectList();
        });
      })
    .catch(err => console.error(err));
});
};

async function makePayment() {
  const response = await fetch('/api/initiate-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 5000, email: "user@example.com", name: "John Doe" })
  });

  const result = await response.json();
  if (result.paymentLink) {
    window.location.href = result.paymentLink;
  } else {
      alert('Payment failed.');
  }
}

async function requestInvoice() {
  try {
      const response = await fetch("/api/zoho/invoice", {
          method: "GET",
          credentials: "include", // Sends cookies for authentication if needed
          headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
          throw new Error("Failed to fetch invoice");
      }

      const data = await response.json();

      // Assuming you have an invoiceContainer div to display the invoice details
      const invoiceContainer = document.getElementById("invoiceContainer");
      if (invoiceContainer) {
          invoiceContainer.innerHTML = `<p>Invoice: ${JSON.stringify(data)}</p>`;
      }

  } catch (error) {
      console.error("Error fetching invoice:", error.message);
  }
}


subscribe.addEventListener("click", () => {
  subscribePay();
});

document.getElementById("offSubscribeButton").addEventListener("click", () => {
  subscribePay();
});

function subscribePay () {
    contentDiv.innerHTML = "";

    const infoDiv = document.createElement("div");
    infoDiv.classList.add("infoDiv"); 
    infoDiv.innerHTML = `
        <p>You will be charged <strong>NGN 100</strong> for a <strong>30-day subscription</strong> to <strong>epmdprojects</strong>.</p>
        <p>You will receive a notification when your subscription is about to expire.</p>
    `;

    const messageParagraph = document.createElement("p");
    messageParagraph.id = "messageParagraph"; 
    messageParagraph.textContent = ""; // Initially empty
    
    const payNowButton = document.createElement("button");
    payNowButton.textContent = "Pay Now";
    payNowButton.classList.add("payNowButton"); 
    payNowButton.addEventListener("click", () => {
        messageParagraph.textContent = "Redirecting to payment...";
        makePayment();
    });
    
    // Append elements
    infoDiv.appendChild(messageParagraph);
    infoDiv.appendChild(payNowButton);
    contentDiv.appendChild(infoDiv);
};


document.getElementById("searchButton").addEventListener("click", function () {
  const searchQuery = document.getElementById("searchInput").value.trim();
  const selectedField = document.getElementById("searchCategory").value.toLowerCase();

  if (!searchQuery) {
   
    return;
  }

  const regex = new RegExp(searchQuery, "i");

  const accordionItems = document.querySelectorAll(".accordion-item");

  if (accordionItems.length === 0) {
    contentDiv.innerHTML = "<p>No projects loaded. Please load projects first.</p>";
    contentDiv.style.fontSize = "20px";
    contentDiv.style.color = "white";
    return; 
  }

  let visibleCount = 0;

  accordionItems.forEach((accordionItem) => {
  
    let matchFound = false;
  
    accordionItem.querySelectorAll(".list-group-item").forEach((li) => {
      const field = li.getAttribute("data-field").toLowerCase();
      const value = li.getAttribute("data-value");
  
      if (field === selectedField && regex.test(value)) {
        matchFound = true;
      }
    });
  
    if (matchFound) {
      accordionItem.style.display = "block";
      visibleCount++;
    } else {
      accordionItem.style.display = "none";
    }
  });

  if (visibleCount === 0) {
    contentDiv.innerHTML = "<p>No results found.</p>";
    contentDiv.style.fontSize = "20px";
    contentDiv.style.color = "white";

  }
  });
