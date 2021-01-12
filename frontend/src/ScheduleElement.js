import {
  dictValidateID,
  dictValidateString,
  jsonValidate, wrongID
} from "./service_functions";

export default class ScheduleElement {
  constructor(params) {
    const msg = 'ScheduleElement.constructor(): '

    this._dataDB = {}
    this._refsBuilt = false

    // ELEMENT TYPE

    // Pulling from params
    dictValidateString(params, 'type', msg)
    this._type = params['type']
    // Validating the type value
    const types = new Set(['Activity', 'Event', 'Task', 'TimeRec'])
    if (!types.has(this.type))
      throw new Error(msg + 'incorrect type: ' + this.type)

    // BINDING

    this.initByDB_DataFields = this.initByDB_DataFields.bind(this)
    this.initByDBJSON = this.initByDBJSON.bind(this)
    this.initByDB = this.initByDB.bind(this)
  }



  initByDB_DataFields(data){
    const msg = 'ScheduleElement.initByDB_DataFields(): '
    throw new Error(msg + 'need to be redefined!')
  }

  initByDBJSON(json){
    const msg = this.type + '.initByDBJSON(): '

    // JSON Validation
    jsonValidate(json, msg)

    // Parameters processing
    const data = JSON.parse(json)

    this.initByDB(data)
  }

  initByDB(data){
    const msg = this.type + '.initByDB(): '

    // Validations
    dictValidateID(data, 'id', msg)

    // Save DB format initial data
    this.dataDB = data

    // Setting up IDs

    this.id = Number(data.id)
    this.idDB = Number(data.id)
    this.idApp = Number(data.id)

    // Setting up all other fields
    this.initByDB_DataFields(data)
  }

  // SETTERS & GETTERS

  // Element type
  get type()                    {return this._type}

  // Parameters

  // ID
  set id(id)                    {this._id = id}
  get id()                      {return this._id}

  // ID in App
  set idApp(idApp)              {this._idApp = idApp}
  get idApp()                   {return this._idApp}

  // ID in DB
  set idDB(idDB) {
    const msg = '[setter] ScheduleElement.idDB: '

    // Validation
    if(wrongID(idDB))
      throw new Error("Wrong idDB: " + String(idDB))

    // Update value
    this._idDB = idDB
  }

  get idDB() {
    const msg = '[getter] ScheduleElement.idDB: '

    // Validation
    if(this._idDB === undefined)
      throw new Error('idDB is not initialized')

    // pull the value
    return this._idDB
  }


  // Data in DB format
  set dataDB(dataDB)            {this._dataDB = dataDB}
  get dataDB() {
    const msg = 'Schedule.Element.dataDB(): '

    // Validate that if refs are built dataDBrefreshed() should be defined
    if(this.refsBuilt)
      if(this.dataDBrefreshed === undefined){
        const errMsg = 'Object with built refs dataDBrefreshed() undefined'
        throw new Error(msg + errMsg)
      }

    // If refs are built than dataDB may be outdated, so we have generate
    if(!this.refsBuilt)
      return {...this._dataDB}
    else
      return {...this.dataDBrefreshed()}
  }

  // Refs built indicator
  set refsBuilt(refsBuilt)      {this._refsBuilt = refsBuilt}
  get refsBuilt()               {return this._refsBuilt}
}

