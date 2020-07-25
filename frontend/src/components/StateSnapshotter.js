
class StateSnapshotter {
  constructor(component) {

    this.component = component
    this.stateArchive = JSON.parse(JSON.stringify(component.state))

    this.save = this.save.bind(this)
    this.rollback = this.rollback.bind(this)
    this.wrapToList = this.wrapToList.bind(this)
  }

  wrapToList(a){

    // If it is a list or a dictionary
    if (typeof(a) === 'object'){

      // If this an array
      if (Array.isArray(a)){
          return a

      // If this is dictionary
      } else {
        // Wrap it to be an array
        return [a]
      }

    // If it is a string
    } else if (typeof (a) === 'string'){
      // And it it non-empty string
      if(a.length > 0){
        // Wrap it into a list
        return [a]
      }
    }

    // Otherwise return empty list
    return []
  }

  save(partsToSave){

    // INITIALIZATION

    let branchName, branch, id, element

    // Transform parameters into an Array
    let partsList = this.wrapToList(partsToSave)

    // SAVING DATA

    // Go through each list element
    partsList.map(part => {

      // If it is a String
      if (typeof(part) === 'string')
      {
        // Get the branch name
        branchName = part

        // If current state don't has such a branch - throw an error
        if(!(branchName in this.component.state))
          throw new Error("StateSnapshotter.save(): non-existing branch given")

        // Pull the branch to be saved
        branch = JSON.parse(JSON.stringify(this.component.state[branchName]))

        // Save the specified branch
        this.stateArchive[branchName] = branch
      }

      // If it is an object it should be a dict
      if (typeof(part) === 'object'){

        // Get the element branch
        branchName = Object.keys(part)[0]
        // Get the element ID
        id = part[branchName]

        // If current state don't has such a branch - throw an error
        if(!(branchName in this.component.state)){
          throw new Error("StateSnapshotter.save(): non-existing branch given")
        }
        // If current state don't have such an element - throw an error
        else if(!(id in this.component.state[branchName])) {
          throw new Error("StateSnapshotter.save(): non-existing element given")
        }

        // Pull element data
        element =
          JSON.parse(JSON.stringify(this.component.state[branchName][id]))


        // If there is no such branch in Archive
        if (!(branchName in this.stateArchive))
          // Create it
          this.stateArchive[branchName] = {}
        // Save the requested element of the requested branch into Archive
        this.stateArchive[branchName][id] = element
      }

    })

    // Create and return the rollback to this values function
    return (() => {this.rollback(partsList)})

  }

  rollback(partsList){

    // Make a fresh copy of current state
    const stateFresh = JSON.parse(JSON.stringify(this.component.state))

    const statePatch = {}

    // LOADING DATA

    // Go through each list element
    partsList.map(part => {
      // If it is a String
      if (typeof(part) === 'string')
      {
        // Get the branch name
        const branchName = part

        // Pull the branch data from the archive
        const branch = JSON.parse(JSON.stringify(
          this.stateArchive[branchName]))

        // Save the specified branch
        statePatch[branchName] = branch
      }

      // If it is an object it should be a dict
      if (typeof(part) === 'object'){

        // Get the branch name
        const branchName = Object.keys(part)[0]
        // Get the element ID
        const id = part[branchName]

        // If Fresh state don't have this branch
        if (!(branchName in stateFresh))
          // Create it
          stateFresh[branchName] = {}

        // If Patch don't have such a state
        if (!(branchName in statePatch))
          // Create it from Fresh data
          statePatch[branchName] =
            JSON.parse(JSON.stringify(stateFresh[branchName]))

        // Update the new branch in patch with element data from archive
        statePatch[branchName][id] =
          JSON.parse(JSON.stringify(this.stateArchive[branchName][id]))
      }

      this.component.setState(statePatch)
    })

  }
}

export default StateSnapshotter