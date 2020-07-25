import {
  allTasks, allEvents, allActivities, allTimeRecords
} from '../App.test_data'

import React from 'react';
import { shallow } from 'enzyme';

jest.mock("../App.css", () => {})
import App from "../App";
import mockFetch, {asyncWrap} from "../Mocks";

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

test('A least one', ()=>{
  expect(true).toBe(true)
})

test('app.taskCreate() & taskUpdate() 01', done => {
  let t01Data, t02Data
  let t01FromState, t02FromState, ti01FromState, ti02FromState

  let onPhase02Success, onPhase01Success
  const {allEvents} = appInstance.state
  const {eventTimeAvailable, tasksByEventId, taskUpdate, eventTimeRecordsNum,
    taskCreate} = appInstance

  t01Data = {'title': 'The T01', 'event_id': 126, duration: '02:00:00', 'order': 2}
  t02Data = {'title': 'The T02', 'event_id': 127, duration: '01:29:00'}

  // expect.assertions(14)

  expect(allEvents[126].duration).toBe('02:00:00')
  expect(allEvents[127].duration).toBe('01:00:00')
  expect(eventTimeAvailable(126)).toBe('02:00:00')
  expect(eventTimeAvailable(127)).toBe('01:00:00')
  expect(tasksByEventId(126)).toMatchObject([])
  expect(tasksByEventId(127)).toMatchObject([])

  // TESTS

  // Phase 01

  // Create task 01
  taskCreate(t01Data, data => {
    // Task & time record 01 validations
    t01FromState = appInstance.state.allTasks[data.task.id]
    ti01FromState = appInstance.state.allTimeRecords[data.time.id]
    expect(t01FromState.duration).toBe('02:00:00')
    expect(ti01FromState.duration).toBe('02:00:00')

    // Create task 02
    taskCreate(t02Data, data => {
      // Task & time record 02 validations
      t02FromState = appInstance.state.allTasks[data.task.id]
      ti02FromState = appInstance.state.allTimeRecords[data.time.id]
      expect(t02FromState.duration).toBe('01:29:00')
      expect(ti02FromState.duration).toBe('01:29:00')

      // Move task 02 to the event of task 01 (eventID: 126)
      taskUpdate({id: data.task.id, event_id: 126}, true, data => {
        const {task, timeRecords} = data
        // Task & time record 02 validations
        t02FromState = appInstance.state.allTasks[task.id]
        expect(t02FromState.duration).toBe('01:29:00')
        expect(tasksByEventId(127)).toContain(t02FromState.id)

        // Pint task 02 and repeat previous step to the event of task 01 (eventID: 126)
        taskUpdate({
            id: data.task.id,
            event_id: 126,
            pinned: true},
          true,
          data => {
            // console.log('app.taskCreate() & taskUpdate() 01: data:', data)
            // console.log('app.taskCreate() 01: allTimeRecords:', appInstance.state.allTimeRecords)
            const {task, time} = data
            // Task & time record 02 validations
            t02FromState = appInstance.state.allTasks[task.id]
            // console.log(appInstance.state.allTimeRecords)
            // console.log(appInstance.state.allTasks)
            expect(t02FromState.duration).toBe('01:29:00')
            expect(tasksByEventId(126)).toContain(t02FromState.id)
            expect(tasksByEventId(126)).toContain(t01FromState.id)
            expect(tasksByEventId(127)).toContain(t01FromState.id)
            expect(eventTimeRecordsNum(126)).toBe(2)
            expect(eventTimeRecordsNum(127)).toBe(1)

            done()
        })
      })
    })
  })

  // TODO: Make sure UPDATE don't call api if there is now change in data
})