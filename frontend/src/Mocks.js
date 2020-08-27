import testData002 from "./Mocks/Mocks.test.data";
import {dictValidateKeys} from "./service_functions";

export function mockFetchGetWithData(mockData){
  const msg = 'mockFetchGetWithData(): '

  const keys = ['activities', 'events', 'tasks', 'timeRecs', 'settings']

  dictValidateKeys(mockData, keys, msg)
  const { activities, events, tasks, timeRecs, settings } = mockData

  const mockFetch = (url, options) => {

    const urlTasks = 'https://mima.f15.dev/api/tasks/'
    const urlEvents = 'https://mima.f15.dev/api/events/'
    const urlActivities = 'https://mima.f15.dev/api/activities/'
    const urlTimeRecords = 'https://mima.f15.dev/api/time_records/'
    const urlSettings = 'https://mima.f15.dev/api/settings/'

    let fetchResponse

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
            results: timeRecs,
            count: timeRecs.length
      })}}

      if (url === urlSettings) {
        // Initial response from fetch promise
        fetchResponse = {
          ok: true,
          json: () => Promise.resolve({
            results: settings,
            count: settings.length
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

      if (url === urlSettings) {
        const obj = JSON.parse(options.body)
        const id = Date.now()
        obj["id"] = id

        // Initial response from fetch promise
        fetchResponse = {
          ok: true,
          json: () => Promise.resolve(obj)}}

    }

    // UPDATE

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

      if (RegExp(urlSettings).test(url)) {
        const obj = JSON.parse(options.body)

        // Initial response from fetch promise
        fetchResponse = {
          ok: true,
          json: () => Promise.resolve(obj)}}

    }


    return Promise.resolve(fetchResponse)
  }

  return mockFetch
}

const mockFetch = mockFetchGetWithData(testData002)

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