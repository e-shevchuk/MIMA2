import {
  dictValidateID, dictValidateString, dictValidateDuration,
  dictValidateBoolean, dateStrUTCtoUnix, wrongID, wrongSinceNonStr,
  wrongSinceEmptyStr, dictValidateKeys, sortPrevNextListForEvent
} from "./service_functions";
import Activity from "./Activity";
import Event from "./Event";
import Task from "./Task";
import TimeRec from "./TimeRec";
import JSONPretty from "react-json-pretty";
import {
  allActivities,
  allEvents,
  allTasks
} from "./Schedule/Schedule.test.data";

export class ScheduleElementsSet {
  constructor() {
    this.objs = {}
    this.idGlossary = {'idApp': {}, 'idDB': {}}
    // this.dataDB = {}

    // Binding
    this.add = this.add.bind(this)
    this.getByidDB = this.getByidDB.bind(this)
    this.getByidApp = this.getByidApp.bind(this)
    this.onCreateSuccess = this.onCreateSuccess.bind(this)
    this.onUpdateSuccess = this.onUpdateSuccess.bind(this)
    this.onDeleteSuccess = this.onDeleteSuccess.bind(this)
    this.diffElReduce = this.diffElReduce.bind(this)
    this.diff = this.diff.bind(this)
  }


  /**
   * @param {Number} eventId
   *
   * @returns {taskIDsList} List task IDs, sorted by 'order'
  **/
  add(obj) {
    const msg = 'ScheduleElementsSet.add(): '
    let objId, objIdDB, objIdApp

    // ADDING OBJECT

    // Validations

    dictValidateID(obj, 'id', msg)
    dictValidateID(obj, 'idDB', msg)
    dictValidateID(obj, 'idApp', msg)

    // Adding 'object' & id reference to the 'element'

    objId = Number(obj['id'])
    objIdDB = Number(obj['idDB'])
    objIdApp = Number(obj['idApp'])

    this.objs[objId] = obj
    this.idGlossary.idApp[objIdApp] = objId
    this.idGlossary.idDB[objIdDB] = objId

    // Adding link to DB data list with this obj data
    // this.dataDB[objIdDB] = obj.dataDB
  }

  get(id, idType) {
    let idModel
    const msg = 'ScheduleElementsSet.get(): '

    // Initializaton
    id = id || undefined
    if(idType !== '')
      idType = idType || undefined

    // Validations
    if (id === undefined)
      throw new Error(msg + "'id' is not provided")
    if (wrongID(id))
      throw new Error(msg + "'id' is not correct")

    // If idType is provided - this is external ID
    if (idType || idType === ''){

      // Validations if this is an external ID
      if (wrongSinceNonStr(idType))
        throw new Error(msg + "'idType' is not provided")
      if (wrongSinceEmptyStr(idType))
        throw new Error(msg + "'idType' value is not provided")
      if (idType !== 'idDB' && idType !== 'idApp')
        throw new Error(msg + "wrong 'idType' value")
      if(!(id in this.idGlossary[idType]))
        throw new Error(msg + "no id for "+ idType +"="+ id +" found")

      // Pull the 'internal' from the Glossary
      idModel = this.idGlossary[idType][id]

    // If this is model ID already
    } else {
      idModel = id
    }

    // Validation for Object existence
    if(!(idModel in this.objs))
        throw new Error(msg + "no object for id=" + id + " found")

    // Pull & return the object
    return this.objs[idModel]
  }

  getByidDB(id) {
    return this.get(id, 'idDB')
  }

  getByidApp(id) {
    return this.get(id, 'idApp')
  }

  /**
   *  Help to form internal diff() update / delete / create dictionary.
   *  Each element format:
   *  {
   *    id: {
   *    getDataDB - functions the return current value of element dataDB,
   *    onSuccess - function to be called on API call Success,
   *    }
   *  }
   *
   *  @param {ScheduleElementsSet} elSet
   *  @param {function} onSuccess
   *
   *  @returns {{}} all {... allPrev, current}
  **/

