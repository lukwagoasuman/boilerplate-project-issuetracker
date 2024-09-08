const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
chai.use(chaiHttp);

let idToBeEditedAndDeleted;
suite("Functional Tests", function() {
  test("Create an issue with every field: POST request to /api/issues/{project}", done => {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        issue_title: "I have an issue",
        issue_text: "describing the issue....",
        created_by: "the main culprit",
        open: true,
        assigned_to: "The person who has to put out the fire",
        status_text: "ready to be assigned"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        idToBeEditedAndDeleted = res["body"]["_id"];
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });
  test("Create an issue with only required fields: POST request to /api/issues/{project}", done => {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        issue_title: "my issue",
        issue_text: "my description of the issue",
        created_by: "the person who created the issue"
      })
      .end((err, res) => {
        console.log(res.body); // Log the response body to inspect its structure
        assert.equal(res.status, 200);
        if (err) {
          done(err);
        } else {
        // Check if response body contains the issue_title
          assert.property(res.body, 'issue_title');
          done();
        }
      });
                      });
  test("Create an issue with missing required fields: POST request to /api/issues/{project}", done => {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        issue_title: "I have an issue",
        assigned_to: "The person who has to put out the fire",
        status_text: "ready to be assigned"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });
  test("View issues on a project: GET request to /api/issues/{project}", done => {
    chai
      .request(server)
      .get("/api/issues/apitest")
      .end((err, res) => {
        assert.typeOf(
          res.body,
          "array",
          "A plain GET request to /api/issues/apitest returns an array"
        );
        assert.equal(res.status, 200);
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });
  test("View issues on a project with one filter: GET request to /api/issues/{project}", done => {
    chai
      .request(server)
      .get("/api/issues/apitest")
      .query({ open: false })
      .end((err, res) => {
        assert.typeOf(
          res.body,
          "array",
          "A GET request with a single filter to /api/issues/apitest returns an array"
        );
        assert.equal(res.status, 200);
        for (let i = 0; i < res.body.length; i += 1) {
          assert.equal(res["body"][i]["open"], false);
        }
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });
  test("View issues on a project with multiple filters: GET request to /api/issues/{project}", done => {
    chai
      .request(server)
      .get("/api/issues/apitest")
      .query({ open: false, _id: idToBeEditedAndDeleted })
      .end((err, res) => {
        assert.typeOf(
          res.body,
          "array",
          "A GET request with multiple filters to /api/issues/apitest returns an array"
        );
        assert.equal(res.status, 200);
        for (let i = 0; i < res.body.length; i += 1) {
          assert.equal(res["body"][i]["open"], false);
          assert.equal(res["body"][i]["_id"], idToBeEditedAndDeleted);
        }
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });
  test("Update one field on an issue: PUT request to /api/issues/{project}", done => {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        issue_title: "I was edited via the testttttttttt",
        _id: idToBeEditedAndDeleted
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          result: "successfully updated",
          _id: idToBeEditedAndDeleted
        });
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });
  test("Update multiple fields on an issue: PUT request to /api/issues/{project}", done => {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        issue_title:
          "A title of an issue with multiple fields that were updated.",
        open: false,
        _id: idToBeEditedAndDeleted
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          result: "successfully updated",
          _id: idToBeEditedAndDeleted
        });
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });
  test("Update an issue with missing _id: PUT request to /api/issues/{project}", done => {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        issue_title: "Title but no _id"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: "missing _id" });
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });
  test("Update an issue with no fields to update: PUT request to /api/issues/{project}", done => {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        _id: "606d9298a76c980d6660a24c"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          error: "no update field(s) sent",
          _id: "606d9298a76c980d6660a24c"
        });
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });
  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", done => {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        issue_title: "This title should never exist",
        _id: "606d928da76c980d6660a24b"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          error: "could not update",
          _id: "606d928da76c980d6660a24b"
        });
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });
  test("Delete an issue: DELETE request to /api/issues/{project}", done => {
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .send({
        _id: idToBeEditedAndDeleted
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          result: "successfully deleted",
          _id: idToBeEditedAndDeleted
        });
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });
  test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", done => {
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: "missing _id" });
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });
  test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", done => {
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .send({
        _id: "606ed76058107a34be088888"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          error: "could not delete",
          _id: "606ed76058107a34be088888"
        });
        if (err) {
          done(err);
        } else {
          done();
        }
      });
  });
});