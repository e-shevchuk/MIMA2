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


// Schedule.buildRefsTime tests to create
// Time - simple refs
// Event - simple refs
// Time - simple refs
// Event - tasks list
// Event - pinned tasks list
// Event - time list
// Event - pinned time list
// Task - time list

test('Schedule.buildRefsTime() 01', ()=>{
  const msg = "Schedule.addActivity(): "
  let json, acty, event, task, time
  const schedule = new Schedule()

  // Data pulling functions
  const getA = id => new Activity.fromDBJSON(JSON.stringify(allActivities[id]))
  const getE = id => new Event.fromDBJSON(JSON.stringify(allEvents[id]))
  const getT = id => new Task.fromDBJSON(JSON.stringify(allTasks[id]))
  const getR = id => new TimeRec.fromDBJSON(JSON.stringify(allTimeRecords[id]))

  // CREATE UN-BUILT SCHEDULE

  // Activities
  schedule.addActivity(getA(1))

  // Events
  schedule.addEvent(getE(1))

  //Tasks
  schedule.addTask(getT(1))
  schedule.addTask(getT(2))

  // Time records
  schedule.addTimeRec(getR(2))
  schedule.addTimeRec(getR(3))

  // TESTING

  // Build for first time record
  const tr = schedule.timeRecs.get(2)
  schedule.buildRefsTime(tr)

  expect(tr.prev).toBeUndefined()
  expect(tr.next.id).toBe(3)
  expect(tr.task.id).toBe(1)
  expect(tr.event.id).toBe(1)
  expect(tr.activity.id).toBe(1)
})


