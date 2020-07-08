import React, { Component } from "react";
import Task from "./Task";

class Project extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (

        <div className="my-3 p-3 bg-white rounded shadow-sm">
        {/* PROJECT BLOCK START */}

          {/* Project title */}
          <h6 className="border-bottom border-gray pb-2 mb-0">Project title</h6>

          {/* Project tasks list */}
          <div sortable-type = "TaskContainer">
            <Task title={"Very lonely project task"}/>
          </div>

          {/*! Project Footer */}
          <small className="d-block text-right mt-3">
            <a href="#">Load more tasks</a>
          </small>

        {/* PROJECT BLOCK END */}
        </div>

    );
  }
}

export default Project;