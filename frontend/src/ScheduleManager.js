import Schedule from "./Schedule";
import {dictValidateKeys} from "./service_functions";
import Activity from "./Activity";
import Event from "./Event";
import TimeRec from "./TimeRec";
import Task from "./Task";

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

  pushToApp(){
    return true
  }
  applyUpdate(){
    return true
  }
}