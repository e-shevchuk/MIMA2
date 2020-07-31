import Schedule from "../Schedule";

export default class ScheduleManager {
  constructor(app, settings, api){

    // Initializations

    this.app = app
    this.settings = settings
    this.api = api
    this.schedCurr = new Schedule()
    this.schedUpd = new Schedule()

    // Binds

    this.pushToApp = this.pushToApp.bind(this)
    this.pushToDB = this.pushToDB.bind(this)
    this.applySchedule = this.applySchedule.bind(this)
  }

  // SETTERS & GETTERS

  // App
  set app(app)            {this._app = app}
  get app()               {return this._app}

  // Settings
  set settings(settings)  {this._settings = settings}
  get settings()          {return this._settings}

  // MIMA Api
  set api(api)            {this._api = api}
  get api()               {return this._api}

  // FUNCTIONS

  pushToApp(){
    return true
  }

  pushToDB(){
    return true
  }

  applySchedule(schedule){
    return true
  }
}