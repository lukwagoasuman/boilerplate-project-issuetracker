"use strict";
const issueController = require("../controllers/issueController");
const router = require("express").Router();

router.get("/issues/:project", issueController.viewIssues);
router.post("/issues/:project", issueController.createIssue);
router.put("/issues/:project", issueController.editIssue);
router.delete("/issues/:project", issueController.deleteIssue);

module.exports = router;