import React, {Component} from "react";
import './App.css';
import {DragDropContext} from "react-beautiful-dnd";
import Event from "./Event"
import Project from "./Project";
import APIsecretary from "./APIsecretary";
import getCookie from "./service_functions";
import moment from 'moment';
import MIMApi from "./MIMApi";
import StateSnapshotter from "./StateSnapshotter"
import {css} from "styled-components";

window.MIMApi = MIMApi;
window.moment = moment;
window.getCookie = getCookie;
window.StateSnapshotter = StateSnapshotter;


window.APIsecretary = APIsecretary;

// Compare two tasks using "order" field, to do [].sort(...OrderCompare)
function compareByOrder(t1, t2) {
  let result = 0;
  if (t1.order > t2.order) result = 1;
  if (t1.order < t2.order) result = -1;
  return result;
}


// Compare two tasks using "start" date field (via [].sort(...OrderCompaer)
function eventStartCompare(e1, e2, events){

  // To store simple comparattion result
  let delta;

  // If 'events' is missing, consider e1 & e2 to be an actual event objects
  if (events === undefined){
    // console.log('eventStartCompare() ids: ', e1, e2)

    // Get 'start' dates and compare their 'seconds' equivalents
    delta = moment(e1.start).diff(moment(e2.start), 'seconds')
  }

  // Otherwise, if parameter 'events' is given, consider e1 & e2 to be IDs
  // and events a dictionary with all the available events info
  else{
    // Get 'start' dates and compare their 'seconds' equivalents
    delta = moment(events[e1].start).diff(moment(events[e2].start), 'seconds')
  }

  return Math.sign(delta)
}

// Compare two time records using earlies of the events they are scheduled to
function timeRecordByEventCompare(t1, t2, events){
  console.log(t1, t2)

  // Get the earliest events for each time Record
  if(!('event' in t1) && !('event' in t2)) return -1
  if(('event' in t1) && !('event' in t2)) return -1
  if(!('event' in t1) && ('event' in t2)) return 1

  const e1 = Object.keys(events).map(eId => events[eId])
    .filter(e => Number(e.id) == Number(t1.event))
      .reduce((ea, eb) => (moment(ea.start) >= moment(eb.start)) ? ea : eb)

  const e2 = Object.keys(events).map(eId => events[eId])
    .filter(e => Number(e.id) == Number(t2.event))
      .reduce((ea, eb) => (moment(ea.start) >= moment(eb.start)) ? ea : eb)

  return eventStartCompare(e1.id, e2.id, events)
}

/**
 * @param {'String: hh:mm:ss'} available take only pinned tasks into account
 * @param {'String: hh:mm:ss'} duration take only uncompleted tasks into account
 * @param {'String: hh:mm:ss'} minSplit - minimal that split duration
 *
 * @return: {String} total event available duration in 'hh:mm:ss' format
 */
function softTime(
  available,
  duration,
  minSplit)
{
  // Function that return maximum duration from the provided list
  const max = (list) => list.reduce((a, b) => a > b ? a : b)

  // Converting input into moments
  const a = moment.duration(available)
  const d = moment.duration(duration)
  const m = minSplit ? moment.duration(minSplit) : moment.duration('00:20:00')
  // TODO: Make the threshold to be dependable on task duration (10-20-30 min)

  // Zero duration
  const zero = moment.duration('00:00:00').format('hh:mm:ss', {trim:false})

  // If there is now need to split the task - we're golden
  if (a >= d) return d.format('hh:mm:ss', {trim: false})

  // If task needs splitting and available time
  // is less than minimal allowable duration - we got zero
  if (a < m) return zero

  // If task needs splitting but it is too small to be splitted
  // to at least two minimal duration fragments - we got zero
  if (d < moment.duration(2 * m)) return zero

  // Compute the second part of a task after a split
  // for it to be at least of minimal duration
  const tail = max([m, moment.duration(d - a)])

  // Everything that isn't a second part of a task (tail) is it's first part
  return moment.duration(d - tail).format('hh:mm:ss', {trim: false})
}

window.eventStartCompare = eventStartCompare;

window.compareByOrder = compareByOrder

