const adminForm = document.getElementById("adminLoginForm");
const adminLoginDialog = document.getElementById("adminLoginDialog");
const projectRegDialog = document.getElementById("projectRegDialog");
const adminMainDialog = document.getElementById("adminMainDialog");
const adminSignUpDialog = document.getElementById("adminSignUpDialog");
const projectSaveStatus = document.getElementById("projectSaveStatus");
const projectFindDialog = document.getElementById("projectFindDialog");
const projectUpdateDialog = document.getElementById("projectUpdateDialog");
const projectRegForm = document.getElementById("projectRegForm");
const deleteProjectDialog = document.getElementById("deleteProjectDialog");
const deleteWarnng = document.getElementById("deleteWarningdialog");
const deleteProjectForm = document.getElementById("deleteProjectForm");

  
const projectEntries = [
  "Project ID",
  "Project Name",
  "Location",
  "Capacity",
  "Client",
  "Client Home County",
  "Project Partners/Stakeholders",
  "Main Contractor",
  "Estimated Budget",
  "Contract Value ($)",
  "Local Spending (N/$)",
  "Foreign Spending ($)",
  "Project Scope",
  "Award Date",
  "Project Start-up Date",
  "Project Completion Date",
  "Project Status",
  "Project Schedule",
  "Local Content Plans",
  "Major Milestones (with dates)",
  "Project Overview",
  "Sub-Contractors",
  "Project Manager Name(Client)",
  "Project Manager Telephone(Client)",
  "Project Manager Email(Client)",
  "Project Coordinator Name(Client)",
  "Project Coordinator Telephone(Client)",
  "Project Coordinator Email(Client)",
  "Project Procurement Manager Name(Client)",
  "Project Procurement Manager Telephone(Client)",
  "Project Procurement Manager Email(Client)",
  "Project Manager Name(Main Contractor)",
  "Project Manager Telephone(Main Contractor)",
  "Project Manager Email(Main Contractor)",
  "Project Coordinator Name(Main Contractor)",
  "Project Coordinator Telephone(Main Contractor)",
  "Project Coordinator Email(Main Contractor)",
  "Project Procurement Manager Name(Main Contractor)",
  "Project Procurement Manager Telephone(Main Contractor)",
  "Project Procurement Manager Email(Main Contractor)"
];

const openLogin = () => {
    adminLoginDialog.showModal();
};

const closeLogin = () => {
    adminLoginDialog.close();
}; 

const resetLogin = () => {
  adminForm.reset();
};

const openProjectReg = () => {
    projectRegDialog.showModal();
    adminMainDialog.close();
};

const closeProjectReg = () => {
    projectRegDialog.close();
    projectRegForm.reset(); 
    adminMainDialog.showModal();
};

const openAdmin= () => {
    adminMainDialog.showModal();
};

const closeAdmin = () => {
    adminMainDialog.close();
};

const openAdminReg = () => {
    adminSignUpDialog.showModal();
};

const closeAdminReg = () => {
    adminSignUpDialog.close();
};

const openFind = () => {
    closeAdmin();
    projectFindDialog.showModal();
};

const closeFind = () =>{
    projectFindDialog.close();
    openAdmin();
};

const openUpdate = () => {
    projectUpdateDialog.showModal();
};

const closeUpdate = () => {
    projectUpdateDialog.close();
    projectFindDialog.showModal();
};

const openDeleteProject = () => {
  deleteProjectDialog.showModal();
  adminMainDialog.close();
}

const closeDeleteProject = () => {
    deleteProjectDialog.close();
    adminMainDialog.showModal();
};

document.getElementById("adminRegLink").addEventListener("click", function(event) {
    event.preventDefault();
    adminReg();
});

const adminReg = () => {  
    closeLogin(); 
    adminForm.reset();
    openAdminReg();       
}
const cancelReg = () => {
    document.getElementById("adminRegistrationForm").reset();
    closeAdminReg() ;
    openLogin();
}

adminForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    console.log("Form submitted!");

    fetch("/admin/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.log(data.error);
            document.getElementById("message").textContent = data.error;
            setTimeout(()=>  {
              document.getElementById("message").textContent = ""},2000)
        } else if (data.success) {
          console.log(data.success);            
          document.getElementById("message").textContent = data.success; 
          setTimeout(() => {
              document.getElementById("message").textContent = "";
              adminForm.reset();
              closeLogin();
              openAdmin();            
          }, 1000);
      }  //
    })
    .catch(error => console.error("Error:", error));
});


const adminLoggedOut= () => {
    closeAdmin();
    openLogin();
}

window.onload = () => {
    openLogin();
};

document.getElementById("adminRegistrationForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    fetch("/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.log(data.error);
            document.getElementById("regmessage").textContent = data.error;
        } else {
            console.log(data.message);
            document.getElementById("regmessage").textContent = data.success;
        }
    })
    .catch(error => console.error("Error:", error));
});

document.getElementById("add-milestone-btn").addEventListener("click", function() {
    const container = document.getElementById("milestones-container");
    const newMilestone = document.createElement("div");
    newMilestone.classList.add("milestone-pair", "mb-3");
    newMilestone.innerHTML = `
      <input type="text" class="form-control milestone" name="milestones" placeholder="Enter Major Milestone">
      <input type="date" class="form-control milestone-date" name="milestoneDates" style="max-width: 150px;">
    `;
    container.appendChild(newMilestone);
  });

projectRegForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(projectRegForm);
  const data = Object.fromEntries(formData.entries()); // Convert FormData to a simple object

  try {
    const response = await fetch(projectRegForm.action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (result.error) {
      console.log("Project not submitted", result.error);
      projectSaveStatus.textContent = result.error;
    } else if (result.success) {
      projectSaveStatus.textContent = result.success;
      projectRegForm.reset();
      setTimeout(() => {
        projectSaveStatus.textContent = "";
        projectRegForm.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 3000);
      
    };
    
  } catch (error) {
    console.error("Error submitting project:", error);
  }
});


