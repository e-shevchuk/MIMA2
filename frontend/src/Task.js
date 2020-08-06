import {
  dictValidateID, dictValidateString, dictValidateDuration,
  dictValidateBoolean, dateStrUTCtoUnix, dictValidateDate
} from "./service_functions";
import moment from "moment";
import ScheduleElement from "./ScheduleElement";

export default class Task extends ScheduleElement{

  // CONSTRUCTORS

  constructor() {
    super({'type': 'Task'})

    // Linked objects Sets
    this._refEvents = new Set()
    this._refTime = new Set()

    // Binding
    this.refEventsAdd = this.refEventsAdd.bind(this)
    this.refTimeAdd = this.refTimeAdd.bind(this)
  }

  static fromDBJSON(json){
    // Create an empty instance
    const task = new Task()
    // Set up IDs and save DB form data
    task.initByDBJSON(json)

    return task
  }

  static fromDB(data){
    // Create an empty instance
    const task = new Task()
    // Set up IDs and save DB form data
    task.initByDB(data)

    return task
  }

  initByDB_DataFields(data){
    const msg = this.type + '.initByDB_DataFields(): '

    // Validations
    dictValidateString(data, 'title', msg)
    dictValidateDuration(data, 'duration', msg)
    dictValidateBoolean(data, 'complete', msg)
    dictValidateBoolean(data, 'pinned', msg)

    // Title
    this.title = data.title
    // Duration
    this.duration = Number(moment.duration(data.duration))
    // Complete
    this.complete = data.complete
    // Pinned
    this.pinned = data.pinned
  }


  static fromApp(){
    return new Task()
  }

  // SETTERS & GETTERS

  // Parameters

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
  get refEvents()          {return [...this._refEvents]}
  refEventsAdd(e)          {this._refEvents.add(e)}

  // Task next
  set next(next)          {this._next = next}
  get next()              {return this._next}

  // Task previous
  set prev(prev)          {this._prev = prev}
  get prev()              {return this._prev}

  // Time records
  get refTime()           {return [...this._refTime]}
  refTimeAdd(t)           {this._refTime.add(t)}

  // Additional Stuff

  // Data in backend DB form
  set dataDB(dataDB)      {this._dataDB = dataDB}
  get dataDB()            {return {...this._dataDB}}
}