  diffElReduce(elSet, onSuccess){
    const msg = 'ScheduleElementsSet.diffElReduce(): '

    return (prev, id) => {
      prev[id] = {
        'getDataDB': () => (id in elSet.objs) ? elSet.get(id).dataDB:undefined,
        'onSuccess': (dataNew) => onSuccess(id, elSet.get(id).dataDB, dataNew)
      }
      return prev
    }
  }

  /**
   *  @param {ScheduleElementsSet} changed
   *
   *  @returns {{}} dict with 'added', 'removed', 'updated' lists
  **/

  diff(changed) {

    const old = this.dataDB
    const upd = changed.dataDB

    const updCopy4Created = {...upd}
    const oldCopy4Deleted = {...old}
    const updCopy4Updated = {...upd}

    // CREATED

    // upd - old
    Object.keys(old).forEach(id => delete updCopy4Created[id])
    // Form id => 'dataDB() call' dictionary
    const created = Object.keys(updCopy4Created)
      .reduce(this.diffElReduce(changed, changed.onCreateSuccess), {})

    // DELETED

    // old - upd
    Object.keys(upd).forEach(id => delete oldCopy4Deleted[id])
    // Form id => 'dataDB() call' dictionary
    const deleted = Object.keys(oldCopy4Deleted)
      .reduce(this.diffElReduce(changed, changed.onDeleteSuccess), {})

    // UPDATED

    // upd - (created U deleted)
    Object.keys({...updCopy4Created, ...oldCopy4Deleted}).forEach(id =>
      delete updCopy4Updated[id])

    // "upd - (created U deleted)" from the first step - all unchanged
    Object.keys(updCopy4Updated).forEach(id => {
      if(JSON.stringify(updCopy4Updated[id]) === JSON.stringify(old[id]))
        delete updCopy4Updated[id]})

    // Form id => 'dataDB() call' dictionary
    const updated = Object.keys({...updCopy4Updated, ...updCopy4Created})
      .reduce(this.diffElReduce(changed, changed.onUpdateSuccess), {})

    return {
      'create': created,
      'update': updated,
      'delete': deleted,
    }
  }

  // SETTERS & GETTERS

  /**
   *  dataDB Getter
   *  @returns {{}} whole set of elements in dataDB format
  **/

  get dataDB() {
    const dataDBall = {}

    // Each object in the list
    Object.keys(this.objs).forEach(
      // Add dataDB data to the resulting dictionary
      id => dataDBall[id] = {...this.objs[id].dataDB}
    )

    // Return resulting dictionary
    return dataDBall
  }

  /**
   *  Apply back-end response data:
   *  - update dataDB with new idDB
   *  - replace idDB in idGlossary
   *
   *  @param {id} id - Schedule element id
   *  @param {{}} dataOld - befire API call dataDB
   *  @param {{}} dataNew - API fetch response data in dataDB format
  **/

  onCreateSuccess(id, dataOld, dataNew){
    const msg = "ScheduleElementsSet.onCreateSuccess(): "

    // Validate ID
    dictValidateID(dataNew, 'id', msg)

    // Remove old idDB from idGlossary
    delete this.idGlossary['idDB'][dataOld.id]
    // Add new idDB to Glossary
    this.idGlossary['idDB'][dataNew.id] = id

    // Update database id
    this.objs[id].idDB = dataNew.id
  }

  onUpdateSuccess(id, dataOld, dataNew) {
    return true
  }

  onDeleteSuccess(id, dataOld, dataNew) {
    return true
  }

}


