import {dictValidateID, dictValidateString,
        dictValidateDate, dictValidateDuration, dateStrUTCtoUnix}
        from "./service_functions"
import moment from "moment";

export default class Event {

  // CONSTRUCTORS

  constructor() {
    // Binding

    this.addTask = this.addTask.bind(this)
    this.addTime = this.addTime.bind(this)
    this.addTaskPinned = this.addTaskPinned.bind(this)
    this.addTimePinned = this.addTimePinned.bind(this)
  }

  static fromDBJSON(json){
    const errPref = 'Event.fromDBJSON(): '

    // Parameters processing
    const data = JSON.parse(json)

    // Validations

    dictValidateID(data, 'id', errPref)
    dictValidateString(data, 'title', errPref)
    dictValidateID(data, 'activity_id', errPref)
    dictValidateDate(data, 'start', errPref)
    dictValidateDuration(data, 'duration', errPref)

    // Create Activity object
    const event = new Event()

    // Mandatory parameters

    // IDs
    event.id = Number(data['id'])
    event.idDB = Number(data['id'])
    event.idApp = Number(data['id'])
    // Title
    event.title = data.title
    // Start
    event.start = dateStrUTCtoUnix(data.start)
    // Duration
    event.duration = Number(moment.duration(data.duration))

    // Initial data in DB format
    event.dataDB = data

    return event
  }

  // SETTERS & GETTERS

  // Parameters

  // ID
  set id(id)                    {this._id = id}
  get id()                      {return this._id}

  // ID in App
  set idApp(idApp)              {this._idApp = idApp}
  get idApp()                   {return this._idApp}

  // ID in DB
  set idDB(idDB)                {this._idDB = idDB}
  get idDB()                    {return this._idDB}

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
  get tasks()                   {return [...this._tasks]}
  addTask(t)                    {this._tasks.add(t)}

  // Time records
  get time()                   {return [...this._time]}
  addTime(t)                   {this._time.add(t)}

  // Tasks pinned
  get tasksPinned()            {return [...this._tasksPinned]}
  addTaskPinned(t)             {this._tasksPinned.add(t)}

  // Time records pinned
  get timePinned()              {return [...this._timePinned]}
  addTimePinned(t)              {this._timePinned.add(t)}

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