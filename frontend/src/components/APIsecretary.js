
class APIsecretary {
  constructor(delay = 3000) {

    // The time we will wait before running a query
    this.delay = delay;

    // Ongoing queries register
    this.register = {};
  }

  schedule(apiCall, id, apiCallProps) {
  /*
  It's like asking your secretary to bring a coffee. She will do it
  in a few minutes, but if somebody else will as for a coffee too,
  she will forget about you and bring the coffee to that another
  person with the same delay, if no one would as to... You got it.
  */

    // Get apiCall function name as string
    const apiCallName = apiCall.name.match(/[A-Za-z0-9]*$/)[0];

    // If there is no branch for current apiCall in the register - add it
    if (!(apiCallName in this.register)) this.register[apiCallName] = {};

    // Save this time moment to identify this instance of API Call request
    const now = Date.now();

    // Replace existing or add fresh record for this API call request
    this.register[apiCallName][id] = now;

    // Schedule this request to be implemented after this.delay seconds
    setTimeout(
      () => this.call(apiCall, id, apiCallProps, now),
      this.delay);

  }

  call(apiCall, id, apiCallProps, initTime=undefined) {

    // Get apiCall function name as string
    const apiCallName = apiCall.name.match(/[A-Za-z0-9]*$/)[0];

    // If it is modest request, which acts through register and initTime
    if (initTime !== undefined){

      // Register has no record for this apiCall
      if (!(apiCallName in this.register)){
        // Do nothing
        return;}

      // Register has record for the apiCall but not for this id
      else if (!(id in this.register[apiCallName])){
        // Do nothing
        return;}

      // Register has record for this apiCall and id but for an other request
      else if (initTime !== this.register[apiCallName][id]){
        // Do nothing
        return;}

      // Register completely match this request
      else{
        // Remove the record (before we implement the request)
        delete this.register[apiCallName][id];}
    }

    // Implementing the request
    apiCall(apiCallProps);
  }


}

export default APIsecretary;