export default class Schedule {
  constructor(){

    this.activities = new ScheduleElementsSet()
    this.events = new ScheduleElementsSet()
    this.tasks = new ScheduleElementsSet()
    this.timeRecs = new ScheduleElementsSet()

    this.eventFirst = undefined

    // Element types
    this.elSets = {
      'task': this.tasks,
      'timeRec': this.timeRecs,
      'event': this.events,
      'activity': this.activities,
    }

    // Indicate if holistic (all time records and references are up to date)
    this.isHolistic = false
    // Indicate if Schedule was initialized
    this.isInited = false

    // Binding
    this.buildAllRefs = this.buildAllRefs.bind(this)
    this.addActivity = this.addActivity.bind(this)
    this.addEvent = this.addEvent.bind(this)
    this.addTask = this.addTask.bind(this)
    this.addTimeRec = this.addTimeRec.bind(this)
    this.buildRefsTime = this.buildRefsTime.bind(this)
    this.buildRefsEvent = this.buildRefsEvent.bind(this)
    this.initByDBdata = this.initByDBdata.bind(this)
    this.copy = this.copy.bind(this)
    this.fit = this.fit.bind(this)
    this.timeInsert = this.timeInsert.bind(this)
    this.taskInsert = this.taskInsert.bind(this)
    this.createTask = this.createTask.bind(this)

  }

  // Setter / Getter isHolistic
  set isHolistic(isHolistic)          {this._isHolistic = isHolistic}
  get isHolistic()                    {return this._isHolistic}


  _addElement(el, type){
    this.elSets[type].add(el)
  }

  addActivity(a){
    this._addElement(a, 'activity')
  }

  addEvent(e){
    this._addElement(e, 'event')

  }

  addTask(t){
    this._addElement(t, 'task')
  }

  addTimeRec(t){
    this._addElement(t, 'timeRec')
  }

  initByDBdata(data){
    const msg = "Schedule.initByDBdata(): "

    // Unpack values
    const { activities, events, timeRecs, tasks } = data

    // VALIDATIONS

    // If it was initialized already
    if(this.isInited)
      // Don't allow to do that for the second time
      throw new Error(msg + 'the Schedule was initialized already')

    // Validations - should have all the necessary data
    const keysToHave = ["activities", "timeRecs", "events", "tasks"]
    dictValidateKeys(data, keysToHave, msg)

    // INITIALIZE "CURRENT" SCHEDULE

    // Activities
    Object.keys(activities).map(id =>
      this.addActivity(
        Activity.fromDB(activities[id])))
    // Events
    Object.keys(events).map(id =>
      this.addEvent(
        Event.fromDB(events[id])))
    // Tasks
    Object.keys(tasks).map(id =>
      this.addTask(
        Task.fromDB(tasks[id])))
    // Time Records
    Object.keys(timeRecs).map(id =>
      this.addTimeRec(
        TimeRec.fromDB(timeRecs[id])))

    this.buildAllRefs()

    this.isInited = true
  }


