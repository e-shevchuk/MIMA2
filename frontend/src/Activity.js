import { dictValidateString } from "./service_functions";
import ScheduleElement from "./ScheduleElement";

export default class Activity extends ScheduleElement{

  constructor() {
    super({'type': 'Activity'})

    this._refEvents = new Set([])

    // Binding

    this.refEventsAdd = this.refEventsAdd.bind(this)

  }

  static fromDBJSON(json){
    // Create an empty instance
    const activity = new Activity()
    // Set up IDs and save data passed in DB form
    activity.initByDBJSON(json)

    return activity
  }

  static fromDB(data){
    // Create an empty instance
    const activity = new Activity()
    // Set up IDs and save data passed in DB form
    activity.initByDB(data)

    return activity
  }

  initByDB_DataFields(data){
    const msg = this.type + '.initByDB_DataFields(): '
    dictValidateString(data, 'title', msg)
    this.title = data.title
  }

  // SETTERS & GETTERS

  // Parameters

  // Title
  set title(title)              {this._title = title}
  get title()                   {return this._title}

  // External references

  // Events
  get refEvents()               {return [...this._refEvents]}
  refEventsAdd(t)               {this._refEvents.add(t)}

}