const projectCall = (data) => {
    return `
    <li class="mb-2">
      <label for="projectId" class="form-label">Project ID</label>
      <span class="profileSpan" id="projectIdDisplay">${data.project.projectId || ''}</span>
      <button type="button" class="edit-btn" data-field="projectId">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectName" class="form-label">Project Name</label>
      <span class="profileSpan" id="projectNameDisplay">${data.project.projectName || ''}</span>
      <button type="button" class="edit-btn" data-field="projectName">Edit</button>
    </li>
    <li class="mb-2">
      <label for="location" class="form-label">Location</label>
      <span class="profileSpan" id="locationDisplay">${data.project.location || ''}</span>
      <button type="button" class="edit-btn" data-field="location">Edit</button>
    </li>
    <li class="mb-2">
      <label for="capacity" class="form-label">Capacity</label>
      <span class="profileSpan" id="capacityDisplay">${data.project.capacity || ''}</span>
      <button type="button" class="edit-btn" data-field="capacity">Edit</button>
    </li>
    <li class="mb-2">
      <label for="client" class="form-label">Client</label>
      <span class="profileSpan" id="clientDisplay">${data.project.client || ''}</span>
      <button type="button" class="edit-btn" data-field="client">Edit</button>
    </li>
    <li class="mb-2">
      <label for="clientHomeCounty" class="form-label">Client Home County</label>
      <span class="profileSpan" id="clientHomeCountyDisplay">${data.project.clientHomeCounty || ''}</span>
      <button type="button" class="edit-btn" data-field="clientHomeCounty">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectPartnersStakeholders" class="form-label">Project Partners/Stakeholders</label>
      <span class="profileSpan" id="projectPartnersStakeholdersDisplay">${data.project.projectPartnersStakeholders || ''}</span>
      <button type="button" class="edit-btn" data-field="projectPartnersStakeholders">Edit</button>
    </li>
    <li class="mb-2">
      <label for="mainContractor" class="form-label">Main Contractor</label>
      <span class="profileSpan" id="mainContractorDisplay">${data.project.mainContractor || ''}</span>
      <button type="button" class="edit-btn" data-field="mainContractor">Edit</button>
    </li>
    <li class="mb-2">
      <label for="estimatedBudget" class="form-label">Estimated Budget</label>
      <span class="profileSpan" id="estimatedBudgetDisplay">${data.project.estimatedBudget || ''}</span>
      <button type="button" class="edit-btn" data-field="estimatedBudget">Edit</button>
    </li
    <li class="mb-2">
      <label for="contractValue" class="form-label">Contract Value</label>
      <span class="profileSpan" id="contractValueDisplay">${data.project.contractValue || ''}</span>
      <button type="button" class="edit-btn" data-field="contractValue">Edit</button>
    </li>
    <li class="mb-2">
      <label for="localSpending" class="form-label">Local Spending</label>
      <span class="profileSpan" id="localSpendingDisplay">${data.project.localSpending || ''}</span>
      <button type="button" class="edit-btn" data-field="localSpending">Edit</button>
    </li>
    <li class="mb-2">
      <label for="foreignSpending" class="form-label">Foreign Spending</label>
      <span class="profileSpan" id="foreignSpendingDisplay">${data.project.foreignSpending || ''}</span>
      <button type="button" class="edit-btn" data-field="foreignSpending">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectScope" class="form-label">Project Scope</label>
      <span class="profileSpan" id="projectScopeDisplay">${data.project.projectScope || ''}</span>
      <button type="button" class="edit-btn" data-field="projectScope">Edit</button>
    </li>
    <li class="mb-2">
      <label for="awardDate" class="form-label">Award Date</label>
      <span class="profileSpan" id="awardDateDisplay">${data.project.awardDate ? data.project.awardDate.split('T')[0] : ''}</span>
      <button type="button" class="edit-btn" data-field="awardDate">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectStartUpDate" class="form-label">Project Start-up Date</label>
      <span class="profileSpan" id="projectStartUpDateDisplay">${data.project.projectStartUpDate ? data.project.projectStartUpDate.split('T')[0] : ''}</span>
      <button type="button" class="edit-btn" data-field="projectStartUpDate">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectCompletionDate" class="form-label">Project Completion Date</label>
      <span class="profileSpan" id="projectCompletionDateDisplay">${data.project.projectCompletionDate ? data.project.projectCompletionDate.split('T')[0] : ''}</span>
      <button type="button" class="edit-btn" data-field="projectCompletionDate">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectStatus" class="form-label">Project Status</label>
      <span class="profileSpan" id="projectStatusDisplay">${data.project.projectStatus || ''}</span>
      <button type="button" class="edit-btn" data-field="projectStatus">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectSchedule" class="form-label">Project Schedule</label>
      <span class="profileSpan" id="projectScheduleDisplay">${data.project.projectSchedule || ''}</span>
      <button type="button" class="edit-btn" data-field="projectSchedule">Edit</button>
    </li>
    <li class="mb-2">
      <label for="localContentPlans" class="form-label">Local Content Plans</label>
      <span class="profileSpan" id="localContentPlansDisplay">${data.project.localContentPlans || ''}</span>
      <button type="button" class="edit-btn" data-field="localContentPlans">Edit</button>
    </li>
    <li class="mb-2">
      <label for="majorMilestones" class="form-label">Major Milestones</label>
      <span class="profileSpan" id="majorMilestonesDisplay">${data.project.majorMilestones ? data.project.majorMilestones.join(', ') : ''}</span>
      <button type="button" class="edit-btn" data-field="majorMilestones">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectOverview" class="form-label">Project Overview</label>
      <span class="profileSpan" id="projectOverviewDisplay">${data.project.projectOverview || ''}</span>
      <button type="button" class="edit-btn" data-field="projectOverview">Edit</button>
    </li>
    <li class="mb-2">
      <label for="classification" class="form-label">Classification</label>
      <span class="profileSpan" id="classificationDisplay">${data.project.classification || ''}</span>
      <button type="button" class="edit-btn" data-field="classification">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectFinance" class="form-label">Project Finance</label>
      <span class="profileSpan" id="projectFinanceDisplay">${data.project.projectFinance || ''}</span>
      <button type="button" class="edit-btn" data-field="projectFinance">Edit</button>
    </li>
    <li class="mb-2">
      <label for="subContractors" class="form-label">Sub-Contractors</label>
      <span class="profileSpan" id="subContractorsDisplay">${data.project.subContractors || ''}</span>
      <button type="button" class="edit-btn" data-field="subContractors">Edit</button>
    </li>
    <li class="mb-2">
      <label for="section" class="form-label">Section</label>
      <span class="profileSpan" id="sectionDisplay">${data.project.section || ''}</span>
      <button type="button" class="edit-btn" data-field="section">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectManagerNameClient" class="form-label">Project Manager Name (Client)</label>
      <span class="profileSpan" id="projectManagerNameClientDisplay">${data.project.projectManagerNameClient || ''}</span>
      <button type="button" class="edit-btn" data-field="projectManagerNameClient">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectManagerTelephoneClient" class="form-label">Project Manager Telephone (Client)</label>
      <span class="profileSpan" id="projectManagerTelephoneClientDisplay">${data.project.projectManagerTelephoneClient || ''}</span>
      <button type="button" class="edit-btn" data-field="projectManagerTelephoneClient">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectManagerEmailClient" class="form-label">Project Manager Email (Client)</label>
      <span class="profileSpan" id="projectManagerEmailClientDisplay">${data.project.projectManagerEmailClient || ''}</span>
      <button type="button" class="edit-btn" data-field="projectManagerEmailClient">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectCoordinatorNameClient" class="form-label">Project Coordinator Name (Client)</label>
      <span class="profileSpan" id="projectCoordinatorNameClientDisplay">${data.project.projectCoordinatorNameClient || ''}</span>
      <button type="button" class="edit-btn" data-field="projectCoordinatorNameClient">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectCoordinatorTelephoneClient" class="form-label">Project Coordinator Telephone (Client)</label>
      <span class="profileSpan" id="projectCoordinatorTelephoneClientDisplay">${data.project.projectCoordinatorTelephoneClient || ''}</span>
      <button type="button" class="edit-btn" data-field="projectCoordinatorTelephoneClient">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectCoordinatorEmailClient" class="form-label">Project Coordinator Email (Client)</label>
      <span class="profileSpan" id="projectCoordinatorEmailClientDisplay">${data.project.projectCoordinatorEmailClient || ''}</span>
      <button type="button" class="edit-btn" data-field="projectCoordinatorEmailClient">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectProcurementManagerNameClient" class="form-label">Project Procurement Manager Name (Client)</label>
      <span class="profileSpan" id="projectProcurementManagerNameClientDisplay">${data.project.projectProcurementManagerNameClient || ''}</span>
      <button type="button" class="edit-btn" data-field="projectProcurementManagerNameClient">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectProcurementManagerTelephoneClient" class="form-label">Project Procurement Manager Telephone (Client)</label>
      <span class="profileSpan" id="projectProcurementManagerTelephoneClientDisplay">${data.project.projectProcurementManagerTelephoneClient || ''}</span>
      <button type="button" class="edit-btn" data-field="projectProcurementManagerTelephoneClient">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectProcurementManagerEmailClient" class="form-label">Project Procurement Manager Email (Client)</label>
      <span class="profileSpan" id="projectProcurementManagerEmailClientDisplay">${data.project.projectProcurementManagerEmailClient || ''}</span>
      <button type="button" class="edit-btn" data-field="projectProcurementManagerEmailClient">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectManagerNameMainContractor" class="form-label">Project Manager Name (Main Contractor)</label>
      <span class="profileSpan" id="projectManagerNameMainContractorDisplay">${data.project.projectManagerNameMainContractor || ''}</span>
      <button type="button" class="edit-btn" data-field="projectManagerNameMainContractor">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectManagerTelephoneMainContractor" class="form-label">Project Manager Telephone (Main Contractor)</label>
      <span class="profileSpan" id="projectManagerTelephoneMainContractorDisplay">${data.project.projectManagerTelephoneMainContractor || ''}</span>
      <button type="button" class="edit-btn" data-field="projectManagerTelephoneMainContractor">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectManagerEmailMainContractor" class="form-label">Project Manager Email (Main Contractor)</label>
      <span class="profileSpan" id="projectManagerEmailMainContractorDisplay">${data.project.projectManagerEmailMainContractor || ''}</span>
      <button type="button" class="edit-btn" data-field="projectManagerEmailMainContractor">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectCoordinatorNameMainContractor" class="form-label">Project Coordinator Name (Main Contractor)</label>
      <span class="profileSpan" id="projectCoordinatorNameMainContractorDisplay">${data.project.projectCoordinatorNameMainContractor || ''}</span>
      <button type="button" class="edit-btn" data-field="projectCoordinatorNameMainContractor">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectCoordinatorTelephoneMainContractor" class="form-label">Project Coordinator Telephone (Main Contractor)</label>
      <span class="profileSpan" id="projectCoordinatorTelephoneMainContractorDisplay">${data.project.projectCoordinatorTelephoneMainContractor || ''}</span>
      <button type="button" class="edit-btn" data-field="projectCoordinatorTelephoneMainContractor">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectCoordinatorEmailMainContractor" class="form-label">Project Coordinator Email (Main Contractor)</label>
      <span class="profileSpan" id="projectCoordinatorEmailMainContractorDisplay">${data.project.projectCoordinatorEmailMainContractor || ''}</span>
      <button type="button" class="edit-btn" data-field="projectCoordinatorEmailMainContractor">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectProcurementManagerNameMainContractor" class="form-label">Project Procurement Manager Name (Main Contractor)</label>
      <span class="profileSpan" id="projectProcurementManagerNameMainContractorDisplay">${data.project.projectProcurementManagerNameMainContractor || ''}</span>
      <button type="button" class="edit-btn" data-field="projectProcurementManagerNameMainContractor">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectProcurementManagerTelephoneMainContractor" class="form-label">Project Procurement Manager Telephone (Main Contractor)</label>
      <span class="profileSpan" id="projectProcurementManagerTelephoneMainContractorDisplay">${data.project.projectProcurementManagerTelephoneMainContractor || ''}</span>
      <button type="button" class="edit-btn" data-field="projectProcurementManagerTelephoneMainContractor">Edit</button>
    </li>
    <li class="mb-2">
      <label for="projectProcurementManagerEmailMainContractor" class="form-label">Project Procurement Manager Email (Main Contractor)</label>
      <span class="profileSpan" id="projectProcurementManagerEmailMainContractorDisplay">${data.project.projectProcurementManagerEmailMainContractor || ''}</span>
      <button type="button" class="edit-btn" data-field="projectProcurementManagerEmailMainContractor">Edit</button>
    </li>
`;  
}

