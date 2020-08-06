import {
  dictValidateID,
  dictValidateString,
  jsonValidate
} from "./service_functions";

export default class ScheduleElement {
  constructor(params) {
    const msg = 'ScheduleElement.constructor(): '

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

    // Setting up IDs

    this.id = Number(data.id)
    this.idDB = Number(data.id)
    this.idApp = Number(data.id)

    // Setting up all other fields
    this.initByDB_DataFields(data)

    // Initial data in DB format
    this.dataDB = data

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
  set idDB(idDB)                {this._idDB = idDB}
  get idDB()                    {return this._idDB}


  // Data in DB format
  set dataDB(dataDB)            {this._dataDB = dataDB}
  get dataDB()                  {return this._dataDB}
}

