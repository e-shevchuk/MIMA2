import {
  allTasks, allEvents, allActivities, allTimeRecords
} from '../App.test_data'

import React from 'react';
import { shallow } from 'enzyme';

jest.mock("../App.css", () => {})
import App from "../App";
import mockFetch from "../Mocks";
import { softTime, eventStartCompare } from "../App";

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

// ===========================        TESTS        =============================

test('Get the ordered list of Time records for Event', ()=>{

  const timeRecordsSorted = appInstance.timeRecordsByEvent(109)

  expect(timeRecordsSorted[0].id).toBe(3)
  expect(timeRecordsSorted[1].id).toBe(4)
  expect(timeRecordsSorted[2].id).toBe(1)
  expect(timeRecordsSorted[3].id).toBe(2)
  expect(timeRecordsSorted.length).toBe(4)

})


test('Get the ordered list of Time records for the empty Event', ()=>{

  const timeRecordsSorted = appInstance.timeRecordsByEvent(110)

  expect(timeRecordsSorted).toMatchObject([])
  expect(timeRecordsSorted.length).toBe(0)

})

test('softTime()', () => {

  let test

  test = {a: '01:00:00', d: '00:20:00', m: '00:20:00', t: '00:20:00'}
  expect(softTime(test.a, test.d, test.m)).toBe(test.t)

  test = {a: '00:20:00', d: '00:20:00', m: '00:20:00', t: '00:20:00'}
  expect(softTime(test.a, test.d, test.m)).toBe(test.t)

  test = {a: '00:10:00', d: '00:20:00', m: '00:20:00', t: '00:00:00'}
  expect(softTime(test.a, test.d, test.m)).toBe(test.t)

  test = {a: '00:10:00', d: '00:20:00', m: '00:10:00', t: '00:10:00'}
  expect(softTime(test.a, test.d, test.m)).toBe(test.t)

  test = {a: '00:20:00', d: '00:30:00', m: '00:20:00', t: '00:00:00'}
  expect(softTime(test.a, test.d, test.m)).toBe(test.t)

  test = {a: '00:20:00', d: '00:40:00', m: '00:20:00', t: '00:20:00'}
  expect(softTime(test.a, test.d, test.m)).toBe(test.t)

  test = {a: '01:00:00', d: '01:10:00', m: '00:20:00', t: '00:50:00'}
  expect(softTime(test.a, test.d, test.m)).toBe(test.t)

  test = {a: '01:00:00', d: '00:00:00', m: '00:20:00', t: '00:00:00'}
  expect(softTime(test.a, test.d, test.m)).toBe(test.t)

})


test('eventTimeAvailable() 01', () => {

  // Function shortcut
  const f = appInstance.eventTimeAvailable

  expect(f(112)).toBe('00:30:00')
  expect(f(113)).toBe('00:24:00')
  expect(f(114)).toBe('00:24:00')
  expect(f(115)).toBe('00:00:00')
  expect(f(116)).toBe('00:54:00')
  expect(f(117)).toBe('00:14:00')

  expect(f(112, true)).toBe('00:30:00')
  expect(f(113, true)).toBe('00:30:00')
  expect(f(114, true)).toBe('00:25:00')
  expect(f(115, true)).toBe('00:05:00')
  expect(f(116, true)).toBe('00:54:00')
  expect(f(117, true)).toBe('00:24:00')

})

test('eventTimeAvailable() 02', () => {

  // Function shortcut
  const f = appInstance.eventTimeAvailable

  expect(f(120)).toBe('01:00:00')
  expect(f(120, true)).toBe('01:00:00')
})


test('Mock fetch - overall', async () => {
  // Turn mock fetch on
  jest.spyOn(window, 'fetch').mockImplementation(mockFetch)

  const fetchResult = await fetch('https://mima.f15.dev/api/tasks/', {method: 'GET'})
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

test('eventTimeRecordsNumber() 01', () => {
  const f = appInstance.eventTimeRecordsNum

  expect(f(112, true)).toBe(0)
  expect(f(109, true)).toBe(4)
})

test('fixTimeRecordsOrder()', async done => {
  // Turn mock fetch on
  jest.spyOn(window, 'fetch').mockImplementation(mockFetch)

  await appInstance.fixTimeRecordsOrder(115)
  expect(appInstance.state.allTimeRecords[9].order).toBe(0)
  expect(appInstance.state.allTimeRecords[10].order).toBe(1)
  expect(appInstance.state.allTimeRecords[11].order).toBe(2)
  expect(appInstance.state.allTimeRecords[12].order).toBe(3)

  // Turn mock fetch off
  window.fetch.mockRestore()
  done()
})

test('tasksByEventId() 01', () => {
  let eventId, tasks

  eventId = 108
  tasks = appInstance.tasksByEventId(eventId)
  expect(tasks).toMatchObject([])
})

test('tasksByEventId() 02', () => {
  let eventId, tasks

  eventId = 109
  tasks = appInstance.tasksByEventId(eventId)
  expect(tasks).toContain(288)
  expect(tasks).toContain(289)
  expect(tasks).toContain(290)
  expect(tasks).toContain(293)
})

