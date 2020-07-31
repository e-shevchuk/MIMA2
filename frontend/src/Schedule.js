import {dictValidateID, dictValidateString, dictValidateDuration,
        dictValidateBoolean, dateStrUTCtoUnix, wrongID, wrongSinceNonStr,
        wrongSinceEmptyStr} from "./service_functions";

export class ScheduleElementsSet {
  constructor() {
    this.data = {}
    this.objs = {}
    this.idGlossary = {'idApp': {}, 'idDB': {}}

    // Binding
    this.add = this.add.bind(this)
    this.getByidDB = this.getByidDB.bind(this)
    this.getByidApp = this.getByidApp.bind(this)
  }

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
        throw new Error(msg + "no object for id="+ id +" found")

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
    this.build = this.build.bind(this)
    this.addActivity = this.addActivity.bind(this)
    this.addEvent = this.addEvent.bind(this)
    this.addTask = this.addTask.bind(this)
    this.addTimeRec = this.addTimeRec.bind(this)
    this.buildRefsTime = this.buildRefsTime.bind(this)
    this.buildRefsEvent = this.buildRefsEvent.bind(this)

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

  buildRefsTime(time){

    // INITIALIZATION
    let prevIdDB, nextIdDB, taskIdDB, eventIdDB, actyIdDB, task, prev, next,
        event, activity

    // BUILD REFS IN TIME

    // Pulling DB IDs

    prevIdDB = time.data.prev || undefined
    nextIdDB = time.data.prev || undefined
    taskIdDB = time.data.task || undefined
    eventIdDB = time.data.event || undefined

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
    actyIdDB = time.event.data.activity_id
    activity = this.activities.getByidDB(actyIdDB)
    time.activity = activity

    // BUILD REFS IN TASK

    // Activity
    task.activity = time.activity
    // Events
    task.addEvent(time.event)
    // Time records
    task.addTime(time)

    // Task previous
    if(prev)
      if(task !== prev.task)
        task.prev = prev.task

    // Task next
    if(next)
      if(task !== next.task)
        task.next = next.task

    // BUILD REFS IN EVENT

    // Activity
    event.activity = activity

    // Tasks
    if(!task.pinnned)
      event.addTask(task)

    // Tasks pinned
    else
      event.addTaskPinned(task)

    // Time records
    if(!task.pinnned)
      event.addTime(time)

    // Time records pinned
    else
      event.addTimePinned(time)

    // Event previous
    if(prev)
      if(event !== prev.event)
        event.prev = prev.event

    // Event next
    if(next)
      if(event !== next.event)
        event.next = next.event
  }

  buildRefsEvent(){
    return true
  }

  build(){

    // Go through all the tasks


    // Go through all the events

    return true
  }
}