test('Schedule.buildRefsTime() 0214', ()=>{
  const msg = "Schedule.addActivity(): "
  let json, acty, event, task, time
  const schedule = new Schedule()

  // HELPER FUNCTIONS

  // Data pulling functions
  const getA = id => new Activity.fromDBJSON(JSON.stringify(allActivities[id]))
  const getE = id => new Event.fromDBJSON(JSON.stringify(allEvents[id]))
  const getT = id => new Task.fromDBJSON(JSON.stringify(allTasks[id]))
  const getR = id => new TimeRec.fromDBJSON(JSON.stringify(allTimeRecords[id]))

  // Build for first time record
  const buildRefsT = id => schedule.buildRefsTime(schedule.timeRecs.get(id))

  // Object getters
  const tr = id => schedule.timeRecs.get(id)
  const t = id => schedule.tasks.get(id)
  const e = id => schedule.events.get(id)
  const a = id => schedule.activities.get(id)

  // CREATE UN-BUILT SCHEDULE

  // Activities
  schedule.addActivity(getA(1))
  schedule.addActivity(getA(2))

  // Events
  schedule.addEvent(getE(1))
  schedule.addEvent(getE(2))
  schedule.addEvent(getE(3))

  //Tasks
  schedule.addTask(getT(1))
  schedule.addTask(getT(2))
  schedule.addTask(getT(3))
  schedule.addTask(getT(4))

  // Time records
  schedule.addTimeRec(getR(2))
  schedule.addTimeRec(getR(3))
  schedule.addTimeRec(getR(4))
  schedule.addTimeRec(getR(5))
  schedule.addTimeRec(getR(6))

  // TESTING

  // Build
  buildRefsT(2)
  buildRefsT(3)
  buildRefsT(4)
  buildRefsT(5)
  buildRefsT(6)

  // Validations

  expect(tr(2).prev).toBeUndefined()
  expect(tr(2).next.id).toBe(3)
  expect(tr(2).task.id).toBe(1)
  expect(tr(2).event.id).toBe(1)
  expect(tr(2).activity.id).toBe(1)

  expect(t(1).prev).toBeUndefined()
  expect(t(1).next).toBe(t(2))
  expect(t(1).refTime).toContain(tr(2))
  expect(t(1).refTime.length).toBe(1)
  expect(t(1).refEvents).toContain(e(1))
  expect(t(1).refEvents.length).toBe(1)
  expect(t(1).activity).toBe(a(1))

  expect(e(1).activity).toBe(a(1))
  expect(e(1).refTasks).toContain(t(1))
  expect(e(1).refTasks).toContain(t(2))
  expect(e(1).refTasks.length).toBe(2)
  expect(e(1).refTasksPinned.length).toBe(0)
  expect(e(1).refTime).toContain(tr(2))
  expect(e(1).refTime).toContain(tr(3))
  expect(e(1).refTime.length).toBe(2)

  expect(tr(3).prev).toBe(tr(2))
  expect(tr(3).next).toBe(tr(4))
  expect(tr(3).task).toBe(t(2))
  expect(tr(3).event).toBe(e(1))
  expect(tr(2).activity).toBe(a(1))

  expect(t(2).prev).toBe(t(1))
  expect(t(2).next).toBeUndefined()
  expect(t(2).refTime).toContain(tr(3))
  expect(t(2).refTime).toContain(tr(4))
  expect(t(2).refTime.length).toBe(2)
  expect(t(2).refEvents).toContain(e(1))
  expect(t(2).refEvents).toContain(e(2))
  expect(t(2).refEvents.length).toBe(2)
  expect(t(2).activity).toBe(a(1))

  expect(e(2).activity).toBe(a(1))
  expect(e(2).refTasks).toContain(t(2))
  expect(e(2).refTasks.length).toBe(1)
  expect(e(2).refTasksPinned).toContain(t(3))
  expect(e(2).refTasksPinned).toContain(t(4))
  expect(e(2).refTasksPinned.length).toBe(2)
  expect(e(2).refTime).toContain(tr(4))
  expect(e(2).refTime.length).toBe(1)
  expect(e(2).refTimePinned).toContain(tr(5))
  expect(e(2).refTimePinned).toContain(tr(6))
  expect(e(2).refTimePinned.length).toBe(2)

  expect(tr(4).prev).toBe(tr(3))
  expect(tr(4).next).toBeUndefined()
  expect(tr(4).task).toBe(t(2))
  expect(tr(4).event).toBe(e(2))
  expect(tr(4).activity).toBe(a(1))

  expect(t(3).prev).toBeUndefined()
  expect(t(3).next).toBe(t(4))
  expect(t(3).refTime).toContain(tr(5))
  expect(t(3).refTime.length).toBe(1)
  expect(t(3).refEvents).toContain(e(2))
  expect(t(3).refEvents.length).toBe(1)
  expect(t(3).activity).toBe(a(1))

  expect(t(4).prev).toBe(t(3))
  expect(t(4).next).toBeUndefined()
  expect(t(4).refTime).toContain(tr(6))
  expect(t(4).refTime.length).toBe(1)
  expect(t(4).refEvents).toContain(e(2))
  expect(t(4).refEvents.length).toBe(1)
  expect(t(4).activity).toBe(a(1))

  expect(tr(5).prev).toBeUndefined()
  expect(tr(5).next).toBe(tr(6))
  expect(tr(5).task).toBe(t(3))
  expect(tr(5).event).toBe(e(2))
  expect(tr(5).activity).toBe(a(1))

  expect(tr(6).prev).toBe(tr(5))
  expect(tr(6).next).toBeUndefined()
  expect(tr(6).task).toBe(t(4))
  expect(tr(6).event).toBe(e(2))
  expect(tr(6).activity).toBe(a(1))

})

