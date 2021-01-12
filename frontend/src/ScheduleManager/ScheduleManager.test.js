import ScheduleManager from "../ScheduleManager";
import testData001, {allActivities, allTimeRecords, allEvents, allTasks, allSettings}
  from './ScheduleManager.test.data'
import {stateUpdParams001} from "./ScheduleManager.test.data";

/**
 * @jest-environment jsdom
 */
require('whatwg-fetch')
import { shallow, mount } from 'enzyme';

import App from "../components/App";
import mockFetch, {mockFetchGetWithData} from "../Mocks";
import { asyncWrap } from "../Mocks";
import React from "react";
import {DAYTIMEFORMAT, flushPromises} from "../service_functions";
import moment from "moment";


jest.mock("../components/App.css", () => {})
jest.spyOn(window, 'fetch').mockImplementation(mockFetch)

// Initializing app for testing
const appShallow = shallow(<App/>)
const app = appShallow.instance()

// ================================== TESTS ====================================

// Object getters
function getScheduleGetters (s) {
  return {
    "tr": id => s.timeRecs.get(id),
    "t": id => s.tasks.get(id),
    "e": id => s.events.get(id),
    "a": id => s.activities.get(id),
  }
}

test('ScheduleManager.constructor() 0101', () => {
  const sm = new ScheduleManager(
    undefined, undefined, undefined)

  expect(sm).toBeInstanceOf(ScheduleManager)
})


test('ScheduleManager.initByDBdata() 0202', () => {
  const app = undefined
  const api = undefined

  // Schedule manager instance
  const sm = new ScheduleManager(app, api)

  // Database mock data
  const data = {
    "activities": allActivities,
    "events": allEvents,
    "timeRecs": allTimeRecords,
    "tasks": allTasks,
  }

  const msg = "ScheduleManager.initByDBdata(): missing keys: settings"
  try{
    sm.initByDBdata(data)
  } catch (e) {
    expect(e.message).toBe(msg)

  }
})


test('ScheduleManager.initByDBdata() 0203', () => {
  const app = undefined
  const api = undefined

  // Schedule manager instance
  const sm = new ScheduleManager(app, api)

  // Database mock data
  const data = {
    "settings": allSettings,
    "activities": allActivities,
    "events": allEvents,
    "timeRecs": allTimeRecords,
    "tasks": allTasks,
  }

  // Init
  sm.initByDBdata(data)

  // Validations

  // CURRENT SCHEDULE

  let {a, e, t, tr} = getScheduleGetters(sm.current)

  // Activity
  expect(a(301).refEvents).toContain(e(101))
  expect(a(301).refEvents).toContain(e(102))
  expect(a(301).refEvents).toContain(e(103))
  expect(a(301).refEvents.length).toBe(3)

  expect(e(101).refTime).toContain(tr(402))
  expect(e(101).refTime).toContain(tr(403))

  expect(e(102).refTime).toContain(tr(404))
  expect(e(102).refTimePinned).toContain(tr(405))
  expect(e(102).refTimePinned).toContain(tr(406))

  expect(t(201).refTime).toContain(tr(402))
  expect(t(202).refTime).toContain(tr(403))
  expect(t(202).refTime).toContain(tr(404))
  expect(t(203).refTime).toContain(tr(405))
  expect(t(204).refTime).toContain(tr(406))

  expect(sm.settings.min_dur.value).toBe("00:20:00")

  // UPDATE SCHEDULE

  const {a: au, e: eu, t: tu, tr: tru} = getScheduleGetters(sm.update)

  expect(au(301).refEvents).toContain(eu(101))
  expect(au(301).refEvents).toContain(eu(102))
  expect(au(301).refEvents).toContain(eu(103))
  expect(au(301).refEvents.length).toBe(3)
  expect(eu(101).refTime).toContain(tru(402))
  expect(eu(101).refTime).toContain(tru(403))
  expect(eu(102).refTime).toContain(tru(404))
  expect(eu(102).refTimePinned).toContain(tru(405))
  expect(eu(102).refTimePinned).toContain(tru(406))
  expect(tu(201).refTime).toContain(tru(402))
  expect(tu(202).refTime).toContain(tru(403))
  expect(tu(202).refTime).toContain(tru(404))
  expect(tu(203).refTime).toContain(tru(405))
  expect(tu(204).refTime).toContain(tru(406))

  expect(sm.settings.min_dur.value).toBe("00:20:00")

})

test('ScheduleManager.initialGetAll() 0304', async () => {

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

test('ScheduleManager.appState() 0405', async () => {

  // INITIALIZATION

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData001))

  // Initializing app for testing
  const appShallow = await shallow(<App/>)
  const app = await appShallow.instance()
  await flushPromises()

  // TESTING

  const as = app.scheduleManager.current.appState
  expect(JSON.stringify(as)).toBe(JSON.stringify(stateUpdParams001))


  // DE-INITIALIZATION

  // Disable mock fetch
  window.fetch.mockRestore()
})

test('ScheduleManager.updTaskTitle() 0506', async () => {

  // INITIALIZATION

  jest.spyOn(window, 'fetch').mockImplementation(mockFetch)

  // TESTING

  expect.assertions(6)

  // For non providing id
  try {
    await app.scheduleManager.updTaskTitle()
  } catch (e) {
    expect(e.message)
      .toBe('ScheduleManager.updTaskTitle(): '
                   + 'incorrect task idApp: undefined')
  }

  // For non-existent id
  try {
    await app.scheduleManager.updTaskTitle(12121212121)
  } catch (e) {
    expect(e.message)
      .toBe('ScheduleManager.updTaskTitle(): '
                   + 'non existent task idApp: 12121212121')
  }

  // For non providing title
  try {
    await app.scheduleManager.updTaskTitle(498)
  } catch (e) {
    expect(e.message)
      .toBe('ScheduleManager.updTaskTitle(): titleNew is not provided')
  }

  // For empty title
  try {
    await app.scheduleManager.updTaskTitle(498, '')
  } catch (e) {
    expect(e.message)
      .toBe('ScheduleManager.updTaskTitle(): titleNew is empty string')
  }

  // Changes apply success

  // Make changes
  await app.scheduleManager.updTaskTitle(498, 'Enjoy sound')
  // Get object id
  const id = app.scheduleManager.current.tasks.getByidApp(498).id

  // Check object value
  expect(app.scheduleManager.current.tasks.getByidApp(498).title)
    .toBe('Enjoy sound')

  // Check DB image value
  expect(app.scheduleManager.current.tasks.dataDB[id].title)
    .toBe('Enjoy sound')

  // DE-INITIALIZATION

  // Disable mock fetch
  window.fetch.mockRestore()
})


