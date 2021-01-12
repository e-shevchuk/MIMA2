import { dictValidateBoolean, dictValidateDuration, dictValidateID, }
  from "./service_functions";

import moment from "moment";
import ScheduleElement from "./ScheduleElement";

export default class TimeRec extends ScheduleElement{

  // CONSTRUCTORS

  constructor() {
    super({'type': 'TimeRec'})
    this._next = undefined
    this._prev = undefined

    this.dataDBrefreshed = this.dataDBrefreshed.bind(this)
  }

  static fromDBJSON(json){
    // Create an empty instance
    const time = new TimeRec()
    // Set up IDs and save DB form data
    time.initByDBJSON(json)

    return time
  }

  static fromDB(data){
    // Create an empty instance
    const time = new TimeRec()
    // Set up IDs and save DB form data
    time.initByDB(data)

    return time
  }

  initByDB_DataFields(data){
    const msg = this.type + '.initByDB_DataFields(): '

    // Validations
    dictValidateID(data, 'task', msg)
    dictValidateID(data, 'event', msg)
    dictValidateDuration(data, 'duration', msg)
    dictValidateBoolean(data, 'complete', msg)

    // Duration
    this.duration = Number(moment.duration(data.duration))
    // Complete
    this.complete = data.complete
  }

  /**
   *  This purely internal function being called by ScheduleElement.dataDB
   *  getter. It replaces referenced elements IDs that may be outdated with
   *  their fresh version pulled from actual instances. Applicable to: next,
   *  prev, ... etc.
   *
   *  @returns {{}} return a list of refreshed properties
  **/

  dataDBrefreshed(){

    const refreshedValues = {}
    if(this.next) refreshedValues['next'] = this.next.idDB
    if(this.prev) refreshedValues['prev'] = this.prev.idDB
    if(this.task) refreshedValues['task'] = this.task.idDB

    return refreshedValues
  }

  dataDBrefreshed(){
    const msg = 'TimeRec.dataDBrefreshed(): '

    // VALIDATIONS

    if(this.task === undefined)
      throw new Error(msg + 'Task is undefined')

    if(this.event === undefined)
      throw new Error(msg + 'Event is undefined')

    if(this.duration === undefined)
      throw new Error(msg + 'Duration is undefined')

    if(this.complete === undefined)
      throw new Error(msg + '"Complete" is undefined')

    // Convert duration in miliseconds into the DB format
    const durationDB =
      moment.duration(this.duration).format('hh:mm:ss', {trim:false})

    return {
    "id": this.idDB,
    "task": this.task.idDB,
    "event": this.event.idDB,
    "prev": (this.prev === undefined)? null: this.prev.idDB,
    "next": (this.next === undefined)? null: this.next.idDB,
    "duration": durationDB,
    "complete": this.complete,
  }}


  // SETTERS & GETTERS

  // Parameters

  // ID
  set id(id)              {this._id = id}
  get id()                {return this._id}

  // ID in App
  set idApp(idApp)        {this._idApp = idApp}
  get idApp()             {return this._idApp}

  // // ID in DB
  // set idDB(idDB)          {this._idDB = idDB}
  // get idDB()              {return this._idDB}

  // Duration
  set duration(duration)  {this._duration = duration}
  get duration()          {return this._duration}

  // Complete
  set complete(complete)  {this._complete = complete}
  get complete()          {return this._complete}

  // External references

  // Activity
  set activity(activity)  {this._activity = activity}
  get activity()          {return this._activity}

  // Event
  set event(event)        {this._event = event}
  get event()             {return this._event}

  // Time record next
  set next(next) {
    this._next = next
    this.dataDB = {...this.dataDB, 'next': next.idDB}
  }

  get next()              {return this._next}

  // Time record previous
  set prev(prev) {
    this._prev = prev
    this.dataDB = {...this.dataDB, 'prev': prev.idDB}
  }
  get prev()              {return this._prev}

  // Task
  set task(task)          {this._task = task}
  get task()              {return this._task}

  // Additional Stuff

  // // // Data in backend DB form
  // set dataDB(dataDB)      {super.dataDB(dataDB)}
  // get dataDB()            {return {...super._dataDB}}
}