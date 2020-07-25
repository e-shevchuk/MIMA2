import {
  allTasks, allEvents, allActivities, allTimeRecords
} from '../App.test_data'

import React from 'react';
import { shallow } from 'enzyme';

jest.mock("../App.css", () => {})
import App from "../App";
import mockFetch, {asyncWrap} from "../Mocks";

// SERVICE FUNCTIONS

// Get the last added id from the component state branch
const lastID = sb => {
  return Object.keys(sb)[Object.keys(sb).length-1]
}

// THE APP INSTANCE

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


test('redistribute() 01', done => {

  // INITIALIZATION

  // Unpack functions
  const{ redistribute, getTask, getEvent, eventTimeAvailable } = appInstance
  const allTimeRecords = appInstance.state.allTimeRecords
  let timeRecordsLastID = undefined

  // CALL-BACKED CHECKS

  expect.assertions(4)

  // Check 01
  let validationsOnSuccessStep01 = () => {

    // Check the available the available time after run
    expect(eventTimeAvailable(118)).toBe('00:40:00')
    // Memorize the last ID to make sure there are no new time records
    // if we run redistribute twice
    timeRecordsLastID = lastID(allTimeRecords)

    // Run redistribute second time with Check 02 afterwards
    redistribute(events, tasks, validationsOnSuccessStep02)
  }

  // Check 02
  let validationsOnSuccessStep02 = asyncWrap (done, () => {
    // Check the available the available time after run
    expect(eventTimeAvailable(118)).toBe('00:40:00')

    // Check that no new records were created
    expect(timeRecordsLastID).toBe(lastID(allTimeRecords))
  })

  const events = [getEvent(118),]
  const tasks = [getTask(311), getTask(312), getTask(313),]

  // Preliminary check
  expect(eventTimeAvailable(118)).toBe('02:20:00')

  // TEST LAUNCH

  redistribute(events, tasks, validationsOnSuccessStep01)
})


test('redistribute() 02', done => {

  // INITIALIZATION

  // Unpack functions
  const{ redistribute, getTask, getEvent, eventTimeAvailable } = appInstance
  let timeRecordsLastID = undefined, lastAddedDuration = undefined

  // CALL-BACKED CHECKS

  expect.assertions(11)

  // Check 01
  let validationsOnSuccessStep01 = () => {

    // Check the available the available time after run
    expect(eventTimeAvailable(119)).toBe('00:00:00')
    expect(eventTimeAvailable(120)).toBe('00:00:00')
    // Memorize the last ID to make sure there are no new time records
    // if we run redistribute twice
    timeRecordsLastID = lastID(appInstance.state.allTimeRecords)

    // Run redistribute second time with Check 02 afterwards
    redistribute(events, tasks, validationsOnSuccessStep02)
  }

  // Check 02
  let validationsOnSuccessStep02 = asyncWrap (done, () => {
    const { allTimeRecords } = appInstance.state

    // Check the available the available time after run
    expect(eventTimeAvailable(119)).toBe('00:00:00')
    expect(eventTimeAvailable(120)).toBe('00:00:00')

    // Check that no new records were created
    expect(timeRecordsLastID).toBe(lastID(allTimeRecords))
    timeRecordsLastID = lastID(allTimeRecords)
    lastAddedDuration = allTimeRecords[timeRecordsLastID].duration
    expect(lastAddedDuration).toBe('02:10:00')
    expect(appInstance.timeRecordsByTask(315).length).toBe(2)
  })

  const events = [getEvent(119),getEvent(120),]
  const tasks = [getTask(314), getTask(315)]

  // Preliminary checks

  expect(eventTimeAvailable(119)).toBe('01:10:00')
  expect(eventTimeAvailable(120)).toBe('01:00:00')

  expect(allTasks[314].duration).toBe('00:50:00')
  expect(allTasks[315].duration).toBe('02:30:00')

  // TEST LAUNCH

  redistribute(events, tasks, validationsOnSuccessStep01)
})

