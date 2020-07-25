import React from 'react'
import {cleanup, fireEvent, render} from "@testing-library/react";
import {expect} from "@jest/globals";
import StateSnapshotter from "./StateSnapshotter";

const allEvents = {"109":{"id":109,"activity_id":96,"google_calendar_id":"_6cok8chl6ss32b9k64p3eb9k74q3aba16d0k8ba668skagi4751j0di58o","title":"MIMA Dev","feasibility":1,"start":"2020-07-06T06:00:00Z","duration":"11:00:00"},"110":{"id":110,"activity_id":96,"google_calendar_id":"_8l1j8dpn8kskab9n6ork8b9k70q4ab9o6h1j4b9n750jcdhn84r44c1h6o","title":"MIMA Dev","feasibility":1,"start":"2020-07-09T06:00:00Z","duration":"11:00:00"},"111":{"id":111,"activity_id":96,"google_calendar_id":"_6gpjgd9k8grk6b9g8or4cb9k6t346ba26sr34ba164pk6e1j60rj0cpl6s","title":"MIMA Dev","feasibility":1,"start":"2020-07-08T14:00:00Z","duration":"03:00:00"}}
const allTasks = {"292":{"id":292,"event_id":93,"project_id":null,"title":"Redirect unlogged users to Google Auth","duration":"02:00:00","complete":false,"order":2,"active":true},"293":{"id":293,"event_id":93,"project_id":null,"title":"Add Projects functionality","duration":"02:00:00","complete":false,"order":1,"active":true},"294":{"id":294,"event_id":93,"project_id":null,"title":"New tasks multiple multiline creation","duration":"02:00:00","complete":false,"order":0,"active":true}}

class fakeComponent {
  constructor(params) {
    const {allEvents, allTasks} = params

    this.state = {
      'allEvents': allEvents,
      'allTasks': allTasks
    }

    this.setState = this.setState.bind(this)
  }

  setState(patch){
    Object.keys(patch).map(k => {
      this.state[k] = patch[k]
    })
  }
}

test("StateSnapshotter.wrapToList()", () => {

  // INITIALIZATION

  let list

  // Creating the fake component
  const fc = new fakeComponent({
    'allEvents': allEvents,
    'allTasks': allTasks
  })

  // Create Archive
  const fcArchive = new StateSnapshotter(fc)

  // CHECKS

  // Empty sting
  list = ""
  expect(typeof(fcArchive.wrapToList(list))).toBe('object')
  expect(fcArchive.wrapToList(list).length).toBe(0)

  // Non Empty sting
  list = "allTasks"
  expect(typeof(fcArchive.wrapToList(list))).toBe('object')
  expect(fcArchive.wrapToList(list).length).toBe(1)

  // Empty array
  list = []
  expect(Array.isArray(fcArchive.wrapToList(list))).toBeTruthy()
  expect(fcArchive.wrapToList(list).length).toBe(0)

  // Non-empty array
  list = ['allTasks']
  expect(Array.isArray(fcArchive.wrapToList(list))).toBeTruthy()
  expect(fcArchive.wrapToList(list).length).toBe(1)
  expect(fcArchive.wrapToList(list)).toContain('allTasks')

  // Non-empty array with two strings
  list = ['allTasks', 'allEvents']
  expect(Array.isArray(fcArchive.wrapToList(list))).toBeTruthy()
  expect(fcArchive.wrapToList(list).length).toBe(2)
  expect(fcArchive.wrapToList(list)).toContain('allTasks')
  expect(fcArchive.wrapToList(list)).toContain('allEvents')
  expect(fcArchive.wrapToList(list)[0]).toBe('allTasks')
  expect(fcArchive.wrapToList(list)[1]).toBe('allEvents')

  // Non-empty array with the dictionary
  list = [{'allTasks': 292}]
  expect(Array.isArray(fcArchive.wrapToList(list))).toBeTruthy()
  expect(fcArchive.wrapToList(list).length).toBe(1)
  expect(fcArchive.wrapToList(list)).toContainEqual({'allTasks': 292})
  expect(fcArchive.wrapToList(list)[0]).toStrictEqual({'allTasks': 292})
  expect(fcArchive.wrapToList(list)[0].allTasks).toBe(292)

  // Non-empty array with the dictionary
  list = {'allTasks': 292}
  expect(Array.isArray(fcArchive.wrapToList(list))).toBeTruthy()
  expect(fcArchive.wrapToList(list).length).toBe(1)
  expect(fcArchive.wrapToList(list)).toContainEqual({'allTasks': 292})
  expect(fcArchive.wrapToList(list)[0]).toStrictEqual({'allTasks': 292})
  expect(fcArchive.wrapToList(list)[0].allTasks).toBe(292)

  // Non-empty array with the two dictionaries
  list = [{'allTasks': 292}, {'allEvents': 111}]
  expect(Array.isArray(fcArchive.wrapToList(list))).toBeTruthy()
  expect(fcArchive.wrapToList(list).length).toBe(2)
  expect(fcArchive.wrapToList(list)).toContainEqual({'allTasks': 292})
  expect(fcArchive.wrapToList(list)[0]).toStrictEqual({'allTasks': 292})
  expect(fcArchive.wrapToList(list)[0].allTasks).toBe(292)
  expect(fcArchive.wrapToList(list)).toContainEqual({'allEvents': 111})
  expect(fcArchive.wrapToList(list)[1]).toStrictEqual({'allEvents': 111})
  expect(fcArchive.wrapToList(list)[1].allEvents).toBe(111)
})