class App extends Component {
  constructor(props) {
    super(props);

    // App State
    this.state = {
      allTasks: {},
      allEvents: {},
      allActivities: {},
      allTimeRecords: {},
      taskLastCreatedId: 0,
      filter: {
        "activity": 0,
      },
    };

    // App elements refs
    this.appRefs = {
      "event": {},
      "day": {},
      "column": {
        "projects": React.createRef(),
        "tasks": React.createRef(),
      }
    }

    this.onDragEnd = this.onDragEnd.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.getTask = this.getTask.bind(this);
    this.getEvent = this.getEvent.bind(this);
    this.taskUpdate = this.taskUpdate.bind(this);
    this.taskCreate = this.taskCreate.bind(this);
    this.taskDelete = this.taskDelete.bind(this);
    this.fixTasksOrder = this.fixTasksOrder.bind(this);
    this.isNewTask = this.isNewTask.bind(this);
    this.isTaskTemporary = this.isTaskTemporary.bind(this);
    this.overSheduled = this.overSheduled.bind(this);
    this.setFilter = this.setFilter.bind(this)
    this.clearFilter = this.clearFilter.bind(this)
    this.timeRecordsByEvent = this.timeRecordsByEvent.bind(this);
    this.tasksByEventId = this.tasksByEventId.bind(this);
    this.timeDelete = this.timeDelete.bind(this)
    this.redistribute = this.redistribute.bind(this)
    this.eventTimeAvailable = this.eventTimeAvailable.bind(this)
    this.timePut = this.timePut.bind(this)
    this.fixTimeRecordsOrder = this.fixTimeRecordsOrder.bind(this)
    this.eventTimeRecordsNum = this.eventTimeRecordsNum.bind(this)
    this.activityRedistribute = this.activityRedistribute.bind(this)
    this.timeRecordsByTask = this.timeRecordsByTask.bind(this)
    this.eventsSeparateRedistribute = this.eventsSeparateRedistribute.bind(this)
    this.eventByTaskID = this.eventByTaskID.bind(this)

    // API class to deal with REST backend
    this.api = new MIMApi(this)
    // API requests secretary
    this.secretary = new APIsecretary();
    // API State backup-er, to roll back to in case of failure
    this.stateArchive = new StateSnapshotter(this)
  }

  /**
   * @param {Number} eventId take only pinned tasks into account
   * @param {boolean} pinAndCompleteOnly take only pinned tasks into account
   *
   * @return: {String} total event available duration in 'hh:mm:ss' format
   */
  eventTimeAvailable(eventId, fixedOnly=false){

    // INITIALIZATION

    // Pull the overall event duration
    const eventDuration = moment.duration(this.getEvent(eventId).duration)

    // Make a copy and isolate tasks
    const tasks = JSON.parse(JSON.stringify(this.state.allTasks))
    // Make a copy and isolate time records from the state
    const timeRecords = JSON.parse(JSON.stringify(this.state.allTimeRecords))
    // Form the all time records list for this event
    let list = Object.keys(timeRecords).map(id => timeRecords[id])
    // Format duration into a string'hh:mm:ss'
    let fd = d => moment.duration(d).format('hh:mm:ss', {trim: false})

    // FILTERING

    // By specified event
    list = list.filter(ti => ti.event === eventId)

    // If we consider pined and completed tasks to be only event time consumers
    if (fixedOnly){
      // Filter those out
      list = list.filter(ti => tasks[ti.task].pinned || tasks[ti.task].complete)
    }

    // SUMMATION

    // First will work with miliseconds, than transform
    let durationSumMSecs

    // If there is nothing to sum
    if (list.length === 0)
      // Time records duration sum is zero
      durationSumMSecs = 0

    // If there are time records to summarize
    else
      // Get duration sum in miliseconds:
      durationSumMSecs =
        // Form the list of durations
        list.map(ti => moment.duration(ti.duration))
          // summarize those duration
          .reduce((a,b) => (a + b))

    // console.log('eventTimeAvailable() durationSumMSecs:', fd(durationSumMSecs))
    // console.log('eventTimeAvailable() eventDuration:', fd(eventDuration))


    // Get event available time as 'its duration - list durations sum' delta
    let timeAvailableMSec = eventDuration - durationSumMSecs
    // console.log('eventTimeAvailable() timeAvailableMSec:', fd(timeAvailableMSec))

    // If event available time is negative - Return zero
    if (timeAvailableMSec < 0) return '00:00:00'

    // Format & return the time available
    return fd(timeAvailableMSec)
  }


  /**
   * @param {Number} eventID List of events ordered by start date
   * @returns {Number} number of active time records associated with Event
   */
  eventTimeRecordsNum(eventID){
    return this.timeRecordsByEvent(eventID).length
  }