test('Schedule.buildRefsTime() 0315', ()=>{
  const msg = "Schedule.addActivity(): "
  let json, acty, event, task, time
  const schedule = new Schedule()

  // HELPER FUNCTIONS

  // Data pulling functions
  const getA = id => new Activity.fromDBJSON(JSON.stringify(allActivities[id]))
  const getE = id => new Event.fromDBJSON(JSON.stringify(allEvents[id]))
  const getT = id => new Task.fromDBJSON(JSON.stringify(allTasks[id]))
  const getR = id => new TimeRec.fromDBJSON(JSON.stringify(allTimeRecords[id]))

  // Build for first time record
  const buildRefsT = id => schedule.buildRefsTime(schedule.timeRecs.get(id))

  // Object getters
  const tr = id => schedule.timeRecs.get(id)
  const t = id => schedule.tasks.get(id)
  const e = id => schedule.events.get(id)
  const a = id => schedule.activities.get(id)

  // CREATE UN-BUILT SCHEDULE

  // Activities
  schedule.addActivity(getA(1))
  schedule.addActivity(getA(2))

  // Events
  schedule.addEvent(getE(1))
  schedule.addEvent(getE(2))
  schedule.addEvent(getE(3))

  //Tasks
  schedule.addTask(getT(1))
  schedule.addTask(getT(2))
  schedule.addTask(getT(3))
  schedule.addTask(getT(4))

  // Time records
  schedule.addTimeRec(getR(2))
  schedule.addTimeRec(getR(3))
  schedule.addTimeRec(getR(4))
  schedule.addTimeRec(getR(5))
  schedule.addTimeRec(getR(6))

  // TESTING

  // Build
  buildRefsEvent(1)
  buildRefsEvent(2)

  // Validations

  expect(tr(2).prev).toBeUndefined()
  expect(tr(2).next.id).toBe(3)
  expect(tr(2).task.id).toBe(1)
  expect(tr(2).event.id).toBe(1)
  expect(tr(2).activity.id).toBe(1)

  expect(t(1).prev).toBeUndefined()
  expect(t(1).next).toBe(t(2))
  expect(t(1).refTime).toContain(tr(2))
  expect(t(1).refTime.length).toBe(1)
  expect(t(1).refEvents).toContain(e(1))
  expect(t(1).refEvents.length).toBe(1)
  expect(t(1).activity).toBe(a(1))

  expect(e(1).activity).toBe(a(1))
  expect(e(1).refTasks).toContain(t(1))
  expect(e(1).refTasks).toContain(t(2))
  expect(e(1).refTasks.length).toBe(2)
  expect(e(1).refTasksPinned.length).toBe(0)
  expect(e(1).refTime).toContain(tr(2))
  expect(e(1).refTime).toContain(tr(3))
  expect(e(1).refTime.length).toBe(2)

  expect(tr(3).prev).toBe(tr(2))
  expect(tr(3).next).toBe(tr(4))
  expect(tr(3).task).toBe(t(2))
  expect(tr(3).event).toBe(e(1))
  expect(tr(2).activity).toBe(a(1))

  expect(t(2).prev).toBe(t(1))
  expect(t(2).next).toBeUndefined()
  expect(t(2).refTime).toContain(tr(3))
  expect(t(2).refTime).toContain(tr(4))
  expect(t(2).refTime.length).toBe(2)
  expect(t(2).refEvents).toContain(e(1))
  expect(t(2).refEvents).toContain(e(2))
  expect(t(2).refEvents.length).toBe(2)
  expect(t(2).activity).toBe(a(1))

  expect(e(2).activity).toBe(a(1))
  expect(e(2).refTasks).toContain(t(2))
  expect(e(2).refTasks.length).toBe(1)
  expect(e(2).refTasksPinned).toContain(t(3))
  expect(e(2).refTasksPinned).toContain(t(4))
  expect(e(2).refTasksPinned.length).toBe(2)
  expect(e(2).refTime).toContain(tr(4))
  expect(e(2).refTime.length).toBe(1)
  expect(e(2).refTimePinned).toContain(tr(5))
  expect(e(2).refTimePinned).toContain(tr(6))
  expect(e(2).refTimePinned.length).toBe(2)

  expect(tr(4).prev).toBe(tr(3))
  expect(tr(4).next).toBeUndefined()
  expect(tr(4).task).toBe(t(2))
  expect(tr(4).event).toBe(e(2))
  expect(tr(4).activity).toBe(a(1))

  expect(t(3).prev).toBeUndefined()
  expect(t(3).next).toBe(t(4))
  expect(t(3).refTime).toContain(tr(5))
  expect(t(3).refTime.length).toBe(1)
  expect(t(3).refEvents).toContain(e(2))
  expect(t(3).refEvents.length).toBe(1)
  expect(t(3).activity).toBe(a(1))

  expect(t(4).prev).toBe(t(3))
  expect(t(4).next).toBeUndefined()
  expect(t(4).refTime).toContain(tr(6))
  expect(t(4).refTime.length).toBe(1)
  expect(t(4).refEvents).toContain(e(2))
  expect(t(4).refEvents.length).toBe(1)
  expect(t(4).activity).toBe(a(1))

  expect(tr(5).prev).toBeUndefined()
  expect(tr(5).next).toBe(tr(6))
  expect(tr(5).task).toBe(t(3))
  expect(tr(5).event).toBe(e(2))
  expect(tr(5).activity).toBe(a(1))

  expect(tr(6).prev).toBe(tr(5))
  expect(tr(6).next).toBeUndefined()
  expect(tr(6).task).toBe(t(4))
  expect(tr(6).event).toBe(e(2))
  expect(tr(6).activity).toBe(a(1))

})
