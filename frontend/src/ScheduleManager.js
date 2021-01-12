import Schedule from "./Schedule";
import { dictValidateKeys, wrongID, wrongSinceEmptyStr, wrongSinceNonStr }
  from "./service_functions";

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
    this.createTask = this.createTask.bind(this)
    this.diff = this.diff.bind(this)
    this.apiUpdateCalls = this.apiUpdateCalls.bind(this)
    this.apiCreateCalls = this.apiCreateCalls.bind(this)
    this.apiDeleteCalls = this.apiDeleteCalls.bind(this)
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
   *  @returns {{}} return an object with diffs for events, time records,
   *                tasks, activities based on this.update VS this.current
   *                dataDB comparison.
  **/

  diff() {
    return {
      'tasks': this.current.tasks.diff(this.update.tasks),
      'timeRecs': this.current.timeRecs.diff(this.update.timeRecs),
      'events': this.current.events.diff(this.update.events),
      'activities': this.current.activities.diff(this.update.activities),
    }
  }

  /**
   *  @returns {{}} return a list of DB api calls to execute to apply push
   *                difference between 'current' and 'update' schedules
   *                to DB
  **/

  apiUpdateCalls(diff){
    const msg = 'ScheduleManager.apiUpdateCalls(): '
    const calls = { 'timeRecs': [], 'tasks': [] }

    // Tasks
    Object.keys(diff.tasks.update).forEach(elId => {
      // Add API call to the list
      calls['tasks'].push(
        this.api.tasks.update(
          // API call data
          diff.tasks.update[elId].getDataDB(),
          // Function to call on Success
          diff.tasks.update[elId].onSuccess,
    ))})

    // Time records
    Object.keys(diff.timeRecs.update).forEach(elId => {
      console.log(msg, 'Time records update API data:',
        diff.timeRecs.update[elId].getDataDB())
      // Add API call to the list
      calls['timeRecs'].push(
        this.api.timeRecs.update(
          // API call data
          diff.timeRecs.update[elId].getDataDB(),
          // Function to call on Success
          diff.timeRecs.update[elId].onSuccess,
    ))})

  return calls
  }

  apiCreateCalls(diff){
    const msg = 'ScheduleManager.apiCreateCalls(): '
    const calls = { 'timeRecs': [], 'tasks': [] }

    // Tasks
    Object.keys(diff.tasks.create).forEach(elId => {

      // Pick a particular diff Element (diffEl)
      const diffEl = diff.tasks.create[elId]

      // Form dataDB with no id (which is temporary at the moment)
      const {id, ...dataDB} = diffEl.getDataDB()

      // Add API call to the list
      calls['tasks'].push(
        this.api.tasks.create(dataDB, diffEl.onSuccess))

    })

    // Time Record
    Object.keys(diff.timeRecs.create).forEach(elId => {

      // Pick a particular diff element
      const diffEl = diff.timeRecs.create[elId]

      // Form dataDB with no reference parameters and id
      const {id, task, event, next, prev, ...dataDB} = diffEl.getDataDB()

      // Add API call to the list
      calls['timeRecs'].push(
        this.api.timeRecs.create(dataDB, diffEl.onSuccess))

    })

    return calls
  }

  apiDeleteCalls(diff){
    const msg = 'ScheduleManager.apiDeleteCalls(): '
    const calls = { 'timeRecs': [], 'tasks': [] }

    // Time
    Object.keys(diff.timeRecs.delete).forEach(elId => {
      // Add API call to the list
      calls['timeRecs'].push(
        this.api.timeRecs.delete(
          // API call data
          diff.timeRecs.delete[elId].getDataDB(),
          // Function to call on Success
          diff.timeRecs.delete[elId].onSuccess,
    ))})

    // Tasks
    Object.keys(diff.tasks.delete).forEach(elId => {
      // Add API call to the list
      calls['tasks'].push(
        this.api.tasks.delete(
          // API call data
          diff.tasks.delete[elId].getDataDB(),
          // Function to call on Success
          diff.tasks.delete[elId].onSuccess,
    ))})

    return calls
  }

  async applyUpdate(){
    const msg = 'ScheduleManager.applyUpdate(): '
    let data

    // PUSH CHANGES TO FRONT

    // Push to app
    this.app.setState(this.update.appState)

    // DB UPDATES PREPARATION

    const diff = this.diff()

    console.log(msg, 'diff:', diff)

    console.log(msg, 'START CREATE CALLS')
    const createCalls = this.apiCreateCalls(diff)
    console.log(msg, 'createCalls:', createCalls)
    await Promise.all([...createCalls.tasks, ...createCalls.timeRecs])

    console.log(msg, 'START UPDATE CALLS')
    const updateCalls = this.apiUpdateCalls(diff)
    console.log(msg, 'updateCalls:', updateCalls)
    await Promise.all([...updateCalls.tasks, ...updateCalls.timeRecs])

    console.log(msg, 'START DELETE CALLS')
    const deleteCalls = this.apiDeleteCalls(diff)
    console.log(msg, 'deleteCalls:', deleteCalls)
    await Promise.all([...deleteCalls.tasks, ...deleteCalls.timeRecs])

    // MAKE UPDATE TO BE CURRENT

    // Turn 'update schedule' to 'current'
    this.current = this.update

    // Create 'update schedule' as a copy of 'current'
    this.update = this.current.copy()

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

    // UPDATE

    // Update object title
    this.update.tasks.getByidApp(idApp).title = titleNew
    // Apply the changes to App and back-end
    return await this.applyUpdate()
  }

  /**
   *  @param {id} idApp
   *  @param {title} titleNew
   *
   *  @returns {boolean} true, if update is successful
  **/

  async createTask(title, pinned, eventAppID, timeAppID, after){
    const msg = 'ScheduleManager.createTask(): '

    // VALIDATIONS

    // Event application ID

    if (wrongID(eventAppID))
      throw new Error(msg + "incorrect event idApp: " + eventAppID)
    if (!(eventAppID in this.update.events.idGlossary.idApp))
      throw new Error(msg + "non existent event idApp: " + eventAppID)

    // Time application ID (if it is provided)

    if(!(timeAppID === undefined)) {
      if (wrongID(timeAppID))
        throw new Error(msg + "incorrect time idApp: " + timeAppID)
      if (!(timeAppID in this.update.timeRecs.idGlossary.idApp))
        throw new Error(msg + "non existent time idApp: " + timeAppID)
    }

    // New task title

    if (title === undefined)
      throw new Error(msg + "title is not provided")
    if (wrongSinceNonStr(title))
      throw new Error(msg + "title is not a string")

    // INITIALIZATION

    after = (after === undefined) ? true : after

    // UPDATE

    // Update object title
    this.update.createTask(title, pinned, eventAppID, timeAppID, after)
    // Apply the changes to App and back-end
    return await this.applyUpdate()
  }

  async updTaskTitleByTime(idApp, titleNew){
    const taskId = this.current.timeRecs.getByidApp(idApp).task.id
    return await this.updTaskTitle(taskId, titleNew)
  }
}