  /**
   * Run redistribute in a list of consecutively, separately in each
   *
   * @param {Eventslist} events Activity to work on events of
   * @param {callback} onSuccess function to call on redistriubution done
   * @param {funcFilter} taskFilter - function to filter eventTasks to work on
   *
   * (recursive)
   */
  eventsSeparateRedistribute (
    events, taskFilter, onSuccess){
    let log = '===========    EVENTS SEPARATE REDISTRIBUTE     ============\r\n'
    log += '\r\nevents IDs: \r\n' + events.map(e => e.id) + '\r\n'

    // INITIALIZATION

    // If events isn't array - throw an error
    if (!Array.isArray(events)) {
      console.log(log)
      throw new Error("eventTimeRecordsNum(): 'events' should be array")
    }

    const {allTasks} = this.state
    taskFilter = taskFilter || (t => true)

    // If events list is empty - we're done
    if(events.length === 0) {
      // console.log(log + '\r\n events list is empty.')
      onSuccess()
      return
    }

    // Extract the first event from the list
    let evt = events.shift()
    // Get all it's tasks as a list
    let tasks = this.tasksByEventId(evt.id).map(tId => allTasks[tId])

    // If tasks list is empty - we're done too
    if(tasks.length === 0) {
      // console.log(log + '\r\n event ' + evt.id + ' have no tasks.')
      onSuccess()
      return
    }

    // Apply filter from parameters
    log += '\r\ntasks before filter:  \r\n' + tasks.map(t => String(t.id) + String(t.pinned?' pinned':' non pinned')  + ', ') + '\r\n'
    tasks = tasks.filter(taskFilter)
    log += '\r\ntasks after filter:  \r\n' + tasks.map(t => String(t.id) + String(t.pinned?' pinned':' non pinned')  + ', ') + '\r\n'

    // If tasks list is now empty - we're through
    if(tasks.length === 0) {
      // console.log(log + '\r\n event ' + evt.id + ' have no tasks after filter.')
      onSuccess()
      return
    }

    // BASE CASE

    // If all events are redistributed within previous iterations
    if (events.length === 0){
      // console.log(log + '\r\nI was last event. Call onSuccess()')

      // Redistribute just current event and call onSuccess
      this.redistribute(
        [evt],
        tasks,
        onSuccess)

    // GENERAL CASE

    // If events list still has events for redistribution
    } else {

      // log += '\r\ncall redistribute() on'
      // log += '\r\nevent:' + evt.id
      // console.log(log)

      // Redistribute current event and it's tasks within it
      this.redistribute(
        [evt],
        tasks,

        // Recurse on the what is left of the list
        () => this.eventsSeparateRedistribute (
          events,
          taskFilter,
          onSuccess)
      )
    }
  }

  /**
   * @param {number} activityId Activity to work on events of
   * @param {number} startEventId Tasks of this and all following events
   *                              in this activity will be redistributed
   * @param {function} onSuccess function to call on redistriubution done
   */
  activityRedistribute (activityId, startEventId, onSuccess){
    let log = '===============    ACTIVITY REDISTRIBUTE     ================'

    // INITIALIZING

    startEventId = startEventId || undefined
    const { allEvents, allTasks } = this.state
    let events, tasks

    // Create the sorted list of all the events within this activity

    // Pull all the events
    events = Object.keys(allEvents).map(eId => allEvents[eId])
      // Select only those belonging to target activity
      .filter(e => (Number(e.activity_id) === Number(activityId)))

    // If startEventId is provided
    if (startEventId)
      // Filter-out events that start earlier than startEventId
      events = events.filter(e => (
        moment(e.start) >= moment(allEvents[startEventId].start)))
        .sort(eventStartCompare)

    // Create the list of all the redistributable tasks

    // Pull all the events tasks IDs into the list of list
    tasks = events.map(e => this.tasksByEventId(e.id))
      // Merge it into one-dimensional list
      .reduce((a,b) => [...new Set([...a, ...b])])
        // Replace each ID with the actual task data
        .map(tId => allTasks[tId])

    // // Pull all the events tasks IDs into the list of list
    // tasks = events.map(e => this.tasksByEventId(e.id))
    //   // Merge it into one-dimensional list
    //   .reduce((l1,l2) => [].concat(l1, l2))
    //     // Replace each ID with the actual task data
    //     .map(tId => allTasks[tId])

    // Redistribute

    // Filter for unshiftable / shiftable tasks
    const unshiftable = t => (t.pinned || t.complete)
    const shiftable = t => (!t.pinned && !t.complete)

    log += '\r\nactivity ID: ' + activityId
    log += '\r\nstart event ID: ' + startEventId
    log += '\r\nall tasks IDs: ' + tasks.map(t => t.id)
    log += '\r\nunshiftable IDs: ' + tasks.filter(unshiftable).map(t => t.id)
    log += '\r\nshiftable IDs: ' + tasks.filter(shiftable).map(t => t.id)
    // console.log(log)

    // Run Redistribute for all unshiftable tasks (complete and pinned)
    this.eventsSeparateRedistribute(
      JSON.parse(JSON.stringify(events)),
      unshiftable,

      // Run Redistribute for all shiftable tasks (unpinned & uncomplete)
      () => {
        this.redistribute(
          events,
          tasks.filter(shiftable),
          onSuccess)
      }
    )



  }

