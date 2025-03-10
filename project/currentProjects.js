const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const Logger = require('../models/logger');

router.get('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const hasActiveSubscription = req.user.subscribed && req.user.subscriptionExpiry && req.user.subscriptionExpiry > Date.now();
    
    if (!hasActiveSubscription) {
      return res.json({ subscription: false });
    }

    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/favourites', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const { projectId, favourite } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    // Find the user (logger)
    const user = await Logger.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (favourite) {
      if (!user.favProjects.includes(projectId)) {
        user.favProjects.push(projectId);
      }
    } else {
      user.favProjects = user.favProjects.filter(id => id !== projectId);
    }

    await user.save();

    res.status(200).json({ message: "Favourite status updated", favProjects: user.favProjects });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/getUserfavourites', async (req, res) => {
  try {
    // Ensure the user is authenticated.
    if (!req.user) {
      return res.status(401).json({ error: "Not authorized" });
    }

    // Find the user using an identifier from req.user (e.g., email).
    const user = await Logger.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user's favorite projects.
    res.status(200).json({ favProjects: user.favProjects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/newsletter', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const { projectId, subscribed } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    // Find the project
    const project = await Project.findOne({ projectId });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Find the user (logger)
    const user = await Logger.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (subscribed) {
      // Add user to project's favorite list
      if (!project.subscribersEmails.includes(req.user.email)) {
        project.subscribersEmails.push(req.user.email);
      }

      // Add project to user's favorite list
      if (!user.subscribedProjects.includes(projectId)) {
        user.subscribedProjects.push(projectId);
      }
    } else {
      // Remove user from project's favorite list
      project.subscribersEmails = project.subscribersEmails.filter(email => email !== req.user.email);

      // Remove project from user's favorite list
      user.subscribedProjects = user.subscribedProjects.filter(id => id !== projectId);
    }

    await project.save();
    await user.save();

    res.status(200).json({ message: "Subscribe status updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/getUserSubscribed', async (req, res) => {
  try {
    // Ensure the user is authenticated.
    if (!req.user) {
      return res.status(401).json({ error: "Not authorized" });
    }

    // Find the user using an identifier from req.user (e.g., email).
    const user = await Logger.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user's favorite projects.
    res.status(200).json({ subscribedProjects: user.subscribedProjects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;