  buildRefsTime(time){
    const msg = 'Schedule.buildRefsTime(): '

    // INITIALIZATION
    let prevIdDB, nextIdDB, taskIdDB, eventIdDB, actyIdDB, task, prev, next,
        event, activity, taskPrevDBID, taskPrev, taskNextDBID, taskNext

    // TIME - BUILD REFS

    // Pulling DB IDs
    prevIdDB = time.dataDB.prev || undefined
    nextIdDB = time.dataDB.next || undefined
    taskIdDB = time.dataDB.task || undefined
    eventIdDB = time.dataDB.event || undefined

    // Prev
    if(prevIdDB){
      prev = this.timeRecs.getByidDB(prevIdDB)
      time.prev = prev
    }

    // Next
    if(nextIdDB){
      next = this.timeRecs.getByidDB(nextIdDB)
      time.next = next
    }

    // Task
    task = this.tasks.getByidDB(taskIdDB)
    time.task = task

    // Event
    event = this.events.getByidDB(eventIdDB)
    time.event = event

    // Activity
    actyIdDB = time.event.dataDB.activity
    activity = this.activities.getByidDB(actyIdDB)
    time.activity = activity

    // TASK - BUILD REFS

    // Activity
    task.activity = time.activity
    // Events
    task.refEventsAdd(time.event)
    // Time records
    task.refTimeAdd(time)

    // Task previous
    if(prev){
      // From previous dataDB value - get DB taskID
      taskPrevDBID = prev.dataDB.task
      // Get task object by DB taskID
      taskPrev = this.tasks.getByidDB(taskPrevDBID)
      // If task object is different from the current one
      if (taskPrev !== task)
        // Assign next task ref to be this task Object
        task.prev = taskPrev
    }

    // Task next
    if(next){

      // From previous dataDB value - get DB taskID
      taskNextDBID = next.dataDB.task
      // Get task object by DB taskID
      taskNext = this.tasks.getByidDB(taskNextDBID)
      // If task object is difference from the current one
      if (taskNext !== task)
        // Assign next task ref to be this task Object
        task.next = taskNext
    }

    // EVENT - BUILD REFS

    // Activity
    event.activity = activity

    // Tasks (pinned / non-pinned)

    if(task.pinned)
      event.refTasksPinnedAdd(task)
    else
      event.refTasksAdd(task)

    // Time records (pinned / non-pinned)

    if(task.pinned){
      event.refTimePinnedAdd(time)

    }
    else{
      event.refTimeAdd(time)
    }

    // Event previous
    if(prev)
      if(event !== prev.event)
        event.prev = prev.event

    // Event next
    if(next)
      if(event !== next.event)
        event.next = next.event

    task.refsBuilt = true
    time.refsBuilt = true
  }

  buildRefsEvent(event){
    const msg = 'Schedule.buildRefsEvent(): '

    // INITIALIZATION
    let prevIdDB, nextIdDB, actyIdDB, activity

    // Pulling DB IDs
    prevIdDB = event.dataDB.prev || undefined
    nextIdDB = event.dataDB.next || undefined
    actyIdDB = event.dataDB.activity || undefined

    // Previous and next events
    event.prev = prevIdDB ? this.events.getByidDB(prevIdDB) : undefined
    event.next = nextIdDB ? this.events.getByidDB(nextIdDB) : undefined

    // ACTIVITY - BUILD REFS

    // Activity
    activity = this.activities.getByidDB(actyIdDB)
    event.activity = activity

    // Activity Events reference
    activity.refEventsAdd(event)

    event.refsBuilt = true
  }

  buildAllRefs(){

    // Build Tasks-related references

    // Get all the IDs unsorted
    Object.keys(this.timeRecs.objs)
      // Form tasks list
      .map(id => this.timeRecs.get(id))
        // Build references for each task
        .forEach(t => this.buildRefsTime(t))

    // Build Events-related references

    // Get all the IDs unsorted
    const events = Object.keys(this.events.objs)
      // Form events list
      .map(id => this.events.get(id))
        // Sort events in the list
        .sort((e1, e2) => e1.start > e2.start ? 1 : -1)

    // Build references for each event
    events.forEach(e => this.buildRefsEvent(e))

    // Save the first event in the list
    this.eventFirst = events[0]

    this.isHolistic = true
  }