const projectUpdateCancel = () => {
    resetentries = projectCall(previousData);
    projectUpdateDialog.innerHTML =  `
    <div id="projectProfileDiv">
        <ul>${resetentries}</ul>
        <p id="projectUpdateInfo" class="text-center fw-bold"></p>
        <div class="d-flex justify-content-evenly">
            <button id="confirmChanges" class="mt-3 btn btn-primary">Confirm Changes</button>
            <button id="cancelChanges" class="mt-3 btn btn-danger" onclick = "projectUpdateCancel()">Cancel</button>
            <button id="goBack" class="mt-3 btn btn-dark" onclick = "closeUpdate()">Back</button>
        </div>
    </div>
    `;
};

let updateData = {};
let previousData = {};
let originalUpdateMarkup = ""; // Declare it at a higher scope

function bindEditButtons() {
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const field = e.target.getAttribute('data-field');
      let displaySpan = document.getElementById(`${field}Display`);

      if (e.target.textContent === 'Edit') {
        let currentValue = displaySpan.textContent;
        let inputType = field.toLowerCase().includes("date") ? "date" : "text";
        displaySpan.innerHTML = `<input type="${inputType}" id="${field}Input" name="${field}" value="${currentValue}" />`;
        e.target.textContent = 'Save';
      } else {
        const newValue = document.getElementById(`${field}Input`).value;
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
    if (Object.keys(updateData).length === 0) {
      document.getElementById("projectUpdateInfo").textContent = "No changes to update.";
      return;
    }

    fetch(`/new-project/project-update?projectId=${previousData.projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          console.log("Project updated successfully:", updateData);
          document.getElementById("projectUpdateInfo").textContent = "Project updated successfully";
          document.getElementById("projectUpdateInfo").style.color = "green";
          previousData = { ...previousData, ...updateData }; // Merge updated values
          updateData = {};
          originalUpdateMarkup = projectUpdateDialog.innerHTML;
        } else {
          console.error("Error updating project:", result.message);
          document.getElementById("projectUpdateInfo").style.color = "red";
          document.getElementById("projectUpdateInfo").textContent = "Error updating project: " + result.message;
        }
      })
      .catch(err => console.error("Error:", err));
  });

  document.getElementById("cancelChanges").addEventListener("click", () => {
    projectUpdateDialog.innerHTML = originalUpdateMarkup; // Fixed scope issue
    bindEditButtons();
  });
}

document.getElementById("findProjectForm").addEventListener("submit", function (event) {
  event.preventDefault();
  let projectId = document.getElementById("projectFindId").value;

  fetch(`/new-project/findProject/${projectId}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        let msgElement = document.getElementById("projectFindMsg");
        msgElement.textContent = "Project not found!";
        setTimeout(() => {
          msgElement.textContent = "";
        }, 3000);
      } else {
        console.log(data.project);
        previousData = { ...data.project };
        let entries = projectCall(data);

        projectUpdateDialog.innerHTML = `
          <div id="projectProfileDiv">
            <ul>${entries}</ul>
            <p id="projectUpdateInfo" class="text-center fw-bold"></p>
            <div class="d-flex justify-content-evenly">
              <button id="confirmChanges" class="mt-3 btn btn-primary">Confirm Changes</button>
              <button id="cancelChanges" class="mt-3 btn btn-danger">Cancel</button>
              <button id="goBack" class="mt-3 btn btn-dark" onclick="closeUpdate()">Back</button>
            </div>
          </div>
        `;

        originalUpdateMarkup = projectUpdateDialog.innerHTML;
        bindEditButtons();
        openUpdate();
        projectFindDialog.close();
      }
    })
    .catch(err => console.error("Error fetching project:", err));
});


deleteProjectForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  // Get the project ID value from the input element
  const projectIdInput = document.getElementById("deleteProjectId");
  const projectId = projectIdInput.value;
  
  // Make the fetch call with correct syntax
  fetch("/new-project/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId: projectId })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        document.getElementById("projectDeleteMsg").textContent = data.message;
        deleteProjectForm.reset();
        setTimeout(() => {document.getElementById("projectDeleteMsg").textContent = ""},3000);
      } else if (data.error) {
        document.getElementById("projectDeleteMsg").textContent = data.error;
      }
    })
    .catch(error => console.error("Error:", error));
});

document.getElementById("adminRegistrationForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  // Gather values from the form inputs
  const newAdminUsername = document.getElementById("newAdminUsername").value;
  const newAdminPassword = document.getElementById("newAdminPassword").value;  
  const newAdminEmail = document.getElementById("currentAdminEmail").value;
  const currentAdminUsername = document.getElementById("currentAdminUsername").value;
  const currentAdminPassword = document.getElementById("currentAdminPassword").value;
  
  const messageElement = document.getElementById("regmessage");

  try {
    const response = await fetch("/admin/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newAdminUsername,
        newAdminPassword,
        newAdminEmail,
        currentAdminUsername,
        currentAdminPassword,        
      })
    });

    const data = await response.json();

    if (data.success) {
      messageElement.style.color = "lightgreen";
      messageElement.textContent = data.message;
    } else {
      messageElement.style.color = "red";
      messageElement.textContent = data.error;
    }
  } catch (error) {
    console.error("Error submitting registration:", error);
    messageElement.style.color = "red";
    messageElement.textContent = "An error occurred connecting to the server.";
  }
});

document.getElementById("eyeIcon").addEventListener("click", function() {
  const isPasswordVisible = document.getElementById("password").type === "text";
  document.getElementById("password").type = isPasswordVisible ? "password" : "text";

  document.getElementById("eyeIcon").innerHTML = isPasswordVisible ? "show" : "hide"; 
});

document.getElementById("eyeIconReg").addEventListener("click", function() {
  const isPasswordVisible = document.getElementById("newAdminPassword").type === "text";
  document.getElementById("newAdminPassword").type = isPasswordVisible ? "password" : "text";

  document.getElementById("eyeIconReg").innerHTML = isPasswordVisible ? "show" : "hide"; 
});