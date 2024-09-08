const Issue = require("../models/models").Issue;
const Project = require("../models/models").Project;
const Helper = require("../utils/helpers");
const issueController = {
  viewIssues: async (req, res) => {
    const {
      open,
      _id,
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text
    } = req.query;
    const projectName = req.params.project;
    const params = {
      open,
      _id,
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text
    };
    if (typeof params.open === "string") {
      params.open = Helper.convertStringToBoolean(open);
    }
    const filteredParams = Helper.removeUndefinedAndEmptyStringValuesFromObj(
      params
    );
    const filteredParamsLength = Object.keys(filteredParams).length;
    await Project.findOne({ projectName }, (err, docs) => {
      const issueDocs = docs.issues;
      if (!filteredParamsLength) {
        if (Array.isArray(issueDocs) && issueDocs.length) {
          return res.send(issueDocs);
        }
        return res.send([]);
      }
      const filteredIssueList = docs.issues.filter(issue => {
        let innerLoopCount = 0;
        for (let key in filteredParams) {
          if (key === "_id") {
            if (
              JSON.stringify(issue[key]) !== JSON.stringify(filteredParams[key])
            ) {
              innerLoopCount = 0;
              return false;
            }
          } else {
            if (issue[key] !== filteredParams[key]) {
              innerLoopCount = 0;
              return false;
            }
          }
          if (innerLoopCount >= filteredParamsLength - 1) {
            return true;
          }
          innerLoopCount += 1;
        }
      });
      if (Array.isArray(filteredIssueList) && filteredIssueList.length) {
        return res.send(filteredIssueList);
      } else {
        return res.send([]);
      }
    });
  },
  createIssue: (req, res) => {
    const {
      issue_title,
      issue_text,
      created_by,
      assigned_to = "",
      status_text = ""
    } = req.body;
    const projectName = req.params.project;
    if (!issue_title || !issue_text || !created_by) {
      return res.json({ error: "required field(s) missing" });
    }
    const currentTime = new Date();
    const issueToBeAdded = new Issue({
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      open: true,
      created_on: currentTime,
      updated_on: currentTime
    });
    Project.find({ projectName }, (err, docs) => {
      if (!docs.length) {
        const projectToBeCreated = new Project({
          projectName
        });
        projectToBeCreated.issues.push(issueToBeAdded);
        projectToBeCreated.save((err, data) => {
          if (err) {
            return console.error(err);
          } else {
            res.json(data);
          }
        });
      } else {
        docs[0]["issues"].push(issueToBeAdded);
        docs[0].save((err, data) => {
          if (err) {
            res.send("An error occured while creating the issue");
          } else {
            res.json(issueToBeAdded);
          }
        });
      }
    });
  },
  editIssue: (req, res) => {
    const {
      _id,
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      open = undefined
    } = req.body;
    const params = {
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
      open
    };
    const filteredParams = Helper.removeUndefinedAndEmptyStringValuesFromObj(
      params
    );
    let projectName = req.params.project;
    if (!_id) {
      return res.json({ error: "missing _id" });
    } else if (Helper.checkIsEmptyObject(filteredParams)) {
      return res.json({ error: "no update field(s) sent", _id: _id });
    } else {
      Project.findOne({ projectName }, (err, docs) => {
        if (err || !docs) {
          return res.json({ error: "could not update", _id: _id });
        }
        const issueToBeUpdated = docs.issues.id(_id);
        if (!issueToBeUpdated) {
          return res.json({ error: "could not update", _id: _id });
        }
        issueToBeUpdated.issue_title =
          issue_title || issueToBeUpdated.issue_title;
        issueToBeUpdated.issue_text = issue_text || issueToBeUpdated.issue_text;
        issueToBeUpdated.created_by = created_by || issueToBeUpdated.created_by;
        issueToBeUpdated.assigned_to =
          assigned_to || issueToBeUpdated.assigned_to;
        issueToBeUpdated.status_text =
          status_text || issueToBeUpdated.status_text;
        issueToBeUpdated.open = open || issueToBeUpdated.open;
        docs.save((err, data) => {
          if (err || !data) {
            return res.json({ error: "could not update", _id: _id });
          } else {
            return res.json({ result: "successfully updated", _id: _id });
          }
        });
      });
    }
  },
  deleteIssue: async (req, res) => {
    const { _id } = req.body;
    const projectName = req.params.project;
    if (!_id) {
      return res.json({ error: "missing _id" });
    }
    Project.findOne({ projectName }, (err, docs) => {
      const projectHasSelectedIssue = docs.issues.filter(
        obj => obj["_id"].toString() === _id
      ).length;
      if (err || !projectHasSelectedIssue) {
        return res.json({ error: "could not delete", _id: _id });
      }
      const updatedListOfIssues = docs.issues.filter(
        obj => obj["_id"].toString() !== _id
      );
      docs.issues = updatedListOfIssues;
      docs.save((err, data) => {
        if (err) {
          return res.json({ error: "could not delete", _id });
        }
        res.json({ result: "successfully deleted", _id });
      });
    });
  }
};
module.exports = issueController;