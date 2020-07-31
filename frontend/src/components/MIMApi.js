import React from "react";
import getCookie from "../service_functions";
import 'whatwg-fetch'

class MIMApiBase {
  constructor() {
    this.csrftoken = getCookie('csrftoken');
    this.url = 'https://mima.f15.dev/api/';

    this.JSONFetch = this.JSONFetch.bind(this)
    this.createProperties = this.createProperties.bind(this)
    this.pushToState = this.pushToState.bind(this)
    this.getTemporary = this.getTemporary.bind(this)
    this.getAll = this.getAll.bind(this)
  }

  async JSONFetch(method = '', data = undefined) {

    // console.log('JSONFetch() param data:', data, 'method:', method)

    let id

    // INITIALIZATION & CHECKS

    if (method === '')
      throw new Error("JSONQuery() FAILED: No method provided")

    if (this.url === '')
      throw new Error("JSONQuery() FAILED: API Branch provided")

    // URL

    let url = this.url + this.apiBranch + "/"

    if (method === 'DELETE')
      id = String(data)

    if (method === 'PUT')
      id = data.id

    if (id !== undefined)
      url += id + '/'

    // OPTIONS

    const options = {
      method: method,
      headers: {
        "Content-Type": 'application/json',
        "X-CSRFToken": this.csrftoken,
      }
    }

    // If data is provided
    if (data !== undefined && (method === 'POST' || method === 'PUT'))
      // Will add it to init parameters as body
      options["body"] = JSON.stringify(data)

    window.url = url
    window.options = options

    // FETCH

    // console.log('JSONFetch fetch() ur:', url, 'options:', options)

    let fetchResult = await fetch(url, options)
    // console.log('JSONFetch fetchResult:', fetchResult)

    return fetchResult
  }

  async get() {
    let data

    // Make the base requestw
    let fetch_result = await this.JSONFetch('GET')
    // console.log('JSONFetch restul:', fetch_result)

    // If it went well
    if (fetch_result.ok) {
      // Get the Data
      data = await fetch_result.json()
      // console.log('get() fetch_result.json():', data)
    }
    // If request isn't OK - log it
    else
      throw new Error("get() FAILED: HTTP-Error");

    return await data
  }

  /**
   * @param {callBack} onSuccess function
   */

  async getAll(onSuccess){
    onSuccess = onSuccess || undefined
    let idDict = {}
    const fetchData = await this.get()


    if(fetchData.count === fetchData.results.length) {
      fetchData.results.map(obj => idDict[obj.id] = obj)
      if (onSuccess)
        onSuccess(idDict)
    } else {
      throw new Error("MIMApiBase.getAll(...) # of data points don't match")
    }


    return idDict
  }

  createProperties() {
    // If it is not defined on a Child level - throw error
    throw new Error("createProperties(...) is to be re-defined in a Child");
  }

  async create(params, callOnSuccess, callOnFail) {

    // INITIALIZATION

    let data
    const props = this.createProperties(params)

    // REQUEST

    let fetch_result = await this.JSONFetch('POST', props)
    // console.log('create() fetch result!:', fetch_result)

    // ON SUCCESS

    if (fetch_result.ok) {

      // Get the Data
      data = await fetch_result.json()
      // console.log('fetch result.json() => data', data)

      // If the data is OK and onSuccess is provided - calll it
      if ('id' in data && callOnSuccess !== undefined) {
        callOnSuccess(data)

        // console.log('create() state, after callOnSuccess() => push:',
        //   this.stateBranch, this.component.state[this.stateBranch])
      }
    }

    // ON FAILURE

    else {
      console.log("%ccreate() FAILED: HTTP-Error", 'color: red')
      // If onFailCall is provided - call it
      if (callOnFail !== undefined)
        callOnFail(fetch_result)
    }

    return await data
  }


  /**
   * @param {dictionary} params Whole object or its id
   * @param {callBack} onSuccess function
   * @param {callBack} onFail function
   */
  async update(params, onSuccess, onFail) {

    onSuccess = onSuccess || undefined
    onFail = onFail || undefined

    let id
    let data

    // console.log('update() params: ', params)

    // Pull the id from params
    if (typeof (params) === 'object')
      if ('id' in params)
        id = params.id

    // If there was no id
    if (id === undefined)
      throw new Error("update(...) No ID provided")

    // Make the base request
    let fetch_result = await this.JSONFetch('PUT', params)

    // If it went well
    if (fetch_result.ok) {

      // Get the Data
      data = await fetch_result.json()

      // If the data is OK and onFailCall is provided - calll it
      if ('id' in data && onSuccess !== undefined){
        onSuccess(data)
      }
    }
    // If request isn't OK - log it
    else {
      console.log("%cupdate() FAILED: HTTP-Error", 'color: red')
      // If onFailCall is provided - call it
      if (onFail !== undefined)
        onFail(params)
    }

    return await data
  }

