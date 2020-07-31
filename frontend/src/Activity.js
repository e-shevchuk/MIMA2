import {dictValidateID, dictValidateString} from "./service_functions";

export default class Activity {

  // CONSTRUCTORS

  constructor() {
  }

  static fromDBJSON(json){

    // Parameters processing
    const data = JSON.parse(json)

    // Validations
    dictValidateID(data, 'id', 'Activity.fromDBJSON(): ')
    dictValidateString(data, 'title', 'Activity.fromDBJSON(): ')

    // Create Activity object
    const activity = new Activity()

    // Setting parameters up
    activity.id = Number(data.id)
    activity.idDB = Number(data.id)
    activity.idApp = Number(data.id)
    activity.title = data.title

    // Initial data in DB format
    activity.dataDB = data

    return activity
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

  // External references

  // Events
  get events()                  {return this._events}

  // Additional Stuff

  // Data in backend DB form
  set dataDB(dataDB)      {this._dataDB = dataDB}
  get dataDB()            {return {...this._dataDB}}
}