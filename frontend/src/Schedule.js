import {
  dictValidateID, dictValidateString, dictValidateDuration,
  dictValidateBoolean, dateStrUTCtoUnix, wrongID, wrongSinceNonStr,
  wrongSinceEmptyStr, dictValidateKeys
} from "./service_functions";
import Activity from "./Activity";
import Event from "./Event";
import Task from "./Task";
import TimeRec from "./TimeRec";

export class ScheduleElementsSet {
  constructor() {
    this.dataDB = {}
    this.objs = {}
    this.idGlossary = {'idApp': {}, 'idDB': {}}

    // Binding
    this.add = this.add.bind(this)
    this.getByidDB = this.getByidDB.bind(this)
    this.getByidApp = this.getByidApp.bind(this)
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
    this.dataDB[objIdDB] = obj.dataDB
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
}


export default class Schedule {
  constructor(){

    this.activities = new ScheduleElementsSet()
    this.events = new ScheduleElementsSet()
    this.tasks = new ScheduleElementsSet()
    this.timeRecs = new ScheduleElementsSet()

    // Element types
    this.elSets = {
      'task': this.tasks,
      'timeRec': this.timeRecs,
      'event': this.events,
      'activity': this.activities,
    }

    // Binding
    this.buildAllRefs = this.buildAllRefs.bind(this)
    this.addActivity = this.addActivity.bind(this)
    this.addEvent = this.addEvent.bind(this)
    this.addTask = this.addTask.bind(this)
    this.addTimeRec = this.addTimeRec.bind(this)
    this.buildRefsTime = this.buildRefsTime.bind(this)
    this.buildRefsEvent = this.buildRefsEvent.bind(this)
    this.initByDBdata = this.initByDBdata.bind(this)
    this.getAppState = this.getAppState.bind(this)

  }

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

    // Validations - should have all the necessary data
    const keysToHave = ["activities", "timeRecs", "events", "tasks"]
    dictValidateKeys(data, keysToHave, msg)

    // Unpack values
    const { activities, events, timeRecs, tasks } = data

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

  }


  buildRefsTime(time){
    const msg = 'buildRefsTime(): '

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
    actyIdDB = time.event.dataDB.activity_id
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
      // If task object is difference from the current one
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

    // Tasks
    if(!task.pinned)
      event.refTasksAdd(task)

    // Tasks pinned
    else
      event.refTasksPinnedAdd(task)

    // Time records
    if(!task.pinned)
      event.refTimeAdd(time)

    // Time records pinned
    else
      event.refTimePinnedAdd(time)

    // Event previous
    if(prev)
      if(event !== prev.event)
        event.prev = prev.event

    // Event next
    if(next)
      if(event !== next.event)
        event.next = next.event
  }

  buildRefsEvent(event){

    // INITIALIZATION
    let prevIdDB, nextIdDB, actyIdDB, activity

    // Pulling DB IDs
    prevIdDB = event.dataDB.prev || undefined
    nextIdDB = event.dataDB.next || undefined
    actyIdDB = event.dataDB.activity_id || undefined

    // Previous and next events
    event.prev = prevIdDB ? this.events.getByidDB(prevIdDB) : undefined
    event.next = nextIdDB ? this.events.getByidDB(nextIdDB) : undefined

    // ACTIVITY - BUILD REFS

    // Activity
    activity = this.activities.getByidDB(actyIdDB)
    event.activity = activity

    // Activity Events reference
    activity.refEventsAdd(event)
  }

  buildAllRefs(){

    // Get all tasks & events IDs lists
    let timeIDs = Object.keys(this.timeRecs.objs).map(id => Number(id))
    let eventIDs = Object.keys(this.events.objs).map(id => Number(id))

    // Build refs for Tasks & Events
    timeIDs.forEach((id) => this.buildRefsTime(this.timeRecs.get(id)))
    eventIDs.forEach((id) => this.buildRefsEvent(this.events.get(id)))
  }

  getAppState(){
    return true
  }
}