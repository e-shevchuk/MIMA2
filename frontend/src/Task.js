import {dictValidateID, dictValidateString, dictValidateDuration,
        dictValidateBoolean, dateStrUTCtoUnix} from "./service_functions";
import moment from "moment";

export default class Task {

  // CONSTRUCTORS

  constructor() {
    // Binding
    this.addEvent = this.addEvent.bind(this)
    this.addTime = this.addTime.bind(this)
  }

  static fromDBJSON(json, events){
    const errPref = 'Task.fromDBJSON(): '

    // Parameters processing
    const data = JSON.parse(json)

    // Validations

    dictValidateID(data, 'id', errPref)
    dictValidateString(data, 'title', errPref)
    dictValidateDuration(data, 'duration', errPref)
    dictValidateBoolean(data, 'complete', errPref)
    dictValidateBoolean(data, 'pinned', errPref)

    // Create Activity object
    const task = new Task()

    // Mandatory parameters

    // IDs
    task.id = Number(data['id'])
    task.idDB = Number(data['id'])
    task.idApp = Number(data['id'])
    // Title
    task.title = data.title
    // Duration
    task.duration = Number(moment.duration(data.duration))
    // Complete
    task.complete = data.complete
    // Pinned
    task.pinned = data.pinned

    // Initial data in DB format
    task.dataDB = data

    // Linked objects list
    task._events = new Set()
    task._time = new Set()

    return task
  }

  static fromApp(){
    return new Task()
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

  // Title
  set title(title)        {this._title = title}
  get title()             {return this._title}

  // Duration
  set duration(duration)  {this._duration = duration}
  get duration()          {return this._duration}

  // Pinned
  set pinned(pinned)      {this._pinned = pinned}
  get pinned()            {return this._pinned}

  // Complete
  set complete(complete)  {this._complete = complete}
  get complete()          {return this._complete}

  // External references

  // Activity
  set activity(activity)  {this._activity = activity}
  get activity()          {return this._activity}

  // events
  get events()            {return [...this._events]}
  addEvent(e)             {this._events.add(e)}

  // Task next
  set next(next)          {this._next = next}
  get next()              {return this._next}

  // Task previous
  set prev(prev)          {this._prev = prev}
  get prev()              {return this._prev}

  // Time records
  get time()            {return [...this._time]}
  addTime(t)             {this._time.add(t)}

  // Additional Stuff

  // Data in backend DB form
  set dataDB(dataDB)      {this._dataDB = dataDB}
  get dataDB()            {return {...this._dataDB}}
}