// routes/projectRoutes.js

const express = require('express');
const router = express.Router();
const Project = require('../models/project'); // Adjust the path as needed

// POST /projects - Create a new project document
function formatDate(dateInput) {
  if (!dateInput) return ''; // return empty string if no date is provided
  const date = new Date(dateInput);
  return date;
}

function validateDates(awardDateStr, startDateStr, completionDateStr) {
  const awardDate = new Date(awardDateStr);
  const startDate = new Date(startDateStr);
  const completionDate = new Date(completionDateStr);

  if (awardDate > startDate || awardDate > completionDate) {
    return "Award date cannot be later than project start date or project completion date.";
  }
  if (startDate > completionDate) {
    return "Project start date cannot be later than project completion date.";
  }
  return null;
}


router.post('/', async (req, res) => {
  try {
    const existingProject = await Project.findOne({ projectId: req.body.projectId });
    if (existingProject) {
      return res.status(400).json({ error: "A project with this project ID already exists." });
    };

    const existingProjectname = await Project.findOne({ projectName: req.body.projectName });
    if (existingProjectname) {
      return res.status(400).json({ error: "A project with this project name already exists." });
    };

    const dateError = validateDates(
      req.body["award-date"],
      req.body["project-start-up-date"],
      req.body["project-completion-date"]
    );
    if (dateError) {
      return res.status(400).json({ error: dateError });
    }

    const newProjectData = {
      projectId: req.body.projectId,
      projectName: req.body.projectName,
      location: req.body.location,
      capacity: req.body.capacity,
      client: req.body.client,
      clientHomeCounty: req.body.clientHomeCounty,
      projectPartnersStakeholders: req.body.projectPartnersStakeholders,
      mainContractor: req.body.mainContractor,
      // Combine currency with numeric values
      estimatedBudget: req.body["estimated-budget"],
      contractValue: req.body["contract-value"],
      localSpending: req.body["local-spending"],
      foreignSpending: req.body["foreign-spending"],    
      projectScope: req.body["project-scope"],
      awardDate: formatDate(req.body["award-date"]),
      projectStartUpDate: formatDate(req.body["project-start-up-date"]),
      projectCompletionDate: formatDate(req.body["project-completion-date"]),
      projectStatus: req.body["project-status"],
      projectSchedule: req.body["project-schedule"],
      localContentPlans: req.body["local-content-plans"],
      majorMilestones: req.body.milestones,
      projectOverview: req.body["project-overview"],
      subContractors: req.body["sub-contractors"],
      section: req.body.section,

      // Client (SNEPCo) Personnel
      projectManagerNameClient: req.body["project-manager-name-client"],
      projectManagerTelephoneClient: req.body["project-manager-telephone-client"],
      projectManagerEmailClient: req.body["project-manager-email-client"],
      projectCoordinatorNameClient: req.body["project-coordinator-name-client"],
      projectCoordinatorTelephoneClient: req.body["project-coordinator-telephone-client"],
      projectCoordinatorEmailClient: req.body["project-coordinator-email-client"],
      projectProcurementManagerNameClient: req.body["project-procurement-manager-name-client"],
      projectProcurementManagerTelephoneClient: req.body["project-procurement-manager-telephone-client"],
      projectProcurementManagerEmailClient: req.body["project-procurement-manager-email-client"],

      // Main Contractor (TechnipFMC) Personnel
      projectManagerNameMainContractor: req.body["project-manager-name-main-contractor"],
      projectManagerTelephoneMainContractor: req.body["project-manager-telephone-main-contractor"],
      projectManagerEmailMainContractor: req.body["project-manager-email-main-contractor"],
      projectCoordinatorNameMainContractor: req.body["project-coordinator-name-main-contractor"],
      projectCoordinatorTelephoneMainContractor: req.body["project-coordinator-telephone-main-contractor"],
      projectCoordinatorEmailMainContractor: req.body["project-coordinator-email-main-contractor"],
      projectProcurementManagerNameMainContractor: req.body["project-procurement-manager-name-main-contractor"],
      projectProcurementManagerTelephoneMainContractor: req.body["project-procurement-manager-telephone-main-contractor"],
      projectProcurementManagerEmailMainContractor: req.body["project-procurement-manager-email-main-contractor"]
    };

    const newProject = new Project(newProjectData);
    const savedProject = await newProject.save();
    console.log("project saved");
    res.status(201).json({success:"Project saved successfully"});
  } catch (err) {
    console.log("project not saved");
    res.status(500).json({ error: "Project save error",err});
  }
});

router.get("/findProject/:id", async (req, res) => {
  try {
    const projectId = req.params.id; 
    const project = await Project.findOne({ projectId });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ project }); // No need to repeat `project: project`
  } catch (error) {
    console.error("Error finding project:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch('/project-update', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    const updateData = req.body;

    if (!projectId) {
      return res.status(400).json({ success: false, message: "Project ID is required." });
    }

    console.log("Updating project with projectId:", projectId);

    const updatedProject = await Project.findOneAndUpdate(
      { projectId: String(projectId) },  
      { $set: updateData },    
      { new: true }           
    );

    if (!updatedProject) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    res.json({ success: true, message: "Project updated successfully"});
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ success: false, message: "Server error while updating project." });
  }
});

router.post("/delete", async (req, res) => {
  try {
    const { projectId } = req.body;
    const deletedProject = await Project.findOneAndDelete({ projectId: String(projectId) });
    if (deletedProject) {
      res.json({ success: true, message: "Project deleted successfully." });
    } else {
      res.status(404).json({ success: false, error: "Project not found." });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
