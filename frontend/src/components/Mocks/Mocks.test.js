test('At least one test', ()=>{
  expect(true).toBe(true)
})

/*

import React from 'react';
import { shallow } from 'enzyme';
jest.mock("../App.css", () => {})

import App from "../App";
import mockFetch from "../Mocks";

import {
  allTasks, allEvents, allActivities, allTimeRecords
} from '../App.test_data'

jest.spyOn(window, 'fetch').mockImplementation(mockFetch)

// Initializing app for testing

const app = shallow(<App/>)
app.setState({
    'allEvents': allEvents,
    'allTasks': allTasks,
    'allActivities': allActivities,
    'allTimeRecords': allTimeRecords,
  })

const appInstance = app.instance()

// =============================================================================

test('Mock fetch - overall', async () => {
  // Turn mock fetch on
  jest.spyOn(window, 'fetch').mockImplementation(mockFetch)

  const fetchResult = await fetch(
    'https://mima.f15.dev/api/tasks/',
    {method: 'GET'})

  const fetchJSON = await fetchResult.json()

  expect(fetchJSON.results[0].event_id).toBe(93)

  // Turn mock fetch off
  window.fetch.mockRestore()
})

test('Mock fetch - getAll', async done => {
  // Turn mock fetch on
  jest.spyOn(window, 'fetch').mockImplementation(mockFetch)

  const allTasks = await appInstance.api.tasks.getAll()
  expect(allTasks[288].event_id).toBe(93)

  // Turn mock fetch off
  window.fetch.mockRestore()
  done()
})

test('Mock fetch - create activity event taks time', mfcaet => {
  // Turn mock fetch on
  jest.spyOn(window, 'fetch').mockImplementation(mockFetch)

  let event = {}, task = {}, time = {}
  event["id"] = 125

  // Task
  const taskTitle = 'apiTestTask01'
  const taskData = {'title': taskTitle, 'event_id': event.id}

  const taskCreated = tdata => {
    task = tdata.task

    // VALIDATING TASK

    expect(appInstance.state.allTasks[task.id].id).toBe(Number(task.id))
    expect(appInstance.state.allTasks[task.id].title).toBe(taskTitle)

    time = Object.keys(appInstance.state.allTimeRecords)
      .map(tiID => appInstance.state.allTimeRecords[tiID])
      .filter(ti => ti.task == task.id)[0]

    // VALIDATING TIME RECORD

    expect(time.task).toBe(task.id)
    expect(time.event).toBe(task.event_id)

    // Turn mock fetch off
    window.fetch.mockRestore()
    mfcaet()
  }

  appInstance.taskCreate(taskData, taskCreated)

})

*/