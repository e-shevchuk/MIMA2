import Schedule from "../Schedule";
import { ScheduleElementsSet } from "../Schedule";
import Task from "../Task";
import TimeRec from "../TimeRec";
import Event from "../Event";
import Activity from "../Activity";
import { allActivities, allTimeRecords, allEvents, allTasks }
        from './Schedule.test.data'


// SCHEDULE ELEMENTS SET (ScheduleElementsSet)

// add

test('ScheduleElementsSet.add() 01', ()=>{
  const msg = "ScheduleElementsSet.add(): 'id' is not provided"
  const elMock = {id: 1, idDB: 2, idApp: 3}
  const elements = new ScheduleElementsSet()

  expect.assertions(0)
  try {
    elements.add(elMock)
  } catch (e) {
    expect(e.message).toBe(msg)
  }
})

test('ScheduleElementsSet.add() 02', ()=>{
  const msg = "ScheduleElementsSet.add(): 'idDB' is not provided"
  const elMock = {id: 1, idDB: 2, idApp: 3}
  delete elMock.idDB
  const elements = new ScheduleElementsSet()

  expect.assertions(1)
  try {
    elements.add(elMock)
  } catch (e) {
    expect(e.message).toBe(msg)
  }
})

test('ScheduleElementsSet.add() 03', ()=>{
  const elMock = {id: 1, idDB: 2, idApp: 3}
  const elements = new ScheduleElementsSet()
  elements.add(elMock)

  expect.assertions(1)
  expect(elements.get(1).id).toBe(1)
})

// get

test('ScheduleElementsSet.get() 01', ()=>{
  const elMock = {id: 1, idDB: 2, idApp: 3}
  const elements = new ScheduleElementsSet()
  elements.add(elMock)

  expect.assertions(1)

  const elGot = elements.get(1)
  expect(elGot.id).toBe(1)
})

test('ScheduleElementsSet.get() 02', ()=>{
  const msg = "ScheduleElementsSet.get(): 'id' is not provided"
  const elMock = {id: 4, idDB: 2, idApp: 3}
  const elements = new ScheduleElementsSet()
  elements.add(elMock)

  expect.assertions(1)

  try {
    const elGot = elements.get()
  } catch (e) {
    expect(e.message).toBe(msg)
  }
})

test('ScheduleElementsSet.get() 03', ()=>{
  const msg = "ScheduleElementsSet.get(): 'id' is not provided"
  const elMock = {id: 4, idDB: 2, idApp: 3}
  const elements = new ScheduleElementsSet()
  elements.add(elMock)

  expect.assertions(1)

  try {
    const elGot = elements.get('')
  } catch (e) {
    expect(e.message).toBe(msg)
  }
})

test('ScheduleElementsSet.get() 04', ()=>{
  const msg = "ScheduleElementsSet.get(): no object for id=5 found"
  const elMock = {id: 4, idDB: 2, idApp: 3}
  const elements = new ScheduleElementsSet()
  elements.add(elMock)

  expect.assertions(1)

  try {
    const elGot = elements.get(5)
  } catch (e) {
    expect(e.message).toBe(msg)
  }
})

test('ScheduleElementsSet.get() 05', ()=>{
  const msg = "ScheduleElementsSet.get(): no id for idDB=4 found"
  const elMock = {id: 4, idDB: 2, idApp: 3}
  const elements = new ScheduleElementsSet()
  elements.add(elMock)

  expect.assertions(1)

  try {
    const elGot = elements.get(4, 'idDB')
  } catch (e) {
    expect(e.message).toBe(msg)
  }
})

test('ScheduleElementsSet.get() 06', ()=>{
  const msg = "ScheduleElementsSet.get(): wrong 'idType' value"
  const elMock = {id: 4, idDB: 2, idApp: 3}
  const elements = new ScheduleElementsSet()
  elements.add(elMock)

  expect.assertions(1)

  try {
    const elGot = elements.get(4, 'id DB')
  } catch (e) {
    expect(e.message).toBe(msg)
  }
})

test('ScheduleElementsSet.get() 07', ()=>{
  const msg = "ScheduleElementsSet.get(): 'idType' value is not provided"
  const elMock = {id: 4, idDB: 2, idApp: 3}
  const elements = new ScheduleElementsSet()
  elements.add(elMock)

  expect.assertions(1)

  try {
    const elGot = elements.get(7, '')
  } catch (e) {
    expect(e.message).toBe(msg)
  }
})

// SCHEDULE (Schedule)

test('Schedule.addActivity() 01', ()=>{
  const msg = "Schedule.addActivity(): "
  let json, acty, event, task, time

  json = JSON.stringify(allActivities[96])
  acty = new Activity.fromDBJSON(json)

  json = JSON.stringify(allEvents[108])
  event = new Event.fromDBJSON(json)

  json = JSON.stringify(allTasks[288])
  task = new Task.fromDBJSON(json)

  json = JSON.stringify(allTimeRecords[1])
  time = new TimeRec.fromDBJSON(json)

  const schedule = new Schedule()

  schedule.addActivity(acty)
  schedule.addEvent(event)
  schedule.addTask(task)
  schedule.addTimeRec(time)

  expect(schedule.activities.get(96).title).toBe('MIMA Dev')
  expect(schedule.events.get(108).title).toBe('MIMA Dev')
  expect(schedule.tasks.get(288).duration).toBe(7200000)
  expect(schedule.timeRecs.get(1).duration).toBe(600000)
})

test('Schedule.addActivity() 02', ()=>{
  const msg = "Schedule.addActivity(): "
  let json, acty, event, task, time
  const schedule = new Schedule()

  // Activities

  json = JSON.stringify(allActivities[1])
  acty = new Activity.fromDBJSON(json)
  schedule.addActivity(acty)

  json = JSON.stringify(allActivities[2])
  acty = new Activity.fromDBJSON(json)
  schedule.addActivity(acty)

  // Events

  json = JSON.stringify(allEvents[1])
  event = new Event.fromDBJSON(json)

  //Tasks

  json = JSON.stringify(allTasks[288])
  task = new Task.fromDBJSON(json)

  // Time records

  json = JSON.stringify(allTimeRecords[1])
  time = new TimeRec.fromDBJSON(json)


  schedule.addEvent(event)
  schedule.addTask(task)
  schedule.addTimeRec(time)

  expect(schedule.activities.get(1).title).toBe('WorldTime cafe')
  expect(schedule.events.get(1).title).toBe('WorldTime cafe')
  expect(schedule.tasks.get(288).duration).toBe(7200000)
  expect(schedule.timeRecs.get(1).duration).toBe(600000)
})
