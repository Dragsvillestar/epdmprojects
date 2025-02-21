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

profile.addEventListener("click", () => {
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
          headers: {
            'Content-Type': 'application/json'
          },
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
});

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

projectsMenu.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("welcomeMsg").style.display = "none";
  
  fetch("/projects")
    .then(response => response.json())
    .then(data => {
      if (data.subscription === false){
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
      }

      const filteredData = data.map(project => filterEmptyValues(project));
      contentDiv.innerHTML = "";

      // Create the accordion container.
      const accordionDiv = document.createElement("div");
      accordionDiv.id = "projectsAccordion";
      accordionDiv.classList.add("accordion");

      filteredData.forEach((project, index) => {
        // Create an accordion item for each project.
        const accordionItem = document.createElement("div");
        accordionItem.classList.add("accordion-item");

        // Create header with a unique id.
        const headerId = "heading" + index;
        const collapseId = "collapse" + index;
        const accordionHeader = document.createElement("h2");
        accordionHeader.classList.add("accordion-header");
        accordionHeader.id = headerId;

        // Create the button that toggles the collapse.
        const accordionButton = document.createElement("button");
        accordionButton.classList.add("accordion-button", "collapsed");
        accordionButton.type = "button";
        accordionButton.setAttribute("data-bs-toggle", "collapse");
        accordionButton.setAttribute("data-bs-target", "#" + collapseId);
        accordionButton.setAttribute("aria-expanded", "false");
        accordionButton.setAttribute("aria-controls", collapseId);
        // Display project name or ID in the header.
        accordionButton.innerHTML = `<strong>${project.projectName || project.projectId}</strong>`;
        accordionHeader.appendChild(accordionButton);
        accordionItem.appendChild(accordionHeader);

        // Create the collapse element.
        const collapseDiv = document.createElement("div");
        collapseDiv.id = collapseId;
        collapseDiv.classList.add("accordion-collapse", "collapse");
        collapseDiv.setAttribute("aria-labelledby", headerId);
        collapseDiv.setAttribute("data-bs-parent", "#projectsAccordion");

        // Create the body that holds the project details.
        const accordionBody = document.createElement("div");
        accordionBody.classList.add("accordion-body");

        // Create and append the list of project details.
        const ul = document.createElement("ul");
        ul.classList.add("list-group", "mb-3");

        Object.entries(project).forEach(([key, value]) => {
          const li = document.createElement("li");
          li.classList.add("list-group-item");
          li.innerHTML = `<strong>${key}:</strong> ${value}`;
          ul.appendChild(li);
        });
        accordionBody.appendChild(ul);

        // --- Footer with Checkboxes (No Separate Close Button) ---
        const footerDiv = document.createElement("div");
        footerDiv.classList.add("accordion-footer", "d-flex", "justify-content-between", "align-items-center", "mt-3");

        // Create container for checkboxes.
        const checkboxDiv = document.createElement("div");

        // Favourite checkbox.
        const favCheckbox = document.createElement("input");
        favCheckbox.type = "checkbox";
        // Use a unique ID: "favourite-" followed by the project ID.
        favCheckbox.id = "favourite-" + project.projectId;
        favCheckbox.name = "favourite";

        const favLabel = document.createElement("label");
        favLabel.htmlFor = favCheckbox.id;
        favLabel.textContent = "Add to favourites";
        // Add spacing between checkbox and label.
        favLabel.style.marginLeft = "5px";

        checkboxDiv.appendChild(favCheckbox);
        checkboxDiv.appendChild(favLabel);
        checkboxDiv.appendChild(document.createElement("br"));

        // Newsletter checkbox.
        const newsCheckbox = document.createElement("input");
        newsCheckbox.type = "checkbox";
        // Unique ID: "newsletter-" followed by the project ID.
        newsCheckbox.id = "newsletter-" + project.projectId;
        newsCheckbox.name = "newsletter";

        const newsLabel = document.createElement("label");
        newsLabel.htmlFor = newsCheckbox.id;
        newsLabel.textContent = "Subscribe to newsletter";
        newsLabel.style.marginLeft = "5px";

        checkboxDiv.appendChild(newsCheckbox);
        checkboxDiv.appendChild(newsLabel);

        // Post favourite status to server when checkbox toggles.
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

        // Add a small note that the header toggles the accordion.
        const noteSpan = document.createElement("span");
        noteSpan.classList.add("text-muted");
        noteSpan.textContent = "Click header to collapse.";
        footerDiv.appendChild(noteSpan);

        // Append footer to the accordion body.
        accordionBody.appendChild(footerDiv);
        // --- End Footer Section ---

        collapseDiv.appendChild(accordionBody);
        accordionItem.appendChild(collapseDiv);
        accordionDiv.appendChild(accordionItem);
      });

      contentDiv.appendChild(accordionDiv);
    })
    .catch(err => console.error(err));
});

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
});


