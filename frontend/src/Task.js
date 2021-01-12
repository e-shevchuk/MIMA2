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
    this.dataDBrefreshed = this.dataDBrefreshed.bind(this)
  }

  dataDBrefreshed(){
    const msg = 'Task.dataDBrefreshed(): '

    // VALIDATIONS

    if(this.title === undefined)
      throw new Error(msg + 'Title is undefined')

    if(this.pinned === undefined)
      throw new Error(msg + '"Pinned" is undefined')

    if(this.duration === undefined)
      throw new Error(msg + 'Duration is undefined')

    if(this.complete === undefined)
      throw new Error(msg + '"Complete" is undefined')

    // Convert duration in miliseconds into the DB format
    const durationDB =
      moment.duration(this.duration).format('hh:mm:ss', {trim:false})

    return {
    "id": this.idDB,
    "title": this.title,
    "pinned": this.pinned,
    "duration": durationDB,
    "complete": this.complete
  }}


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
    // dictValidateString(data, 'title', msg)
    dictValidateDuration(data, 'duration', msg)
    dictValidateBoolean(data, 'complete', msg)
    dictValidateBoolean(data, 'pinned', msg)

    // Title
    this.title = ('title' in data) ? data.title : ''
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
  set title(title) {
    this._title = title
    this.dataDB = {...this.dataDB, 'title': title}
  }
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
}