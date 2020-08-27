import Schedule from "./Schedule";
import {
  dictValidateID,
  dictValidateKeys, wrongID,
  wrongSinceEmptyStr,
  wrongSinceNonStr
} from "./service_functions";

export default class ScheduleManager{
  constructor(app, api){

    this.current = new Schedule()
    this.update = new Schedule()

    this.app = app
    this.api = api
    this.settings = {}

    // Binding

    this.initByDBdata = this.initByDBdata.bind(this)
    this.pushToApp = this.pushToApp.bind(this)
    this.applyUpdate = this.applyUpdate.bind(this)
    this.init = this.init.bind(this)
    this.getUpdateApiCalls = this.getUpdateApiCalls.bind(this)
  }

  initByDBdata(data){
    const msg = "ScheduleManager.initByDBdata(): "

    // Validations - should have all the necessary data
    dictValidateKeys(data, ["settings"], msg)

    this.current.initByDBdata(data)
    this.update.initByDBdata(data)

    // Settings
    Object.keys(data.settings).forEach(id => {
      this.settings[data.settings[id].code] = data.settings[id]
    })
  }

  async init(){
    const data = await this.api.getAll()
    this.initByDBdata(data)
    this.app.setState(this.current.appState)
  }

  pushToApp(){
    return true
  }

  /**
   *  @returns {[]} return a list of DB api calls to execute to apply push
   *                difference between 'current' and 'update' schedules
   *                to DB
  **/

  getUpdateApiCalls(){
    return []
  }

  async applyUpdate(){

    // Get api calls list
    const updApiCalls = this.getUpdateApiCalls()
    // If it is empty - do nothing
    if (updApiCalls.length === 0) return true

    // Execute api calls list

    // Turn 'update schedule' to 'current'

    // Create 'update schedule' as a copy of 'current'

    // Push to app

    return true
  }


  /**
   *  @param {id} idApp
   *  @param {title} titleNew
   *
   *  @returns {boolean} true, if update is successful
  **/

  async updTaskTitle(idApp, titleNew){
    const msg = 'ScheduleManager.updTaskTitle(): '

    // VALIDATIONS

    // Task application ID
    if (wrongID(idApp))
      throw new Error(msg + "incorrect task idApp: " + idApp)
    if (!(idApp in this.update.tasks.idGlossary.idApp))
      throw new Error(msg + "non existent task idApp: " + idApp)

    // New task title
    if (titleNew === undefined)
      throw new Error(msg + "titleNew is not provided")
    if (wrongSinceNonStr(titleNew))
      throw new Error(msg + "titleNew is not a string")
    if (wrongSinceEmptyStr(titleNew))
      throw new Error(msg + "titleNew is empty string")

    // UPDATE 'update schedule'

    // Get an object itself
    const t = this.current.tasks.getByidApp(idApp)
    // Update object title
    t.title = titleNew
    // Update title in the tasks branch of DB snapshot
    this.current.tasks.dataDB[t.id].title = titleNew

    // APPLY the changes to App and back-end
    return await this.applyUpdate()
  }
}