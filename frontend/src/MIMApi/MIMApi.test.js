/**
 * @jest-environment jsdom
 */
require('whatwg-fetch')
import { shallow } from 'enzyme';

import App from "../components/App";
import mockFetch from "../Mocks";
import { asyncWrap } from "../Mocks";
import React from "react";


jest.mock("../components/App.css", () => {})
jest.spyOn(window, 'fetch').mockImplementation(mockFetch)

// Initializing app for testing
const appShallow = shallow(<App/>)
const app = appShallow.instance()

// ===========================        TESTS        =============================

test('At least one', () => {
  expect(true).toBeTruthy()
})

test('MIMA API: GET - each object type', async () => {

  // INITIALIZATION

  jest.spyOn(window, 'fetch').mockImplementation(mockFetch)

  let fetchData
  const api = app.api

  // TESTING

  // Activities
  fetchData = await api.activities.get()
  expect(fetchData.count).toBe(1)
  const activities = fetchData.results
  expect(activities[0].id).toBe(132)

  // Events
  fetchData = await api.events.get()
  expect(fetchData.count).toBe(2)
  const events = fetchData.results
  expect(events[0].id).toBe(1156)

  // Tasks
  fetchData = await api.tasks.get()
  expect(fetchData.count).toBe(4)
  const tasks = fetchData.results
  expect(tasks[0].id).toBe(498)

  // Time records
  fetchData = await api.timeRecs.get()
  expect(fetchData.count).toBe(5)
  const timeRecords = fetchData.results
  expect(timeRecords[1].id).toBe(1825)
  expect(timeRecords[1].task).toBe(499)

  // DE-INITIALIZATION

  // Disable mock fetch
  window.fetch.mockRestore()
})


// test('MIMA API: GET - getAll: Non Empty wrapped', done => {
//
//   // Call back on Success - all the validations
//   let validationsOnSuccess = asyncWrap (done, (data) => {
//     const titleToBe = '288 Redirect & all the sh*t'
//     expect(data[288].title).toBe(titleToBe)
//   })
//
//   // Test launch
//   appInstance.api.tasks.getAll(validationsOnSuccess)
// })
//
//
// test('MIMA API: refreshAll()', done => {
//
//   // Call back on Success - all the validations
//   let validationsOnSuccess = asyncWrap (done, () => {
//     expect(appInstance.state.allTimeRecords[1].id).toBe(1)
//     expect(appInstance.state.allTasks[288].id).toBe(288)
//     expect(appInstance.state.allEvents[109].id).toBe(109)
//     expect(appInstance.state.allActivities[96].id).toBe(96)
//   })
//
//   // Test launch
//   appInstance.api.refreshAll(validationsOnSuccess)
// })
//
//
// test('MIMA API JSONFetch() 01', async done => {
//
//   // INITIALIZATION
//
//   jest.spyOn(window, 'fetch').mockImplementation(mockFetch)
//
//   // TESTING
//
//   let fetchResult = await appInstance.api.timeRecords.JSONFetch(
//     'PUT',
//     { id: 12, task: 302, event: 115, duration: '00:21:01', order: 10 })
//
//   expect(fetchResult.ok).toBe(true)
//
//   // DE-INITIALIZATION
//
//   // Disable mock fetch
//   window.fetch.mockRestore()
//   done()
// })
//
// test('MIMA API update() 01', async done => {
//
//   // INITIALIZATION
//
//   jest.spyOn(window, 'fetch').mockImplementation(mockFetch)
//
//   // TESTING
//
//   let updateResult = await appInstance.api.timeRecords.update({
//     id: 12, task: 302, event: 115, duration: '00:21:01', order: 10
//   })
//
//   expect(updateResult.duration).toBe('00:21:01')
//
//   // DE-INITIALIZATION
//
//   // Disable mock fetch
//   window.fetch.mockRestore()
//   done()
// })
//
// test('MIMA API put() 01', async done => {
//
//   jest.spyOn(window, 'fetch').mockImplementation(mockFetch)
//
//   const validationsOnSuccess = t => {
//     expect(t.order).toBe(1.23)
//     window.fetch.mockRestore()
//     done()
//   }
//
//   const putData = { id: 10, order: 1.23 }
//
//   // Test launch
//   await appInstance.api.timeRecords.put(putData, validationsOnSuccess)
// })