test('redistribute() 03', done => {

  // INITIALIZATION

  // Unpack functions
  const{ redistribute, getTask, getEvent, eventTimeAvailable } = appInstance
  const { allTimeRecords, allTasks, allEvents} = appInstance.state
  let timeRecordsLastID = undefined, lastAddedDuration = undefined

  // CALL-BACKED CHECKS

  expect.assertions(8)

  // Check 01
  let validationsOnSuccessStep01 = () => {

    // Check the available the available time after run
    expect(eventTimeAvailable(121)).toBe('00:10:00')
    expect(eventTimeAvailable(122)).toBe('00:20:00')
    // Memorize the last ID to make sure there are no new time records
    // if we run redistribute twice
    timeRecordsLastID = lastID(allTimeRecords)

    // Run redistribute second time with Check 02 afterwards
    redistribute(events, tasks, validationsOnSuccessStep02)
  }

  // Check 02
  let validationsOnSuccessStep02 = asyncWrap (done, () => {

    // Check the available the available time after run
    expect(eventTimeAvailable(121)).toBe('00:10:00')
    expect(eventTimeAvailable(122)).toBe('00:20:00')

    // Check that no new records were created
    expect(timeRecordsLastID).toBe(lastID(allTimeRecords))
  })

  const events = [getEvent(121),getEvent(122),]
  const tasks = [getTask(316)]

  // Preliminary checks

  expect(eventTimeAvailable(121)).toBe('00:40:00')
  expect(eventTimeAvailable(122)).toBe('00:40:00')

  expect(allTasks[316].duration).toBe('00:50:00')

  // TEST LAUNCH

  redistribute(events, tasks, validationsOnSuccessStep01)
})


test('redistribute() 04', done => {

  // INITIALIZATION

  // Unpack functions
  const{ redistribute, getTask, getEvent, eventTimeAvailable } = appInstance
  const { allTimeRecords, allTasks, allEvents} = appInstance.state
  let timeRecordsLastID = undefined, lastAddedDuration = undefined

  // CALL-BACKED CHECKS

  expect.assertions(11)

  // Check 01
  let validationsOnSuccessStep01 = () => {

    // Check the available the available time after run
    expect(eventTimeAvailable(123)).toBe('00:20:00')
    expect(eventTimeAvailable(124)).toBe('01:00:00')
    expect(eventTimeAvailable(125)).toBe('00:50:00')
    // Memorize the last ID to make sure there are no new time records
    // if we run redistribute twice
    timeRecordsLastID = lastID(allTimeRecords)

    // Run redistribute second time with Check 02 afterwards
    redistribute(events, tasks, validationsOnSuccessStep02)
  }

  // Check 02
  let validationsOnSuccessStep02 = asyncWrap (done, () => {

    // Check the available the available time after run
    expect(eventTimeAvailable(123)).toBe('00:20:00')
    expect(eventTimeAvailable(124)).toBe('01:00:00')
    expect(eventTimeAvailable(125)).toBe('00:50:00')

    // Check that no new records were created
    expect(timeRecordsLastID).toBe(lastID(allTimeRecords))
  })

  const events = [getEvent(123),getEvent(124),getEvent(125),]
  const tasks = [getTask(317)]

  // Preliminary checks

  expect(eventTimeAvailable(123)).toBe('00:40:00')
  expect(eventTimeAvailable(124)).toBe('01:00:00')
  expect(eventTimeAvailable(125)).toBe('00:50:00')

  expect(allTasks[317].duration).toBe('00:20:00')

  // TEST LAUNCH

  redistribute(events, tasks, validationsOnSuccessStep01)

})

test('activityRedistribute() 01', done => {

  // INITIALIZATION

  // Unpack functions
  const{ activityRedistribute, eventTimeAvailable } = appInstance
  const { allActivities, allTasks, allTimeRecords,
    allEvents } = appInstance.state

  // CALL-BACKED CHECKS

  // expect.assertions(8)

  // Check 01
  let validationsOnSuccessStep01 = asyncWrap (done, () => {

    // Check the available the available time after run
    expect(eventTimeAvailable(126)).toBe('00:20:00')
  })

  // Preliminary checks
  expect(allActivities[97].title).toBe('Amazing Activity')

  expect(eventTimeAvailable(126)).toBe('02:00:00')
  expect(eventTimeAvailable(127)).toBe('01:00:00')

  expect(allTasks[318].duration).toBe('01:40:00')

  // TODO: Add pinned task and this one is to be partly pushed to next event

  // TEST LAUNCH

  // TODO: Complete the test with activityRedistribute(...) run
  done()
//  activityRedistribute(123, validationsOnSuccessStep01)
})