  get appState(){
    let msg = 'Schedule.getAppState(): '
    let objTimeRecsPinned, objTimeRecs, eventApp, appTimeRecsPinned, appTimeRecs

    // If the Schedule was updated or just created and fitted - that's wrong
    if(!this.isHolistic)
      throw new Error(msg + 'Unholistic Schedule appState request attempt')

    let event = this.eventFirst
    const events = []

    do {

      // EVENT TIME RECORDS LIST

      // Pinned tasks time records
      objTimeRecsPinned = event.refTimePinned
      appTimeRecsPinned = objTimeRecsPinned.map(time => ({
          "id": time.idApp,
          "duration": time.duration,
          "title": this.tasks.get(time.task.id).title,
          "pinned": this.tasks.get(time.task.id).pinned,
          "timeComplete": time.complete,
          "taskComplete": this.tasks.get(time.task.id).complete,
      }))

      // Non-pinned tasks time records

      objTimeRecs = event.refTime
      appTimeRecs = objTimeRecs.map(time => ({
          "id": time.idApp,
          "duration": time.duration,
          "title": this.tasks.get(time.task.id).title,
          "pinned": this.tasks.get(time.task.id).pinned,
          "timeComplete": time.complete,
          "taskComplete": this.tasks.get(time.task.id).complete,
      }))

      // EVENT ITSELF

      // Generate app event data
      eventApp = {
        "id": event.idApp,
        "activityId": event.activity.id,
        "title": event.title,
        "feasibility": 1,
        "start": event.start,
        "duration": event.duration,
      }

      // Add time recs to the event
      eventApp['time'] = [...appTimeRecsPinned, ...appTimeRecs]
      // Add event to the list
      events.push(eventApp)

      // Switch to the next event
      event = event.next
    } while(event)

    const stateUpdParams = {'events': events}

    return stateUpdParams
  }

  /**
   *  @returns {Schedule} a new copy of current instance
  **/
  copy() {

    // If the schedule is uninitialized
    if(!this.isHolistic)
      // Probably something is wrong with it's data, so don't copy
      throw new Error(msg + 'Unholistic Schedule appState request attempt')

    // Create an empty new schedule instance
    const scheduleNew = new Schedule()

    // Initialize new instance with current instance data
    scheduleNew.initByDBdata({
      "activities": this.activities.dataDB,
      "events": this.events.dataDB,
      "timeRecs": this.timeRecs.dataDB,
      "tasks": this.tasks.dataDB
    })

    // Return the new instance
    return scheduleNew
  }

  /**
   *  Service function for timeInsert() Get links to the previous | next (PN)
   *  time records instances for the new time record being added to model
   *
   *  @param {bool} pinned - is new time record for the pinned task
   *  @param {Event} event instance
   *  @param {Time} time - record relatively to which the new to be placed
   *  @param {bool} after - specify if create a new time record before | after
   *                       the provided time record
   *
   *  @returns {{}} a new copy of current instance
  **/

  getTimeInsertPN(pinned, event, time, after) {
    const msg = "Schedule.getTimeInsertPN(): "

    // INITIALIZATION

    let errMsg

    // Event time records list
    const timeRecs = pinned ? event.refTimePinned : event.refTime

    // VALIDATIONS

    // Only pinned task time records can be added without position
    if (!pinned && time === undefined)
        // Otherwise - we throw error
        throw new Error(msg + "Unpinned time record without position")

    // If time record is specified
    if(time)
      // Event should have it already
      if(!(new Set(timeRecs.map(t => t.id)).has(time.id)))
        // Otherwise - we throw error
        throw new Error(msg + "The event " + String(event.id) + " "
                            + "have no time record " + time.id)

    // POSITION IS PROVIDED

    if(time){
      return {
        "prev": after ? time : time.prev,
        "next": after ? time.next : time
    }}

    // NO POSITION PROVIDED

    // If no time records exists
    if(timeRecs.length === 0){
      // There will be no prev / next records
      return {
        "prev": undefined,
        "next": undefined
    }}

    // If one or more time record exists - set prev to be the last one
    return {
      "prev": timeRecs.slice(-1)[0],
      "next": undefined}
  }

  /**
   *  Create and insert a new task to the Schedule
  **/
  taskInsert(title, pinned) {
    const msg = "Schedule.taskInsert(): "

    // INITIALIZATION

    let newTaskDBdata, newTaskIdApp, event, task
    newTaskIdApp = Date.now()

    // TASK CREATION

    // Create Similar to DB data object
    // to use TimeRec.fromDB(...) constructor
    newTaskDBdata = {
      "id": newTaskIdApp,
      "title": title,
      "pinned": pinned,
      "duration": "00:05:00",
      "complete": false,
    }
    // Create new time record instance
    task = Task.fromDB(newTaskDBdata)
    // Add task instance to the Schedule task elements list
    this.addTask(task)

    return task
  }

