require("@babel/polyfill");
import React, {Component} from "react";
import './../App.css';
import {DragDropContext} from "react-beautiful-dnd";
import JSONPretty from "react-json-pretty";
import initialData from "./dev-data";
import Event from "./Event"
import Project from "./Project";
import APIsecretary from "./APIsecretary";
import getCookie from "./service_functions";
import Numeral from "numeral";
import moment from 'moment';
import Moment from 'react-moment';
import MIMApi from "./MIMApi";

window.MIMApi = MIMApi;
window.moment = moment;
window.getCookie = getCookie;


window.APIsecretary = APIsecretary;

// Compare two tasks using "order" field, to do [].sort(...OrderCompare)
function taskOrderCompare(t1, t2) {
  let result = 0;
  if (t1.order > t2.order) result = 1;
  if (t1.order < t2.order) result = -1;
  return result;
}

// Compare two tasks using "start" date field (via [].sort(...OrderCompaer)
function eventStartCompare(e1, e2, events){
  // To store simple comparattion result
  let delta;

  // If 'events' is missing, consider e1 & e2 to the actual events
  if (events === undefined)
    // Get 'start' dates and compare their 'seconds' equivalents
    delta = moment(e1.start).diff(moment(e2.start), 'seconds')

  // Otherwise, if parameter 'events' is given, consider e1 & e2 to be IDs
  // and events a dictionary with all the available events info

  // Get 'start' dates and compare their 'seconds' equivalents
  delta = moment(events[e1].start).diff(moment(events[e2].start), 'seconds')

  return Math.sign(delta)
}
window.eventStartCompare = eventStartCompare;

