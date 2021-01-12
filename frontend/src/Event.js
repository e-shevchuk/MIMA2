import {
  dictValidateID,
  dictValidateString,
  dictValidateDate,
  dictValidateDuration,
  dateStrUTCtoUnix,
  sortPrevNextListForEvent, DAYTIMEFORMAT
}
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

    // Other
    this.timeRecsSorted = false
    this.timeRecsPSorted = false

    // Binding

    this.refTasksAdd = this.refTasksAdd.bind(this)
    this.refTimeAdd = this.refTimeAdd.bind(this)
    this.refTasksPinnedAdd = this.refTasksPinnedAdd.bind(this)
    this.refTimePinnedAdd = this.refTimePinnedAdd.bind(this)
  }

  dataDBrefreshed(){
    const msg = 'Event.dataDBrefreshed(): '

    // VALIDATIONS

    if(this.activity === undefined)
      throw new Error(msg + 'Activity is undefined')

    if(this.title === undefined)
      throw new Error(msg + 'Title is undefined')


    if(this.start === undefined)
      throw new Error(msg + 'Event is undefined')

    if(this.duration === undefined)
      throw new Error(msg + 'Duration is undefined')

    // Convert duration in miliseconds into the DB format
    const durationDB =
      moment.duration(this.duration).format('hh:mm:ss', {trim:false})

    // Convert start in miliseconds into the DB format
    const startDB =
      moment(this.start, 'x').format(DAYTIMEFORMAT)

    return {
    "id": this.idDB,
    "prev": (this.prev === undefined)? null: this.prev.idDB,
    "next": (this.next === undefined)? null: this.next.idDB,
    "activity": this.activity.idDB,
    "title": this.title,
    "start": startDB,
    "duration": durationDB,
  }}

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
    dictValidateID(data, 'activity', msg)
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

  get refTime() {
    // If time records aren't sorted
    if(!this.timeRecsSorted) {
      // Sort time records list and change it's status
      const timeSorted = sortPrevNextListForEvent([...this._refTime])
      this._refTime = new Set(timeSorted)
      this.timeRecsSorted = true}

    return [...this._refTime]
  }

  refTimeAdd(t) {
    this.timeRecsSorted = false
    this._refTime.add(t)
  }

  // Tasks pinned
  get refTasksPinned()          {return [...this._refTasksPinned]}
  refTasksPinnedAdd(t)          {this._refTasksPinned.add(t)}

  // Time records pinned
  get refTimePinned() {
    // If time records aren't sorted
    if(!this.timeRecsPSorted) {
      // Sort time records list and change it's status
      const timePSorted = sortPrevNextListForEvent([...this._refTimePinned])
      this._refTimePinned = new Set(timePSorted)
      this.timeRecsPSorted = true}

    return [...this._refTimePinned]
  }

  refTimePinnedAdd(t) {
    this.timeRecsPSorted = false
    this._refTimePinned.add(t)
  }

  // Event next
  set next(next)                {this._next = next}
  get next()                    {return this._next}

  // Event previous
  set prev(prev)                {this._prev = prev}
  get prev()                    {return this._prev}

}