  /**
   * @param {id} param Whole object or its id
   * @param {callBack} onSuccess function
   * @param {callBack} onFail function
   */
  async delete({
                 param,
                 onSuccess = undefined,
                 onFail = undefined
               }) {

    console.log('delete() param:', param)

    let data
    let id = undefined

    // PULL THE ID FROM PARAMS

    // What if params is dictionary
    if (typeof (param) === 'object')
      if ('id' in param)
        id = param.id

    // What if params is number or stringed number
    if (typeof (param) === 'number' || typeof (param) === 'string')
      if (Number(param) >= 0)
        id = Number(param)

    // If we did'n manage to pull the ID out - something is very wrong
    if (id === undefined)
      throw new Error("delete(...) No ID provided")

    // PERFORM THE REQUEST

    console.log('delete(), id:', id)
    // Make the base request
    let fetch_result = await this.JSONFetch('DELETE', id)

    // If it went well
    if (fetch_result.ok) {
      // onFailCall is provided - calll it
      if (onSuccess !== undefined) {
        console.log('delete(): trying to call on Success')
        // Call the "onSuccess"
        onSuccess(id)
      }

      return true
    }
    // If not really
    else {
      console.log("%cdelete() FAILED: HTTP-Error", 'color: red')
      // If onFailCall is provided - call it
      if (onFail !== undefined)
        onFail(data)
    }

    return false
  }

  pushToState(obj) {

    // if (this.stateBranch === 'allTasks')
    //   console.log('pushToState() => : ', this.stateBranch, obj)

    // Get copy of current branch
    const stateComponentNew =
      JSON.parse(JSON.stringify(
        this.component.state[this.stateBranch]))

    // If copy of current branch don't have such ID in yet - create it
    if (!(obj.id in stateComponentNew))
      stateComponentNew[obj.id] = {}

    // Update the copy of branch
    Object.assign(stateComponentNew[obj.id], obj)

    // console.log('TAKE FIVE!', stateComponentNew)
    // console.log(this.component.state)

    // Push the update copy back to the state
    this.component.setState({[this.stateBranch]: stateComponentNew})

    // console.log(this.component.state)


  }

  getTemporary(requestedProperties = undefined) {
    const element = this.createProperties(requestedProperties)
    element['id'] = Date.now()
    return element
  }

  replaceID(idOld, idNew) {

    // Get current version 'branch copy'
    const stateComponentNew =
      JSON.parse(JSON.stringify(
        this.component.state[this.stateBranch]))

    // Save element
    const element = {...stateComponentNew[idOld]}
    delete element.id
    element.id = idNew

    // Replace element
    delete stateComponentNew[idOld]
    stateComponentNew[idNew] = element

    // Push back to the component state
    this.component.setState({[this.stateBranch]: stateComponentNew})
  }

  removeID(id) {
    // Get current version 'branch copy'
    const stateComponentNew =
      JSON.parse(JSON.stringify(
        this.component.state[this.stateBranch]))

    // Replace element
    delete stateComponentNew[id]

    // Push back to the component state
    this.component.setState({[this.stateBranch]: stateComponentNew})
  }

}

class TaskAPI extends MIMApiBase {
  constructor(apiBranch, stateBranch, component) {
    super()
    this.apiBranch = apiBranch
    this.stateBranch = stateBranch
    this.component = component
    // console.log('TaskAPI.constructor(...): component:', component)
  }

  createProperties(requestedProperties = undefined) {

    // Task Template
    const defaultProperties = {
      "project_id": "",
      "title": "",
      "duration": "00:10:00",
      "complete": false,
      "pinned": false,
      "order": 0,
      "active": true
    }

    // Merge requested properties into the Template
    const completeProperties =
      Object.assign(
        defaultProperties,
        requestedProperties
      )

    // Return what we've got
    return completeProperties
  }

}

class EventAPI extends MIMApiBase {
  constructor(apiBranch, stateBranch, component) {
    super()
    this.apiBranch = apiBranch
    this.stateBranch = stateBranch
    this.component = component
    // console.log('TaskAPI.constructor(...): component:', component)
  }

  createProperties(requestedProperties = undefined) {

    // Task Template
    const defaultProperties = {
      "google_calendar_id": "",
      "title": "",
      "feasibility": 1.0,
      "start": "2000-01-00T01:00:00Z",
      "duration": "00:30:00"
    }

    // Merge requested properties into the Template
    const completeProperties =
      Object.assign(
        defaultProperties,
        requestedProperties
      )

    // Return what we've got
    return completeProperties
  }
}


class ActivityAPI extends MIMApiBase {
  constructor(apiBranch, stateBranch, component) {
    super()
    this.apiBranch = apiBranch
    this.stateBranch = stateBranch
    this.component = component
    // console.log('TaskAPI.constructor(...): component:', component)
  }

  createProperties(requestedProperties = undefined) {

    // Task Template
    const defaultProperties = {
      "feasibility": 1.0
    }

    // Merge requested properties into the Template
    const completeProperties =
      Object.assign(
        defaultProperties,
        requestedProperties
      )

    // Return what we've got
    return completeProperties
  }
}


class TimeRecordAPI extends MIMApiBase {
  constructor(apiBranch, stateBranch, component) {
    super()
    this.apiBranch = apiBranch
    this.stateBranch = stateBranch
    this.component = component
    // console.log('TaskAPI.constructor(...): component:', component)
  }