window.taskOrderCompare = taskOrderCompare;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      allTasks: [],
      allEvents: [],
      tq: [],
      error: null,
      isLoaded: false,
      taskLastCreatedId: 0,
      filter: {
        "activity": 0,
      },
    };

    this.onDragEnd = this.onDragEnd.bind(this);
    this.refreshTasks = this.refreshTasks.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.tasksByEventId = this.tasksByEventId.bind(this);
    this.getTask = this.getTask.bind(this);
    this.getEvent = this.getEvent.bind(this);
    this.taskUpdAPIrequest = this.taskUpdAPIrequest.bind(this);
    this.taskUpdate = this.taskUpdate.bind(this);
    this.taskCreateAPIrequest = this.taskCreateAPIrequest.bind(this);
    this.taskDeleteAPIrequest = this.taskDeleteAPIrequest.bind(this);
    this.taskCreate = this.taskCreate.bind(this);
    this.taskDelete = this.taskDelete.bind(this);
    this.fixTasksOrder = this.fixTasksOrder.bind(this);
    this.isNewTask = this.isNewTask.bind(this);
    this.isTaskTemporary = this.isTaskTemporary.bind(this);
    this.overSheduled = this.overSheduled.bind(this);
    this.setFilter = this.setFilter.bind(this)
    this.clearFilter = this.clearFilter.bind(this)

    // API requests secretary
    this.secretary = new APIsecretary();

    // New task default value
    this.newTaskTemplate = {
      "project_id": "",
      "title": "",
      "duration": "00:10:00",
      "complete": false,
      "order": 0,
      "active": true
    };

    // The list app elements React refs
    this.appRefs = {
      "event": {},
      "day": {},
      "column": {
        "projects": React.createRef(),
        "tasks": React.createRef(),
      }
    };

    window.tasksByEventId = this.tasksByEventId;
    window.state = this.state;
    window.app = this;
    window.taskUpdAPIrequest = this.taskUpdAPIrequest;
    window.taskUpdate = this.taskUpdate;
    window.secretary = this.secretary;
    window.getTask = this.getTask;
    window.taskDelete = this.taskDelete;
    window.allEvents = this.state.allEvents;
    window.setFilter = this.setFilter;

    this.fixTasksOrder();

    this.api = new MIMApi()
    window.api = this.api
  }

  overSheduled(eventId){

    // If no ID passed, or no Such event, or event has no tasks return 0
    if (eventId === undefined) return 0;
    if (Object.keys(getEvent(eventId)).length === 0) return 0;
    if (tasksByEventId(eventId).length === 0) return 0;


    // Get the busy time in minutes

    // Get the list event's tasks
    const minutesBusy = tasksByEventId(eventId)
      // Pull durations
      .map(id => this.getTask(id).duration)
        // Convert into minutes
        .map(duration => moment.duration(duration))
          // Summarize
          .reduce((a, b) => (a + b))

    // Get the event duration in minutes

    // Just pull it from event and convert into minutes
    const minutesEventDuration =
      moment.duration(this.getEvent(eventId).duration)

    // Voila!!!
    const availableMinutes = (minutesEventDuration - minutesBusy) / 60000
    return availableMinutes
  }

  isTaskTemporary(id){
    return (Number(id) > 1000000);
  }

  fixTasksOrder(){
  /*
    This function updates order fields of all the task on load. For instance
    for five tasks already sorted by their order values, their order values
    will be updated as follows: {1, 3, 9, 10, 14} =>  {0, 1, 2, 3, 4}
  */

    // Go throught each event
    Object.keys(this.state.allEvents).map((eventId) => {
      // Get sorted list of attached tasks
      this.tasksByEventId(eventId)
        // For each task and its list index
        .map((taskId, index) =>{
          // If task 'order' != index
          if(this.state.allTasks[taskId]["order"] != index)
            // If task isn't temporary
            if(!(this.isTaskTemporary(taskId)))
              // Update task - set it's order equal to index
              this.taskUpdate({id: taskId, order: index});
      })
    })

  }

  setFilter(type, value){
    const filterNew = JSON.parse(JSON.stringify(this.state.filter))
    filterNew[type] = value
    this.setState({filter: filterNew})
  }

  clearFilter(type){
    const filterNew = JSON.parse(JSON.stringify(this.state.filter))
    filterNew[type] = 0
    this.setState({filter: filterNew})
  }

  taskUpdate(task, immediately = false) {

    // Creating copy of current state for its recovery in case of fail
    const AllTasksOld = JSON.parse(JSON.stringify(this.state.allTasks));

    // Creating copy of current state immediate update
    const AllTasksNew = JSON.parse(JSON.stringify(this.state.allTasks));
    // Merge updated data into the current state
    AllTasksNew[task.id] = Object.assign(AllTasksNew[task.id], task);
    // Applyting the new allTasks set to the App state
    this.setState({allTasks: AllTasksNew});

    const props = {
      AllTasksOld: AllTasksOld,
      task: task,
    };

    if (immediately)
      this.secretary.call(taskUpdAPIrequest, task.id, props);
    else
      this.secretary.schedule(taskUpdAPIrequest, task.id, props);


  }

  taskUpdAPIrequest(props) {

    // Unpacking props
    const {AllTasksOld, task} = props;

    // Prepare API request parameters
    const csrftoken = getCookie('csrftoken');
    const url = 'https://mima.f15.dev/api/tasks/' + task.id + '/';
    console.log(url)
    console.log(task)

    // Do the API request
    fetch(
      url,
      {
        method: 'PUT',
        headers: {
          "Content-Type": 'application/json',
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify(task),
      }).then(result => {

      // If update is not successful
      if (result.status !== 200) {
        // Revert state to allTasks set to the App state
        this.setState({allTasks: AllTasksOld});
        console.log("Task", task.id, "rolling back");
        console.log(result);
      }

      }).catch(error => {
        // Revert state to allTasks set to the App state
        console.log("Task", task.id, "rolling back");
        console.error('Error:', error);
        this.setState({allTasks: AllTasksOld});
      });
  }

taskCreateAPIrequest(task) {

  // Creating copy of current state for its recovery in case of fail
  const AllTasksOld = JSON.parse(JSON.stringify(this.state.allTasks));
  // Creating copy of current state immediate update
  const AllTasksNew = JSON.parse(JSON.stringify(this.state.allTasks));

  // Temporary id is to be from Date.now()
  const taskTmpId = Date.now();
  // Remove the id from initial data (just in case)
  if("id" in task) delete task.id;
  // New task is made from defaults with "our" values all together
  const newTask = Object.assign(this.newTaskTemplate, task);

  // // += 1 all tasks order, whoes order >= NewTask order
  // Object.keys(AllTasksNew).map(id => {
  //   if (AllTasksNew[id]["event_id"] === newTask["event_id"])
  //     if (AllTasksNew[id]["order"] >= newTask["order"])
  //       this.taskUpdate({id: id, order: AllTasksNew[id]["order"] += 1});
  // });

  // Add updated data into the current state
  AllTasksNew[taskTmpId] = {"id": taskTmpId, ...newTask};


  console.log("Setting temporary NewTask ID:", taskTmpId);
  // Applying the new allTasks set to the App state
  this.setState({allTasks: AllTasksNew, taskLastCreatedId: taskTmpId});

  // Prepare API request parameters
  const csrftoken = getCookie('csrftoken');
  const url = 'https://mima.f15.dev/api/tasks/';

  console.log("The new task:", JSON.stringify(newTask));

  // Do the API request
  fetch(
    url,
    {
      method: 'POST',
      headers: {
        "Content-Type": 'application/json',
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(newTask),
    }).then(result => {

    // If update is not successful
    if (!(result.status === 201)) {
      // Revert state to allTasks set to the App state
      this.setState({allTasks: AllTasksOld});
      console.log("Task wasn't created error status:", result.status)
      return;
    }

    // Start pulling the created task in the next "then"
    return result.json();

    }).then(task => {
    // Now task is created and we've got a copy of it's instance,
    // remove the temporary task
    delete AllTasksNew[taskTmpId];
    // Add the real one instead of it
    AllTasksNew[task.id] = task;

    // Push the real New task to the App State
    this.setState({allTasks: AllTasksNew, taskLastCreatedId: task.id});

    setTimeout(this.fixTasksOrder, 100);

    }).catch(error => {
      // If something went completely off the rails
      // Revert state to allTasks set to the App state
      console.error('Error:', error);
      this.setState({allTasks: AllTasksOld});
    });

  }

  taskDeleteAPIrequest(id) {

    // Creating copy of current state for its recovery in case of fail
    const AllTasksOld = JSON.parse(JSON.stringify(this.state.allTasks));
    // Creating copy of current state for immediate update
    const AllTasksNew = JSON.parse(JSON.stringify(this.state.allTasks));

    // Remove the task from the new version of state
    delete AllTasksNew[id];
    // Applying the new allTasks set to the App state
    this.setState({allTasks: AllTasksNew});

    // Prepare API request parameters
    const csrftoken = getCookie('csrftoken');
    const url = 'https://mima.f15.dev/api/tasks/' + id + '/';

    console.log("Deleting task:", JSON.stringify(id));
    console.log("- via URL:", url);

    // Do the API request few seconds later

    setTimeout(() => {
      fetch(
        url,
        {
          method: 'DELETE',
          headers: {
            "Content-Type": 'application/json',
            "X-CSRFToken": csrftoken,
          },
        }).then(result => {

        // If update is not successful
        if (!(result.status === 204)) {
          // Revert state to allTasks set to the App state
          this.setState({allTasks: AllTasksOld});
          console.log("Task wasn't deleted. Error status:", result.status)

        // Process errors
        }}).catch(error => {
          // If something went completely off the rails
          // Revert state to allTasks set to the App state
          console.error('Error:', error);
          this.setState({allTasks: AllTasksOld});
        });
      },
      this.secretary.delay);
  }

  taskCreate(task) {
    taskCreateAPIrequest(task);
  }

  taskDelete(task) {
    const id = (typeof(id) == 'object' && "id" in task) ? task.id : task;

    this.taskDeleteAPIrequest(id);
  }



  tasksByEventId(eventId) {
    // Make a copy of current tasks list
    const allTasks = this.state.allTasks;

    // Create an empty list tasks. To be of form [{id: .. , order: ..}]
    const eventTasks = [];
    // Run in cycle through all the tasks
    Object.keys(allTasks).map(id => {
      // If task belong to the event
      if (allTasks[id].event_id == eventId)
        // Add the task to the list
        eventTasks.push({
          id: id,
          order: allTasks[id].order
        })
    })

    // Sort the list by "order" field
    eventTasks.sort(taskOrderCompare);

    // Return the Extracted sorted tasks id list
    return eventTasks.map(t => t.id);
  }

  onDragEnd(result) {

    // If dropped outside the list - do nothing
    if (!result.destination) return;

    // INITIALIZATION

    // Unpacking param values from resul
    const {
      source: {
        index: fromOrder,
        droppableId: fromEventID
      },
      destination: {
        index: toOrder,
        droppableId: toEventID
      },
      draggableId: taskId

    } = result;

    // DRAG & DROP PROCESS

    // If there was no actual dragging
    if (fromEventID === toEventID && fromOrder === toOrder){
      // Do nothing
      console.log("DND: Dragging has ended where it started.");
      return;
    }

    // Deciding on a way to insert - above or below the target index "i":

    // - to insert above, set the new 'order' value as i + (-delta), where
    //   0 ≤ delta ≤ 1, so with all other integer indices dropped element
    //   will take place between i-1 and i. Current i-th element will
    //   be shifted below
    //
    // - to insert below, new 'order' value is to be i + (+delta)
    //
    //   For dropping within the same event to a position below delta < 0,
    //   for all other cases delta > 0
    const d = (fromEventID === toEventID && toOrder > fromOrder) ? +.1 : -.1;

    // Updating 'event' and 'order' of dropped task
    const taskParametersUpdate = {
      id: taskId,
      event_id: toEventID,
      order: toOrder + d}

    this.taskUpdate(taskParametersUpdate, true);

    // Fixing the order, bringing all indices back to integers
    setTimeout(this.fixTasksOrder, 100);
  }

  getTask(taskId = -1) {
    /*
    Return: - tasks parameters by ID
            - available tasks number, if ID isn't specified
    */

    if (taskId === -1) {
      return Object.keys(this.state.allTasks).length
    }

    return {...this.state.allTasks[taskId]};
  }

  getEvent(eventId = -1) {
    /*
    Return: - events parameters by ID
            - number of available, if ID isn't specified
    */

    if (eventId === -1) {
      return Object.keys(this.state.allEvents).length
    }

    return {...this.state.allEvents[eventId]};
  }

  refreshTasks() {
    fetch('https://mima.f15.dev/api/tasks')
      .then(response => response.json())
      .then(result => {

        // Transform tasks into {id: {...task fields}}
        const allTasks = {};
        result.results.map(t => {
          allTasks[t.id] = t
        })

        // Pulling events
        this.refreshEvents(this);

        this.setState({allTasks: allTasks});

        this.fixTasksOrder();

      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  refreshEvents() {
    fetch('https://mima.f15.dev/api/events')
      .then(response => response.json())
      .then(result => {

        // Transform Events into {id: {...events fields}}
        const allEvents = {};
        result.results.map(e => {
          allEvents[e.id] = e
        })

        // Push Events in this form the the App state
        this.setState({allEvents: allEvents});
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  componentDidMount() {
    this.refreshTasks();

    // COLUMNS RESIZE & SCROLL

    /* Both:

    - projects imported tasks
    - activities tasks lists

    are to be scrollable independently from each other. To do that,
    we put each into a separate DIV that ends at the screen bottom
    and has its own independent scroll */

    // Update columns heights right after the page rendering is finished
    $(document).ready(function(){
        $('.scrollingcolumns').css('max-height', window.innerHeight-80);
    });

    // Update columns heights right if page was resized
    $(window).resize(function(){
        $('.scrollingcolumns').css('max-height', window.innerHeight-80);
    });

    if (this.appRefs.column.tasks.current != null)
      setTimeout(()=>this.appRefs.column.tasks.current.scrollTo(0, this.appRefs.event[20].current.offsetTop), 1700)


  }

  isNewTask(id){
    /*
     Check if the id is really the maximal task id at the moment
    */

    // Get the maximum task id
    const maxTaskId = Object.keys(this.state.allTasks).reduce(
      (a, b) => Math.max(a, b));

    return (String(id) === String(maxTaskId));
  }



  render() {

    // If the app date isn't loaded yet - do nothing
    if (Object.keys(app.state.allEvents).length === 0) return (
        <div className="container-fluid d-flex flex-column vh-100 overflow-hidden">
          <div className="row flex-grow-1 overflow-hidden"></div>
        </div>
    );

    // UNPACK VALUES
    const events = JSON.parse(JSON.stringify(allEvents))


    // Pulling events data from the state
    const getTask = this.getTask;
    const getEvent = this.getEvent;
    window.getTask = this.getTask;
    window.getEvent = this.getEvent;
    window.task = this.state.allTasks["1"];
    window.taskCreateAPIrequest = this.taskCreateAPIrequest;
    window.allEvents = this.state.allEvents;
    window.allTasks = this.state.allTasks;
    window.fixTasksOrder = this.fixTasksOrder;
    window.taskLastCreatedId = this.state.taskLastCreatedId;
    window.overSheduled = this.overSheduled;
    window.setState = this.setState

    // INTERNAL FUNCTIONS

    // Time difference between two events (in days)
    const eventDayDiff = (id1, id2) => {
      // If requested events are exist
      if (id1 in allEvents && id2 in allEvents) {

        // Pull the respective start dates
        const id1Start = moment(allEvents[id1].start)
        const id2Start = moment(allEvents[id2].start)

        // consider differences in more than 24 hours
        const deltaOver24 = id2Start.diff(id1Start, 'days')
        // consider difference in less than 24 hours but different days
        const deltaLess24 = id2Start.day() - id1Start.day()

        // If difference is less than 24 hours, take appropriate delta
        const delta = deltaOver24 !== 0 ? deltaOver24 : deltaLess24

        return delta
      }
    }

    window.eventDayDiff = eventDayDiff
    window.newTaskTemplate = this.newTaskTemplate


    // Compare two events by their dates, given events IDs and events dict
    const eventsCompare = (e1, e2) => eventStartCompare(e1, e2, allEvents)

    // RENDER VALUES COMPUTATION

    // List of events IDs sorted by their respective start dates
    let eventsIDs = Object.keys(allEvents).sort(eventsCompare)
    // Apply the activity filter
    if ('activity' in this.state.filter)
      if (this.state.filter.activity !== 0)
        eventsIDs = eventsIDs.filter(id => {
          return (getEvent(id).activity_id === this.state.filter.activity)})

    let showFilterButtonActivity = false
    if ('activity' in this.state.filter)
      if (this.state.filter.activity !== 0)
          showFilterButtonActivity = true


    // First event in the list date
    const firstEventStart = allEvents[eventsIDs[0]].start;

    window.eventsIDs = eventsIDs;
    window.appRefs = this.appRefs;
    window.newTaskTemplate = this.newTaskTemplate;
    window.api = this.api

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
                <Project/>
              </div>
            </div>

            {/* ACTIVITIES */}

            <div
              className="scrollingcolumns col-12 mh-100 overflow-auto py-12"
              style={this.overScroll}
              ref={this.appRefs.column.tasks}
            >
              <div className="my-3 p-3 bg-white shadow-sm">

                {/* Events list */}

                {/*{Object.keys(events).map((id, index) => {*/}
                {eventsIDs.map((id, index) => {

                  let displayDate = true;
                  if (index > 0 && eventDayDiff(eventsIDs[index-1], id) === 0)
                    displayDate = false

                  return (
                    <div key={index}>
                      <Event
                        {...getEvent(id)}
                        getTask={getTask}
                        taskUpdate={this.taskUpdate}
                        tasksByEventId={tasksByEventId(id)}
                        allTasks={this.state.allTasks}
                        taskCreate={(order=0) => (
                          this.taskCreate({
                            "event_id": id,
                            "order": order}))}
                        taskLastCreatedId={this.state.taskLastCreatedId}
                        taskDelete={this.taskDelete}
                        isNewTask={this.isNewTask}
                        displayDate={displayDate}
                        overSheduled={() => this.overSheduled(id)}
                        appRefs={this.appRefs}
                        filterActivity={()=> {this.setFilter(
                            'activity', getEvent(id).activity_id)}}
                      />
                    </div>
                    );
                })}
              </div>
            </div>
          </div>
        </div>

      </DragDropContext>
    );
  }
}

export default App;

