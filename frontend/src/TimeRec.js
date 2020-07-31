import {
  dictValidateBoolean,
  dictValidateDuration,
  dictValidateID,
  dictValidateString
} from "./service_functions";
import moment from "moment";

export default class TimeRec {

  // CONSTRUCTORS

  constructor() {
  }

  static fromDBJSON(json){
    const errPref = 'TimeRec.fromDBJSON(): '

    // Parameters processing
    const data = JSON.parse(json)

    // Validations

    dictValidateID(data, 'id', errPref)
    dictValidateID(data, 'task', errPref)
    dictValidateID(data, 'event', errPref)
    dictValidateDuration(data, 'duration', errPref)
    dictValidateBoolean(data, 'complete', errPref)

    // Create Activity object
    const timeRec = new TimeRec()

    // Mandatory parameters

    // IDs
    const id = Number(data['id'])
    timeRec.id = id
    timeRec.idDB = id
    timeRec.idApp = id

    // Duration
    timeRec.duration = Number(moment.duration(data.duration))
    // Complete
    timeRec.complete = data.complete
    // Initial data in DB format
    timeRec.dataDB = data

    return timeRec
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