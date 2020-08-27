import React, {Component} from "react";
import './App.css';
import {DragDropContext} from "react-beautiful-dnd";
import ProjectListUIC from "./ProjectsUIC";
import EventListUIC from "./EventsUIC";
import MIMApi from "../MIMApi";
import ScheduleManager from "../ScheduleManager";
import moment from "moment";

window.moment = moment

class App extends Component {
  constructor(props) {
    super(props);

    // App State
    this.state = {
      events: [],
    }

    // API, Schedule Manager
    this.api = new MIMApi(this)
    this.scheduleManager = new ScheduleManager(this, this.api)

    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    this.scheduleManager.init()
  }

  render() {

    window.api = this.api
    window.sm = this.scheduleManager

    if(this.state.events.length === 0) return(<div>Loading...</div>)

    const showFilterButtonActivity = false

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <div
          className="container-fluid d-flex flex-column vh-100 overflow-hidden"
        >
          {!showFilterButtonActivity ? "" : (
            <div
              className={"d-flex flex-row bd-highlight mb-1"}
              onClick={() => this.clearFilter('activity')}
              style={{cursor: 'default',}}
            >
              <div className="bd-highlight filter-button rounded-left">
                <code>
                  <span className="font-weight-bold">X</span>
                </code>
              </div>
              <div className="bd-highlight filter-button rounded-right">
                <code>
                  filtered by Activity
                </code>
              </div>
            </div>
          )}
          <div className="row flex-grow-1 overflow-hidden">


            {/* PROJECTS */}

            <div
              className="scrollingcolumns col-6 mh-100 overflow-auto py-6"
              style={{display: "none"}}
            >
              <div className="my-3 p-3 bg-white rounded shadow-sm">
                <ProjectListUIC/>
              </div>
            </div>

            {/* EVENTS */}
              <EventListUIC events={this.state.events}/>
          </div>
        </div>

      </DragDropContext>
    );
  }
}

export default App;
