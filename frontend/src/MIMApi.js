import React from "react";
import getCookie from "./service_functions";
import 'whatwg-fetch'

class MIMApiBase {
  constructor() {
    this.csrftoken = getCookie('csrftoken');
    this.url = 'https://mima.f15.dev/api/';

    this.JSONFetch = this.JSONFetch.bind(this)
    this.createProperties = this.createProperties.bind(this)
    this.getTemporary = this.getTemporary.bind(this)
    this.getAll = this.getAll.bind(this)
  }

  async JSONFetch(method = '', data = undefined) {
    const msg = 'MIMApiBase.JSONFetch(): '

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

    let fetchResult = await fetch(url, options)

    console.log(msg, 'url:', url, 'options', options, 'fetchResult:', fetchResult)
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
    const msg = 'MIMApiBase.getAll(): '
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
    const msg = 'MIMApiBase.create(): '

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

    return data
  }

  /**
   * @param {id} param Whole object or its id
   * @param {callBack} onSuccess function
   * @param {callBack} onFail function
   */
  async delete(param, onSuccess, onFail) {

    console.log('delete() param:', param)

    onSuccess = onSuccess || undefined
    onFail = onFail || undefined

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

  getTemporary(requestedProperties = undefined) {
    const element = this.createProperties(requestedProperties)
    element['id'] = Date.now()
    return element
  }

}

class TaskAPI extends MIMApiBase {
  constructor(apiBranch, component) {
    super()
    this.apiBranch = apiBranch
    this.component = component
  }

  createProperties(requestedProperties = undefined) {

    // Task Template
    const defaultProperties = {
      "title": "",
      "duration": "00:10:00",
      "complete": false,
      "pinned": false,
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
  constructor(apiBranch, component) {
    super()
    this.apiBranch = apiBranch
    this.component = component
  }

  createProperties(requestedProperties = undefined) {

    // Event Template
    const defaultProperties = {
      "google_calendar_id": "",
      "title": "",
      "duration": "00:30:00",
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
  constructor(apiBranch, component) {
    super()
    this.apiBranch = apiBranch
    this.component = component
  }

  createProperties(requestedProperties = undefined) {

    // Activity Template
    const defaultProperties = {}

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
  constructor(apiBranch, component) {
    super()
    this.apiBranch = apiBranch
    this.component = component
    // console.log('TaskAPI.constructor(...): component:', component)
  }

  createProperties(requestedProperties = undefined) {

    // Time Record Template
    const defaultProperties = {
      "duration": "00:10:00",
      "complete": false,
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

class SettingsAPI extends MIMApiBase {
  constructor(apiBranch, component) {
    super()
    this.apiBranch = apiBranch
    this.component = component
  }

  createProperties(requestedProperties = undefined) {

    // Event Template
    const defaultProperties = {
      "code": "",
      "title": "",
      "value": "",
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



class MIMApi {
  constructor(component) {

    this.component = component

    this.tasks = new TaskAPI('tasks', component)
    this.events = new EventAPI('events', component)
    this.activities = new ActivityAPI( 'activities', component)
    this.timeRecs = new TimeRecordAPI('time_records', component)
    this.settings = new SettingsAPI('settings', component)
  }

  async getAll(){

    const [activities, events, time, tasks, settings]
      = await Promise.all([
        this.activities.getAll(),
        this.events.getAll(),
        this.timeRecs.getAll(),
        this.tasks.getAll(),
        this.settings.getAll(),
      ])

    const data = {
      "events": events,
      "activities": activities,
      "tasks": tasks,
      "timeRecs": time,
      "settings": settings
    }

    return data
  }



}

export default MIMApi;
