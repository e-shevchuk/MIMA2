import React, {Component} from "react";
import './App.css';
import {DragDropContext} from "react-beautiful-dnd";
import ProjectListUIC from "./ProjectsUIC";
import EventListUIC from "./EventsUIC";

const allEvents = [
      {
        "id": 101,
        "activityId": 301,
        "title": "WorldTime cafe",
        "feasibility": 1,
        "start": 1593579600000,
        "duration": "11:00:00",
        "time": [
          {
            "id": 402,
            "duration": 1800000,
            "title": "Listen",
            "pinned": false,
            "timeComplete": false,
            "taskComplete": false,
          },
          {
            "id": 403,
            "duration": 1200000,
            "title": "Drink a cup a cappuccino",
            "pinned": false,
            "timeComplete": false,
            "taskComplete": false,
          },
        ],
      },
      {
        "id": 102,
        "activity_id": 301,
        "title": "WorldTime cafe",
        "feasibility": 1,
        "start": 1593583200000,
        "duration": "11:00:00",
        "time": [
          {
            "id": 404,
            "duration": 1200000,
            "title": "Drink a cup a cappuccino",
            "pinned": false,
            "timeComplete": false,
            "taskComplete": false,
          },
          {
            "id": 405,
            "duration": 600000,
            "title": "Make a todo list",
            "pinned": true,
            "timeComplete": false,
            "taskComplete": false,
          },
          {
            "id": 406,
            "duration": 1800000,
            "title": "Produce genius idea",
            "pinned": true,
            "timeComplete": false,
            "taskComplete": false,
          },
        ],
      },
      {
        "id": 103,
        "activity_id": 301,
        "title": "WorldTime cafe",
        "feasibility": 1,
        "start": 1593698400000,
        "duration": "03:00:00",
        "time": [],
      },
    ]


class App extends Component {
  constructor(props) {
    super(props);

    // App State
    this.state = {
      events: [],
    }

    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    this.setState({events: allEvents})
  }

  render() {

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