  /**
   * @param {eventsList} events List of events ordered by start date
   * @param {tasksList} tasks List of tasks ordered by first time records
   *                                      & order within respective event
   * @param {callback} onSuccess function to call when redistriubution is done
   */
  redistribute(events, tasks, onSuccess){
    // console.log('==================    REDISTRIBUTE     ==================='
    // // + 'redistribute(): events', events, '\r\ntasks', tasks
    // // + '\r\nevents #:', events.length, '\r\ntasks #:', tasks.length
    //   + '\r\nevents IDs:', events.map(e => e.id), '\r\ntasks IDs: ',
    //   tasks
    // )

    // INITIALIZATION

    let task, event, noTouch, timeRecordDuration
    const timePut = this.timePut
    const MD = moment.duration
    const MDStr = d => d > 0 ? MD(d).format('hh:mm:ss', {trim: false}) : '00:00:00'
    const timeDelete = this.timeDelete
    const { allTimeRecords } = this.state
    let iterSummary, msg
    let tInd, eInd, tLen, eLen, order
    let lastIteration
    let duration, available

    // PREPARE DATA FOR CYCLING THROUGH

    // Validations on tasks & events to be arrays
    if (!Array.isArray(tasks)){
      msg = "app.redistribute(...) # 'tasks' is to be an array of tasks"
      throw new Error(msg)
    }
    if (!Array.isArray(events)){
      msg = "app.redistribute(...) # 'events' is to be an array of events"
      throw new Error(msg)
    }

    // Sort events
    events = events.sort(eventStartCompare)

    // PREPARE TO CYCLE THROUGH LISTS

    // Zeroing indices
    tInd = 0, eInd = 0
    // Pull list lengths
    tLen = tasks.length, eLen = events.length

    // There are not tasks or events
    if (tasks.length === 0 || events.length === 0)
      // There is nothing to redistribute
      onSuccess()

    // First task - pull duration
    duration = tasks[0].duration
    // First event - get the available time (via eventTimeAvailable)
    available = this.eventTimeAvailable(events[0].id, true)
    // Order value for the first updated / created time record
    order = 0

    // 'No event time records are changed' flag is true, by default
    noTouch = true

    // START CYCLING THROUGH LISTS OF TASKS & EVENTS

    while(tInd < tLen && eInd < eLen){
      // Shortening variable names
      task = tasks[tInd]
      event = events[eInd]
      lastIteration = (tInd === tLen - 1 || eInd === eLen - 1)

      iterSummary =
        'Event(' + event.id + '): ' + eInd + '/' + String(eLen - 1) +
        ' Task(' + task.id + '): ' + tInd + '/' + String(tLen - 1) +
        '\r\nEvent time available: ' + available +
        '\r\nTask duration left: ' + duration

      // ADD TIME RECORDS

      // If we are at the last event

      if (eInd === eLen - 1){
        iterSummary += '\r\nThis is the last event:'

        // Get The time record duration as = to what is left for the task
        timeRecordDuration = duration
        // Decrement 'available' time of the event by whole duration of task
        available = MDStr(MD(available) - MD(duration))
        // Set 'duration' of the task that is left to schedule to zero
        duration = '00:00:00'
        // Check if this is the last iteration
        lastIteration = (tInd === tLen - 1 && duration === '00:00:00')

        // Add time record regardless of its duration and available time
        timePut(
          {
            'event': event.id,
            'task': task.id,
            'duration': timeRecordDuration,
            'order': order},
          true,
           lastIteration ? onSuccess : () => true)
        order++

        // Indicate that we pushed at least part of this task to this event
        noTouch = false

      // If it isn't last event in the list

      } else {

        // Compute 'time-record duration' that can be digested by the event
        timeRecordDuration = softTime(available, duration)

        // If duration we've got is non zero
        if (timeRecordDuration !== '00:00:00'){

          // Decrement 'duration' that is left to schedule of the task
          duration = MDStr(MD(duration) - MD(timeRecordDuration))
          // Decrement 'available' time of the event
          available = MDStr(MD(available) - MD(timeRecordDuration))
          // Check if this is the last iteration
          lastIteration = (tInd === tLen - 1 && duration === '00:00:00')

          // Add the time record
          timePut(
            {
              'event': event.id,
              'task': task.id,
              'duration': timeRecordDuration,
              'order': order},
            true,
            lastIteration ? onSuccess : () => true)
          order++

          // Set 'no-touch' flag to false
          noTouch = false
        }
      }
      iterSummary += '\r\n - Event time available: ' + available +
      '\r\n - Task duration left: ' + duration

      // If not time record was updated / created
      if (noTouch){
        // remove this task time records within this event that still exist
        timeRecordsByEvent(event.id)
          .filter(t => Number(t.task) === Number(task.id))
            .map(t => timeDelete(t.id))

        // set 'no-touch' flag back to true for the next iteration
        noTouch = true
      }

      // TASK SWITCH

      // If all the time of the task is scheduled completely
      if (duration === '00:00:00'){
        // Switch to the next task
        tInd++

        // If next task exists
        if (tInd < tLen)
          // Pull 'schedule' time from it for the next iteration
          duration = tasks[tInd].duration

      // EVENT SWITCH

      // If not all the time of the task is scheduled yet
      } else {
        // Straight time records order up for current event
        this.fixTimeRecordsOrder(eInd)
        // Increment event index and re-initiate time records 'order'
        eInd++
        order = 0

        // Clear this even from task time records that we didn't touch yet
        for (let t = tInd; t < tLen; t++){
          // To each time record
          Object.keys(allTimeRecords).map(trId => {
            // which task is an untouched task
            if (allTimeRecords[trId].task == tasks[t])
              // and which event is current event
              if (allTimeRecords[trId].event == event.id)
                // no mercy
                this.timeDelete(trId)
        })}

        // If next event exists
        if (eInd < eLen){
          // Pull 'available' time from it for the next iteration
          available = this.eventTimeAvailable(events[eInd].id, true)
        }
      }
      // console.log(iterSummary)
    }
  }

