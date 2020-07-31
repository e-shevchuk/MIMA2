import { allActivities, allEvents, allTasks, allTimeRecords }
  from "../App.test_data"

const mockFetch = (url, options) => {
  const urlTasks = 'https://mima.f15.dev/api/tasks/'
  const urlEvents = 'https://mima.f15.dev/api/events/'
  const urlActivities = 'https://mima.f15.dev/api/activities/'
  const urlTimeRecords = 'https://mima.f15.dev/api/time_records/'

  let fetchResponse
  const tasks = Object.keys(allTasks).map(id => allTasks[id])
  const events = Object.keys(allEvents).map(id => allEvents[id])
  const activities = Object.keys(allActivities).map(id => allActivities[id])
  const timeRecords = Object.keys(allTimeRecords).map(id => allTimeRecords[id])

  // // Get the max key value + 1
  // const maxKeyIncr = dict =>
  //   Object.keys(dict).reduce((a, b) => {
  //     Number(b) > Number(a) ? b : a
  //   })


  // GET

  if (options.method === 'GET') {

    if (url === urlTasks) {
      // Initial response from fetch promise
      fetchResponse = {
        ok: true,
        json: () => Promise.resolve({
          results: tasks,
          count: tasks.length
    })}}

    if (url === urlEvents) {
      // Initial response from fetch promise
      fetchResponse = {
        ok: true,
        json: () => Promise.resolve({
          results: events,
          count: events.length
    })}}

    if (url === urlActivities) {
      // Initial response from fetch promise
      fetchResponse = {
        ok: true,
        json: () => Promise.resolve({
          results: activities,
          count: activities.length
    })}}

    if (url === urlTimeRecords) {
      // Initial response from fetch promise
      fetchResponse = {
        ok: true,
        json: () => Promise.resolve({
          results: timeRecords,
          count: timeRecords.length
    })}}
  }

  // CREATE

  if (options.method === 'POST') {
    // Get the next maximum ID

    if (url === urlTasks) {
      const obj = JSON.parse(options.body)
      const id = Date.now()
      obj["id"] = id

      // Initial response from fetch promise
      fetchResponse = {
        ok: true,
        json: () => Promise.resolve(obj)}}

    if (url === urlEvents) {
      const obj = JSON.parse(options.body)
      const id = Date.now()
      obj["id"] = id

      // Initial response from fetch promise
      fetchResponse = {
        ok: true,
        json: () => Promise.resolve(obj)}}

    if (url === urlActivities) {
      const obj = JSON.parse(options.body)
      const id = Date.now()
      obj["id"] = id

      // Initial response from fetch promise
      fetchResponse = {
        ok: true,
        json: () => Promise.resolve(obj)}}

    if (url === urlTimeRecords) {
      const obj = JSON.parse(options.body)
      const id = Date.now()
      obj["id"] = id

      // Initial response from fetch promise
      fetchResponse = {
        ok: true,
        json: () => Promise.resolve(obj)}}

  }

  // UPDATE

  // console.log('Mock fetch() options:', options)
  // console.log('Mock fetch() url:', url)

  if (options.method === 'PUT') {
    // Get the next maximum ID

    if (RegExp(urlTasks).test(url)) {
      const obj = JSON.parse(options.body)

      // Initial response from fetch promise
      fetchResponse = {
        ok: true,
        json: () => Promise.resolve(obj)}}

    if (RegExp(urlEvents).test(url)) {
      const obj = JSON.parse(options.body)

      // Initial response from fetch promise
      fetchResponse = {
        ok: true,
        json: () => Promise.resolve(obj)}}

    if (RegExp(urlActivities).test(url)) {
      const obj = JSON.parse(options.body)

      // Initial response from fetch promise
      fetchResponse = {
        ok: true,
        json: () => Promise.resolve(obj)}}

    if (RegExp(urlTimeRecords).test(url)) {
      const obj = JSON.parse(options.body)

      // Initial response from fetch promise
      fetchResponse = {
        ok: true,
        json: () => Promise.resolve(obj)}}

  }


  return Promise.resolve(fetchResponse)
}

// GENERAL MOCK FETCH-ASYNC INIT/DE-INIT WRAPPER

/**
 * Wrap the parameter function f with try/catch and enable/disable fetch mock
 * @param {function} t test-function to call after all validations to end test
 * @param {function} f function with all validations to be called
 * @param {boolean} mf - to Mock Fetch or not to, that is the question
 */

export const asyncWrap = (t, f, mf) => {

  mf = mf || true

  if(mf){
    jest.spyOn(window, 'fetch').mockImplementation(mockFetch)
  }

  return fParams => {
    try {
      // Call the wrapped function
      f(fParams)

      // Disable the mockFetch if needed
      if (mf){
        window.fetch.mockRestore()
      }

      // Indicate that test is finished
      t()
    } catch (error) {

      // Disable the mockFetch if needed
      if (mf){
        window.fetch.mockRestore()
      }

      // Indicate that test is finished with error
      t(error)
    }
  }
}


export default mockFetch