  /**
   *  Create and insert a new time record to the Schedule
  **/
  timeInsert(taskIdApp, eventIdApp, timeIdApp, after, duration){
    const msg = "Schedule.timeInsert(): "

    // INITIALIZATION

    let timeNew, timeNewDBdata, timeRecs, time
    const task = this.tasks.getByidApp(taskIdApp)
    const event = this.events.getByidApp(eventIdApp)
    const timeNewIdApp = Date.now()

    // If we are provided with the place in the time sequence
    if(timeIdApp){
      // Pull the time object
      time = this.timeRecs.getByidApp(timeIdApp)

    // If place in the time sequence isn't provided
    } else {
      // Pull the last time object for this event
      timeRecs = task.pinned ? event.refTimePinned : event.refTime
      // Pull the last time record from the list
      time = timeRecs.slice(-1)[0]
    }

    // Compute the previous and next time records for the new one
    const {prev, next} = this.getTimeInsertPN(task.pinned, event, time, after)

    // TIME RECORD CREATION

    // Create Similar to DB data object to use TimeRec.fromDB(...) constructor
    timeNewDBdata = {
      "id": timeNewIdApp,
      "task": task.idDB,
      "event": event.idDB,
      "prev": prev ? prev.idDB : null,
      "next": next ? next.idDB : null,
      "duration": duration,
      "complete": task.complete,
    }
    // Create new time record instance
    timeNew = TimeRec.fromDB(timeNewDBdata)
    // Add time record instance to the Schedule time records elements list
    this.addTimeRec(timeNew)

    // TIME RECORD INSTANCE CROSS-REFERENCES

    // If there is an anchor time record
    if(time) {
      // Update prev / next cross-references
      if(!after) {
        if(time.prev) time.prev.next = timeNew
        time.prev = timeNew
      } else {
        if(time.next) time.next.prev = timeNew
        time.next = timeNew
      }
    }

    this.buildRefsTime(timeNew)
    if(timeNew.next) this.buildRefsTime(timeNew.next)
    if(timeNew.prev) this.buildRefsTime(timeNew.prev)
    this.buildRefsEvent(timeNew.event)

    // FRONT-END UPDATE DATA

    return {
      "time": timeNewIdApp,
      "task": task.idDB,
      "event": event.idDB,
      "duration": timeNew.duration,
      "title": task.title,
      "pinned": task.pinned,
      "timeComplete": task.complete,
      "taskComplete": task.complete,
      "prev": prev ? prev.idApp : null,
      "next": next ? next.idApp : null,
    }
  }

  /**
   *  Create task in schedule, by:
   *  - creating task, inserting it into the Schedule
   *  - creating time record that link that task to the designated event
  **/
  createTask(title, pinned, eventAppID, duration, timeAppID, after){
    const msg = "Schedule.createTask(): "

    // VALIDATIONS

    if(title === undefined) throw new Error(msg + "Title is missing")
    if(pinned === undefined) throw new Error(msg + "'pinned' is missing")
    if(eventAppID === undefined) throw new Error(msg + "event appID is missing")

    // INITIALIZATION

    // Default duration
    duration = duration || "00:10:00"
    // Default position relative to anchor time record is "after"
    after = (after === undefined) ? true : after

    // If anchor time record isn't provided - get it
    if(timeAppID === undefined) {
      const event = this.events.getByidApp(eventAppID)
      const eventTimeRecs = pinned ? event.refTimePinned : event.refTime
      const time = eventTimeRecs.slice(-1)[0]
      timeAppID = time ? time.idApp : undefined
    }

    // Create a task withing the Schedule
    const task = this.taskInsert(title, pinned)

    // Create the time record for the created task and provided event
    return this.timeInsert(task.idApp, eventAppID, timeAppID, after, duration)
  }

  fit(){
    return true
  }

}