test("StateSnapshotter() save() and rollback a single branch", () => {

  // INITIALIZE

  // Creating the fake component
  const fc = new fakeComponent({
    'allEvents': allEvents,
    'allTasks': allTasks
  })

  // Checking values
  const id = 109
  expect(fc.state.allEvents[id].id).toBe(id)
  const test_event_title = fc.state.allEvents[id].title

  // Create Archive
  const fcArchive = new StateSnapshotter(fc)
  // Make sure it binded well
  expect(fcArchive.component.state.allEvents[id].id).toBe(id)
  expect(fcArchive.component.state.allEvents[id].title).toBe(test_event_title)
  // Save original title value for respective id

  // Make snapshot
  const rollback = fcArchive.save('allEvents')

  // CHECKS

  // Changing the state
  const test_event_title_new = "Hotel California party"
  fc.state.allEvents[id].title = test_event_title_new
  expect(fc.state.allEvents[id].title).toBe(test_event_title_new)

  // Rolling back to the original state
  rollback()

  // Check if we rolled back really
  expect(fc.state.allEvents[id].title).toBe(test_event_title)


})

test("StateSnapshotter() save() and rollback a single element", () => {

  // INITIALIZE

  // Creating the fake component
  const fc = new fakeComponent({
    'allEvents': allEvents,
    'allTasks': allTasks
  })

  // Checking values
  let id = 109
  expect(fc.state.allEvents[id].id).toBe(id)
  const test_event_title = fc.state.allEvents[id].title

  // Create Archive
  const fcArchive = new StateSnapshotter(fc)
  // Make sure it binded well
  expect(fcArchive.component.state.allEvents[id].id).toBe(id)
  expect(fcArchive.component.state.allEvents[id].title).toBe(test_event_title)
  // Save original title value for respective id

  // Make snapshot
  const rollback = fcArchive.save({'allEvents': id})

  // CHECKS

  // Changing the state

  id = 109
  let test_event_title_new = "Hotel California party"
  fc.state.allEvents[id].title = test_event_title_new
  expect(fc.state.allEvents[id].title).toBe(test_event_title_new)

  // Rolling back to the original state
  rollback()

  // Check if we rolled back really
  expect(fc.state.allEvents[id].title).toBe(test_event_title)

})

test(
  "StateSnapshotter() save() and rollback one change rollback, other keep",
  () => {

  // INITIALIZE

  // Creating the fake component
  const fc = new fakeComponent({
    'allEvents': allEvents,
    'allTasks': allTasks
  })

  // Checking values
  let idRollback = 109
  let idRetainChanges = 110
  let titleRollbackOld, titleRetainOld, titleRollbackNew, titleRetainNew

  // Create Archive
  const fcArchive = new StateSnapshotter(fc)

  // Make snapshot
  const rollback = fcArchive.save({'allEvents': idRollback})

  // CHECKS

  let titleToRollBackTo = fc.state.allEvents[idRollback].title

  // Updating titles

  fc.state.allEvents[idRollback].title = "123"
  fc.state.allEvents[idRetainChanges].title = "456"

  // Roll back to original state
  rollback()

  // Check if we rolled back really
  expect(fc.state.allEvents[idRollback].title).toBe(titleToRollBackTo)
  expect(fc.state.allEvents[idRetainChanges].title).toBe("456")

})