  createProperties(requestedProperties = undefined) {

    // Task Template
    const defaultProperties = {
      "duration": "00:10:00",
      "order": 1.0,
    }

    // Merge requested properties into the Template
    const completeProperties =
      Object.assign(
        defaultProperties,
        requestedProperties
      )

    // Return what we've got
    return completeProperties
  }

  /**
   * @param {'Params dict: {id:...}'} params - Time record params
   * @param {callBack} onSuccess function
   * @param {callBack} onFail function
   */
  put(params, onSuccess, onFail){

    onSuccess = onSuccess || (() => true)
    onFail = onFail || (() => true)


    // INIT

    let time

    // Unpack class and params variable
    const {apiBranch, stateBranch, component} = this
    const id = ('id' in params) ? String(params.id) : undefined
    const task = ('task' in params) ? String(params.task) : undefined
    const event = ('event' in params) ? String(params.event) : undefined

    const putOnCreateSuccess = obj => {
      this.pushToState(obj)
      onSuccess(obj)
    }

    const putOnUpdateSuccess = obj => {
      onSuccess(obj)
    }

    const putOnFail = obj => {
      onFail(onSuccess)
    }

    // PUT

    // console.log('Component state at the beginning of the PUT:',
    //   component.state[stateBranch])

    // Get the list of all the existing time records
    const tiRs = JSON.parse(JSON.stringify(component.state[stateBranch]))
    // Filter those records basing on the parameters passed
    let list = Object.keys(tiRs).map(id => tiRs[id])
    list = list.filter(ti =>
      (id ? String(ti.id) === id : true) &&
      (task ? String(ti.task) === task : true) &&
      (event ? String(ti.event) === event : true)
    )

    // console.log('The list is: ', list)

    // If what we've got one or more records
    if (list.length > 0){
      // Push param values into existing pulled task params
      const timeUpd = Object.assign(list[0], params)
      // if (id) console.log('id:', id)
      // if (task) console.log('task:', task)
      // if (event) console.log('event:', event)
      // if (params) console.log('params:', params)
      // if (timeOld) console.log('timeOld:', list[0])
      // console.log('Going to update with params:', timeUpd)

      this.pushToState(timeUpd)
      this.update(timeUpd, putOnUpdateSuccess, putOnFail)
    }

    // If there are no records
    else{
      // console.log('Going to create with params:', params)
      // If order value isn't passed and event is provided
      if (!('order' in params) && ('event' in params))
        if(params.event > 0)
          // Get the next available order value
          params['order'] = this.component.eventTimeRecordsNum(params.event) + 1
      // Run standard update
      this.create(params, putOnCreateSuccess, putOnFail)
    }
  }
}


class MIMApi {
  constructor(component) {

    this.component = component

    this.tasks = new TaskAPI(
      'tasks',
      'allTasks',
      component)

    this.events = new EventAPI(
      'events',
      'allEvents',
      component)

    this.activities = new ActivityAPI(
      'activities',
      'allActivities',
      component)

    this.timeRecords = new TimeRecordAPI(
      'time_records',
      'allTimeRecords',
      component)

    this.refreshAll = this.refreshAll.bind(this)

  }

  /**
   * @param {callBackSuccess} onSuccess -  to call after success fetch & setState
   */
  async refreshAll(onSuccess) {
    onSuccess = onSuccess || (() => true)

    let refreshed = {}
    let refreshId = Date.now()

    // Dictionary with all the pulled data
    const pushToStateDict = {}

    // Set status for each state branch
    refreshed[this.timeRecords.stateBranch] = false
    refreshed[this.tasks.stateBranch] = false
    refreshed[this.events.stateBranch] = false
    refreshed[this.activities.stateBranch] = false

    // Pull data from the API for each state branch
    this.timeRecords.getAll(
      data => tryToPushRefreshToState({
        'data': data,
        'refreshId': refreshId,
        'stateBranch': this.timeRecords.stateBranch,}))

    this.tasks.getAll(
      data => tryToPushRefreshToState({
        'data': data,
        'stateBranch': this.tasks.stateBranch,}))

    this.events.getAll(
      data => tryToPushRefreshToState({
        'data': data,
        'stateBranch': this.events.stateBranch,}))

    this.activities.getAll(
      data => tryToPushRefreshToState({
        'data': data,
        'stateBranch': this.activities.stateBranch,}))

    // When everything will be refreshed - this functions will call onSuccess
    // otherwise it just add each API branch data to pushToStateDict dictionary
    const tryToPushRefreshToState = (param) => {

      // Unpack param
      const {data, stateBranch} = param
      // Mark this particular branch data as pulled
      refreshed[stateBranch] = true
      // Save the data for the setState
      pushToStateDict[stateBranch] = data

      // If all branches data marked as pulled
      if ( refreshed[this.tasks.stateBranch]
        && refreshed[this.events.stateBranch]
        && refreshed[this.activities.stateBranch]
        && refreshed[this.timeRecords.stateBranch])
      {
        // Update the component state
        this.component.setState(pushToStateDict)

        onSuccess()
      }
    }


  }
}

export default MIMApi;
