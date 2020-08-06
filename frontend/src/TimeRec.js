import { dictValidateBoolean, dictValidateDuration, dictValidateID, }
  from "./service_functions";

import moment from "moment";
import ScheduleElement from "./ScheduleElement";

export default class TimeRec extends ScheduleElement{

  // CONSTRUCTORS

  constructor() {
    super({'type': 'TimeRec'})
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

    // Title
    this.title = data.title
    // Duration
    this.duration = Number(moment.duration(data.duration))
    // Complete
    this.complete = data.complete
  }

  // SETTERS & GETTERS

  // Parameters

  // ID
  set id(id)              {this._id = id}
  get id()                {return this._id}

  // ID in App
  set idApp(idApp)        {this._idApp = idApp}
  get idApp()             {return this._idApp}

  // ID in DB
  set idDB(idDB)          {this._idDB = idDB}
  get idDB()              {return this._idDB}

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
  set next(next)          {this._next = next}
  get next()              {return this._next}

  // Time record previous
  set prev(prev)          {this._prev = prev}
  get prev()              {return this._prev}

  // Task
  set task(task)          {this._task = task}
  get task()              {return this._task}

  // Additional Stuff

  // Data in backend DB form
  set dataDB(dataDB)      {this._dataDB = dataDB}
  get dataDB()            {return {...this._dataDB}}
}