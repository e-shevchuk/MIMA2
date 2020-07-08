import React, {Component} from "react";
import ContentEditable from 'react-contenteditable';
import Numeral from "numeral";
import TaskCheckboxComplete from './TaskCheckboxComplete';
import getCookie from "./service_functions";

class MIMApiBase {
  constructor() {
    this.csrftoken = getCookie('csrftoken');
    this.url = 'https://mima.f15.dev/api/';

    this.JSONFetch = this.JSONFetch.bind(this)
    this.createProperties = this.createProperties.bind(this)
  }

  async JSONFetch(method='', data = undefined){

    let id

    // INITIALIZATION & CHECKS

    if (method === '') {
      console.log("%cJSONQuery() FAILED: No method provided", 'color: red')
      return false
    }

    if (this.url === '') {
      console.log("%cJSONQuery() FAILED: API Branch provided", 'color: red')
      return false
    }

    // URL

    let url = this.url + this.apiBranch + "/"

    if (method === 'DELETE')
      id = String(data)

    if (method === 'PUT')
      id = data.id

    if (id !== undefined)
      url += id + '/'

    console.log(url)

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

    return await fetch(url, options)
  }

  async get(){
    let data

    // Make the base request
    let fetch_result = await this.JSONFetch('GET')

    // If it went well
    if (fetch_result.ok){
      // Get the Data
      data = await fetch_result.json()
    }
    // If request isn't OK - log it
    else console.log("%cget() FAILED: HTTP-Error", 'color: red')

    return await data
  }

  createProperties(){
    // If it is not defined on a Child level - throw error
    throw new Error("createProperties(...) is to be re-defined in a Child");
  }

  async create(params){
    let data
    const props = this.createProperties(params)

    // Make the base request
    let fetch_result = await this.JSONFetch('POST', props)

    // If it went well
    if (fetch_result.ok){
      // Get the Data
      data = await fetch_result.json()
    }
    // If request isn't OK - log it
    else console.log("%ccreate() FAILED: HTTP-Error", 'color: red')

    return await data
  }

  async update(params){

    let id
    let data

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
    if (fetch_result.ok){
      // Get the Data
      data = await fetch_result.json()
    }
    // If request isn't OK - log it
    else console.log("%cupdate() FAILED: HTTP-Error", 'color: red')

    return await data
  }

  async delete(params){
    let data
    let id = undefined

    // PULL THE ID FROM PARAMS

    // What if params is dictionary
    if (typeof(params) === 'object')
      if ('id' in params)
        id = params.id

    // What if params is number or stringed number
    if (typeof(params) === 'number' || typeof(params) === 'string')
      if (Number(params) !== NaN)
        id = Number(params)

    // If we did'n manage to pull the ID out - something is very wrong
    if (id === undefined)
      throw new Error("delete(...) No ID provided")

    // PERFORM THE REQUEST

    // Make the base request
    let fetch_result = await this.JSONFetch('DELETE', id)

    // If it went well
    if (fetch_result.ok){
      return true
    }
    // If not very
    else
      console.log("%cdelete() FAILED: HTTP-Error", 'color: red')

    return False
  }
}

class TaskAPI extends MIMApiBase {
  constructor(apiBranch) {
    super()
    this.apiBranch = apiBranch
  }

  createProperties(requestedProperties=undefined){

    // Task Template
    const defaultProperties = {
          "project_id": "",
          "title": "",
          "duration": "00:10:00",
          "complete": false,
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

class MIMApi{
  constructor() {
    this.Tasks = new TaskAPI('tasks')
  }
}

function sum(a, b) {
  return a + b;
}

export default MIMApi;