  overSheduled(eventId){

    // If no ID passed, or no Such event, or event has no tasks return 0
    if (eventId === undefined) return 0;
    if (Object.keys(getEvent(eventId)).length === 0) return 0;
    if (this.tasksByEventId(eventId).length === 0) return 0;


    // Get the busy time in minutes

    // Get the list event's tasks
    const minutesBusy = this.tasksByEventId(eventId)
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
              this.taskUpdate(
                {id: taskId, order: index},
                true);
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

  taskUpdate(task, immediately = false, onTUSuccess, onTUFail){

    // TODO: Fix, that task.event_id works just to pass event_id during update.

    // INITIALIZATION

    // Default parameters values
    onTUSuccess = onTUSuccess || (data => true)
    onTUFail = onTUFail || (data => true)
    let allE = this.state.allEvents
    let eventRedistrId = ('event_id' in task) ? task['event_id'] : undefined


    // Analyze the nature of the update and how are we going to do it

    console.log('taskUpdate() task:', task)
    let taskOld = this.state.allTasks[task.id]
    console.log('taskUpdate() taskOld:', taskOld)
    let keys = Object.keys(task)
    console.log('taskUpdate() keys:', keys)
    let diff = [].concat(...keys.map(k => task[k] !== taskOld[k] ? [k]:[]))
    console.log('taskUpdate() diff:', diff)

    let eventIdOldByTask = undefined, eventOldByTask
    eventOldByTask = this.eventByTaskID(task.id)
    if (eventOldByTask)
      eventIdOldByTask = eventOldByTask.id

    // If there is no difference between new and old task at all
    if (diff.length === 0)
      // We're done
      onTUSuccess(taskOld)

    // If event is changed
    if ('event_id' in diff || Number(eventIdOldByTask) !== Number(task.id) ){
      // Remove all current time records
      this.timeRecordsByTask(task.id).forEach(ti => this.timeDelete(ti.id))
    }

    // Pick The event ID to start redistribute with

    // If no event id provided expicitly
    if(!eventRedistrId && eventIdOldByTask)
      eventRedistrId = eventIdOldByTask

    if(eventRedistrId && eventIdOldByTask){
      let cmpr = eventStartCompare(eventRedistrId, eventIdOldByTask, allE)
      eventRedistrId = (cmpr < 0) ? eventRedistrId : eventIdOldByTask
    }

    // Call-backs

    // Save current state & generate rollback function
    const rollback = this.stateArchive.save('allTasks')

    // TODO: Test how would it work for the task update with empty event_id

    const onSuccess  = task => {

      let onSuccessToBeCalled = true

      // If event is provided
      if(eventRedistrId) {

        // And we have a data for it
        if(eventRedistrId in this.state.allEvents){
          // Pull the activity ID
          const activity_id = this.state.allEvents[eventRedistrId].activity_id

          // Call redistribute for a new event and invoke parent call-back from it
          this.activityRedistribute(
            activity_id,
            eventRedistrId,
              data => onTUSuccess({
                task: this.state.allTasks[task.id],
                timeRecords: this.timeRecordsByTask(task.id)
          }))
          onSuccessToBeCalled = false

        // If there is no event for an event_id
        } else {
          // App data integrity is violated
          let msg = "taskUpdate(...) No event found for event id "
            + eventRedistrId + ' from ' + JSON.stringify(task)
          console.log(msg)
        }

        // console.log('taskUpdate() event_id:', task.event_id)
        // console.log('taskUpdate() event:', this.state.allEvents[task.event_id])
        // console.log('taskUpdate() activity_id:', this.state.allEvents[task.event_id].activity_id)
      }

      // If no event is provided
      if (onSuccessToBeCalled) {
        // Just invoke a parent call call-back
        onTUSuccess({
          task: this.state.allTasks[task.id],
          timeRecords: []
        })
      }
    }

    const onFail  = data => {
      rollback()
      onTUFail(data)
    }

    // UPDATE

    // Update state
    this.api.tasks.pushToState(task)

    // call API and update DB
    if(immediately){
      this.secretary.call(
        'task', task.id,
        ()=>this.api.tasks.update(task, onSuccess, onFail))
    }
    else{
      this.secretary.schedule(
        'task', task.id,
        ()=>this.api.tasks.update(task, onSuccess, onFail))
    }

  }

  taskCreate(task, onCreateSuccess){

    // INITIALIZATION

    task = task || undefined
    if (task === undefined)
      throw new Error("app.taskCreate() # 'task' parameter is undefined")
    onCreateSuccess = onCreateSuccess || (data => true)
    const {allEvents} = this.state

    // Save current state
    const rollback =
      this.stateArchive.save(
        ['allTasks', 'allTimeRecords'])

    // CREATION

    // Functions to be called on task API call Success:
    const addTaskOnSuccess = (task) => {
      const { allTimeRecords } = this.state
      let order

      // If we have event id - we can create a time record
      if ('event_id' in task){

        // Functions to be called on Time Record API call Success:
        const addTimeOnSuccess = (time) => {
          this.api.tasks.pushToState(task)
          this.api.timeRecords.pushToState(time)

          // Redistribute

          // Get the activity that this task belong to
          const activity_id = allEvents[time.event].activity_id
          // Get the event that the time records is assigned initially
          const event_id = time.event
          // Launch redistribute for this activity starting from this event
          this.activityRedistribute(
            activity_id,
            event_id,
            () => onCreateSuccess({
              'task': this.state.allTasks[task.id],
              'time': this.state.allTimeRecords[time.id]
        }))}

        // Create time record

        // If order value is passed
        if('order' in task)
          // Pass it to time record
          order = task.order
        // If no order value is passed
        else
          // Init it with really big to add the task to the end
          order = 9999999

        // Create
        this.api.timeRecords.create({
          'event': task.event_id,
          'task': task.id,
          'duration': task.duration,
          'order': order
        }, addTimeOnSuccess, rollback)

      // Without event id & order just create the task
      } else {
        this.api.tasks.pushToState(task)
          onCreateSuccess({'task': task})
      }

    }

    // API Call
    this.api.tasks.create(task, addTaskOnSuccess, rollback)
  }

  taskDelete(id) {
    console.log('taskDelete(', id, ')')

    // Time records shortcut
    const tiR = this.state.allTimeRecords

    // Save current state for tasks and time records
    const rollbackTask = this.stateArchive.save({'allTasks': id})
    const rollbackTime = this.stateArchive.save('allTimeRecords')
    const rollback = () => {
      rollbackTask()
      rollbackTime()
    }

    // Remove the task from the state
    this.api.tasks.removeID(id)
    // Remove all related time records from the state
    Object.keys(tiR).map(ti_id => {
      if (tiR[ti_id].task == id)
        this.api.timeRecords.removeID(ti_id)
    })

    // Task delete API call
    const deleteAPIcall = () => this.api.tasks.delete({
      'param': id,
      'onFail': rollback
    })

    // API Call
    this.secretary.schedule('task', id, deleteAPIcall)
  }


  fixTimeRecordsOrder(eventId){
  /*
    This function updates order fields of all the time records if no particular
    event ID provided. For instance for five time records are sorted
     by their order values, their order values will be updated as follows:
    {0.9, 1.5, 9, 10, 14} =>  {0, 1, 2, 3, 4}
  */
    eventId = eventId || undefined

    // If event ID is provided
    if(eventId){
      // Get all it's time records
      this.timeRecordsByEvent(eventId).map((ti, i) => {
          // set their orders to cycle index values
          this.timePut({id: ti.id, order: i}, true)
        }
      )

    // If no Event ID is provided
    } else {
      // Go through each event
      Object.keys(this.state.allEvents).map(fixTimeRecordsOrder)
    }

  }

  timePut(time, immediately, onSuccess){

    immediately = immediately || false
    onSuccess = onSuccess || (() => true)

    // console.log('timePut(): ', time)

    // Save current state
    const rollback = this.stateArchive.save('allTimeRecords')

    // this.api.timeRecords.pushToState(time)

    // API Call implementation

    if(immediately){
      this.secretary.call(
        'time', time.id,
        ()=>this.api.timeRecords.put(time, onSuccess, rollback))
    }
    else{
      this.secretary.schedule(
        'time', time.id,
        ()=>this.api.timeRecords.put(time, onSuccess, rollback))
    }


  }

  timeDelete(id) {
    // Save current state
    const rollback = this.stateArchive.save({'allTimeRecords': id})

    // Function to be called on API call Success:
    this.api.timeRecords.removeID(id)

    // API Call
    this.secretary.schedule(
      'timeRecord', id,
      ()=>this.api.timeRecords.delete({'param': id, 'onFail': rollback}))
  }

  /**
   * @param {Number} eventId
   *
   * @returns {taskIDsList} List task IDs, sorted by 'order'
   */

  tasksByEventId(eventId) {
    // Unpack values
    const {allTasks ,allEvents, allTimeRecords} = this.state

    // If now event with Such id
    if (!(eventId in allEvents))
      throw new Error("app.tasksByEvent(...) eventId is missing")

    // Get task IDs using task => (E)VENT relations (unsorted)

    // Get the list all the tasks
    let taskIDsFromE = Object.keys(allTasks).map(tId => allTasks[tId])
      // Filter only those linked to current event
      .filter(t => Number(t.event_id) === Number(eventId))
        // Pull out IDs only
        .map(t => Number(t.id))

    // Get task IDs by task => (T)IME <= event relations (sorted by time.order)

    // Get all the time records
    let taskIDsFromT = Object.keys(allTimeRecords).map(id => allTimeRecords[id])
      // Filter those which belong to this event
      .filter(ti => (Number(ti.event) === Number(eventId)))
        // Pull: taskId list, ordered by order value
        .sort(compareByOrder).map(ti => Number(ti.task))

    // Get unique elements only
    let taskIDs = [...new Set([...taskIDsFromT, ...taskIDsFromE])]

    // console.log('tasksByEventId() taskIDs:', taskIDs)
    // if (eventId === 126){
    //   console.log(
    //     'tasksByEventId()',
    //     '\r\ntaskIDsFromE:', JSON.stringify(taskIDsFromE),
    //     '\r\ntaskIDsFromT:', JSON.stringify(taskIDsFromT),
    //     '\r\nall  taskIDs:', JSON.stringify(taskIDs),
    // )}


    return taskIDs
  }

  // tasksByEvent(eventId) {
  //   // Unpack values
  //   const {allEvents, allTimeRecords} = this.state
  //
  //   // If now event with Such id
  //   if (!(eventId in allEvents))
  //     throw new Error("app.tasksByEvent(...) eventId is missing")
  //
  //   // Get all the time records
  //   let taskIDs = Object.keys(allTimeRecords).map(id => allTimeRecords[id])
  //     // Filter those which belong to this event
  //     .filter(ti => (Number(ti.event) === Number(eventId)))
  //       // Pull: taskId list, ordered by order value
  //       .sort(compareByOrder).map(t => t.task)
  //
  //   // Get unique elements only
  //   taskIDs = [...new Set(taskIDs)]
  //
  //   return taskIDs
  // }

  /**
   * @param {Number} eventId
   *
   * @returns {timeRecordsList} List of event time records, sorted by 'order'
   */

  timeRecordsByEvent(eventId){

    // Make copy of all Time Records for manipulations
    const timeRecords = JSON.parse(JSON.stringify(this.state.allTimeRecords))
    // Empty list to be filled in
    const eventTimeRecords = []

    // Filter only Time Records belonging to "this" event
    Object.keys(timeRecords).map(id => {
      // If Time Record belong to the event
      if (timeRecords[id].event == eventId){
        // Add it to the list
        eventTimeRecords.push(timeRecords[id])
      }
    })

    // Sort the list by "order" field
    eventTimeRecords.sort(compareByOrder)

    return eventTimeRecords
  }

  /**
   * @param {Number} eventId
   * @returns {timeRecordsList} Time records for a task ID sorted by respective
   *                            earliest events for each time records
   */

  timeRecordsByTask(taskId){

    // Make copy of all Time Records for manipulations
    const {allTimeRecords} = this.state
    // Empty list to be filled in
    const timeRecords = []

    // Filter only Time Records belonging to "this" event
    Object.keys(allTimeRecords).map(id => {
      // If Time Record belong to the event
      if (allTimeRecords[id].task == taskId){
        // Add it to the list
        timeRecords.push(allTimeRecords[id])
      }
    })

    // Now sort and return
    return timeRecords.sort((t1, t2) =>
      timeRecordByEventCompare(t1, t2, this.state.allEvents))
  }

  /**
   * @param {Number} taskId
   * @returns {event} The whole event pulled via task => timeRecord => Event
   */
  eventByTaskID(taskId){

    const timeRecords = this.timeRecordsByTask(taskId)
    if (timeRecords.length > 0){
      return this.state.allEvents[this.timeRecordsByTask(taskId)[0].event]
    }
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
      draggableId: timeRecordId

    } = result;

    const taskId = this.state.allTimeRecords[timeRecordId].task
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
      pinned: true,
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

  componentDidMount() {
    this.api.refreshAll() // this.fixTasksOrder

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

    // UNPACK VALUES
    const events = JSON.parse(JSON.stringify(this.state.allEvents))

    // If the app date isn't loaded yet - do nothing
    if (Object.keys(events).length === 0) return (
        <div className="container-fluid d-flex flex-column vh-100 overflow-hidden">
          <div className="row flex-grow-1 overflow-hidden"></div>
        </div>
    );

    // Pulling events data from the state
    const getTask = this.getTask
    const getEvent = this.getEvent
    window.getTask = this.getTask
    window.getEvent = this.getEvent
    window.allTasks = this.state.allTasks
    window.allTimeRecords = this.state.allTimeRecords
    window.fixTasksOrder = this.fixTasksOrder
    window.taskLastCreatedId = this.state.taskLastCreatedId
    window.overSheduled = this.overSheduled
    window.setState = this.setState
    window.app = this
    window.timeRecordsByEvent = this.timeRecordsByEvent
    window.timeDelete = this.timeDelete
    window.timePut = this.timePut
    window.eventTimeAvailable = this.eventTimeAvailable
    window.softTime = softTime
    window.fixTimeRecordsOrder = this.fixTimeRecordsOrder

    // INTERNAL FUNCTIONS

    // Time difference between two events (in days)
    const eventDayDiff = (id1, id2) => {
      // If requested events are exist
      if (id1 in events && id2 in events) {

        // Pull the respective start dates
        const id1Start = moment(events[id1].start)
        const id2Start = moment(events[id2].start)

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

    // Compare two events by their dates, given events IDs and events dict
    const eventsCompare = (e1, e2) => eventStartCompare(e1, e2, events)

    // RENDER VALUES COMPUTATION

    // List of events IDs sorted by their respective start dates
    let eventsIDs = Object.keys(events).sort(eventsCompare)
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
    const firstEventStart = events[eventsIDs[0]].start;

    window.eventsIDs = eventsIDs;
    window.appRefs = this.appRefs;
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
                        timePut={this.timePut}
                        timeRecords={this.timeRecordsByEvent(id)}
                        tasksByEventId={this.tasksByEventId(id)}
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
export { softTime };
