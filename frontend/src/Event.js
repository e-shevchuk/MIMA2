import {dictValidateID, dictValidateString,
        dictValidateDate, dictValidateDuration, dateStrUTCtoUnix}
        from "./service_functions"
import moment from "moment";
import ScheduleElement from "./ScheduleElement";


export default class Event extends ScheduleElement{

  constructor() {
    super({'type': 'Event'})

    // Related objects references

    this._refTasks = new Set([])
    this._refTasksPinned = new Set([])
    this._refTime = new Set([])
    this._refTimePinned = new Set([])

    // Binding

    this.refTasksAdd = this.refTasksAdd.bind(this)
    this.refTimeAdd = this.refTimeAdd.bind(this)
    this.refTasksPinnedAdd = this.refTasksPinnedAdd.bind(this)
    this.refTimePinnedAdd = this.refTimePinnedAdd.bind(this)
  }

  static fromDBJSON(json){
    // Create an empty instance
    const event = new Event()
    // Set up IDs and save DB form data
    event.initByDBJSON(json)

    return event
  }

  static fromDB(data){
    // Create an empty instance
    const event = new Event()
    // Set up IDs and save DB form data
    event.initByDB(data)

    return event
  }

  initByDB_DataFields(data){
    const msg = this.type + '.initByDB_DataFields(): '

    // Validations
    dictValidateString(data, 'title', msg)
    dictValidateID(data, 'activity_id', msg)
    dictValidateDate(data, 'start', msg)
    dictValidateDuration(data, 'duration', msg)

    // Title
    this.title = data.title
    // Start
    this.start = dateStrUTCtoUnix(data.start)
    // Duration
    this.duration = Number(moment.duration(data.duration))
  }


  // SETTERS & GETTERS

  // Parameters

  // Title
  set title(title)              {this._title = title}
  get title()                   {return this._title}

  // Duration
  set duration(duration)        {this._duration = duration}
  get duration()                {return this._duration}

  // Start
  set start(start)              {this._start = start}
  get start()                   {return this._start}

  // External references

  // Activity
  set activity(activity)        {this._activity = activity}
  get activity()                {return this._activity}

  // Tasks
  get refTasks()                {return [...this._refTasks]}
  refTasksAdd(t)                {this._refTasks.add(t)}

  // Time records
  get refTime()                 {return [...this._refTime]}
  refTimeAdd(t)                 {this._refTime.add(t)}

  // Tasks pinned
  get refTasksPinned()          {return [...this._refTasksPinned]}
  refTasksPinnedAdd(t)          {this._refTasksPinned.add(t)}

  // Time records pinned
  get refTimePinned()           {return [...this._refTimePinned]}
  refTimePinnedAdd(t)           {this._refTimePinned.add(t)}

  // Event next
  set next(next)                {this._next = next}
  get next()                    {return this._next}

  // Event previous
  set prev(prev)                {this._prev = prev}
  get prev()                    {return this._prev}

  // Additional Stuff

  // Data in backend DB form
  set dataDB(dataDB)      {this._dataDB = dataDB}
  get dataDB()            {return {...this._dataDB}}
}