import Schedule from "../Schedule";
import { ScheduleElementsSet } from "../Schedule";
import Task from "../Task";
import TimeRec from "../TimeRec";
import Event from "../Event";
import Activity from "../Activity";
import {allActivities, allTimeRecords, allEvents, allTasks, testData003}
  from './Schedule.test.data'
import testData001 from "../ScheduleManager/ScheduleManager.test.data";
import MIMApi from "../MIMApi";
import {mockFetchGetWithData} from "../Mocks";
import testData002 from "../Mocks/Mocks.test.data";
import update from 'immutability-helper';

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
  const msg = "ScheduleElementsSet.add(): 'idDB' is not exists"
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
  const buildRefsE = id => schedule.buildRefsEvent(schedule.events.get(id))

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

  buildRefsE(1)
  buildRefsE(2)
  buildRefsE(3)

  // Validations

  expect(a(1).title).toBe(e(1).title)
  expect(a(1).refEvents).toContain(e(1))
  expect(a(1).refEvents).toContain(e(2))
  expect(a(1).refEvents).toContain(e(3))
  expect(a(1).refEvents.length).toBe(3)

  expect(e(1).activity).toBe(a(1))
  expect(e(2).activity).toBe(a(1))
  expect(e(3).activity).toBe(a(1))
})

test('ScheduleElementsSet.getTimeInsertPrevNext 0329', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData003))

  const api = new MIMApi()
  const s = new Schedule()
  s.initByDBdata(await api.getAll())

  // Micro-service function
  const e = (id) => s.events.getByidApp(id)

  expect(e(1157).refTimePinned.map(e => e.dataDB)).toStrictEqual(
    [
      {
        id: 1829,
        task: 504,
        event: 1157,
        prev: null,
        next: 1830,
        duration: '00:10:00',
        complete: false
      },
      {
        id: 1830,
        task: 505,
        event: 1157,
        prev: 1829,
        next: null,
        duration: '00:20:00',
        complete: false
      }
    ]
  )

  expect(e(1157).refTasksPinned.map(e => e.dataDB)).toStrictEqual(
    [
      {
        id: 504,
        title: 'New task 03(p)',
        pinned: true,
        duration: '00:10:00',
        complete: false
      },
      {
        id: 505,
        title: 'New task 04(p)',
        pinned: true,
        duration: '00:10:00',
        complete: false
      }
    ]
  )

  window.fetch.mockRestore()
})

test('Schedule.refTimePinned 0116', ()=>{
  const msg = "Schedule.addActivity(): "
  let json, acty, event, task, time

  let {activities, events, tasks, timeRecs} = testData001

  const s = new Schedule()

  // HELPER FUNCTIONS

  // Data pulling functions
  const getA = n => new Activity.fromDBJSON(JSON.stringify(activities[n]))
  const getE = n => new Event.fromDBJSON(JSON.stringify(events[n]))
  const getT = n => new Task.fromDBJSON(JSON.stringify(tasks[n]))
  const getR = n => new TimeRec.fromDBJSON(JSON.stringify(timeRecs[n]))

  // Object getters
  const e = id =>  s.events.get(id)

  // CREATE UN-BUILT SCHEDULE

  // Activities
  s.addActivity(getA(0))
  s.addActivity(getA(1))

  // Events
  s.addEvent(getE(0))
  s.addEvent(getE(1))
  s.addEvent(getE(2))

  //Tasks
  s.addTask(getT(0))
  s.addTask(getT(1))
  s.addTask(getT(2))
  s.addTask(getT(3))

  // Time records
  s.addTimeRec(getR(0))
  s.addTimeRec(getR(1))
  s.addTimeRec(getR(2))
  s.addTimeRec(getR(3))
  s.addTimeRec(getR(4))

  // TESTING

  // Build
  s.buildAllRefs()

  // Validations

  // Pinned time references
  expect(e(101).refTime.length).toBe(2)
  expect(e(102).refTime.length).toBe(1)
  expect(e(103).refTime.length).toBe(0)

  // Non-pinned time references
  expect(e(101).refTimePinned.length).toBe(0)
  expect(e(102).refTimePinned.length).toBe(2)
  expect(e(103).refTimePinned.length).toBe(0)

  // Pinned time references
  expect(e(101).refTime.length).toBe(2)

})

test('Schedule.copy 0317', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData002))

  const api = new MIMApi()
  const s1 = new Schedule()
  s1.initByDBdata(await api.getAll())

  const s2 =  s1.copy()

  expect(s2.isHolistic).toBeTruthy()

  window.fetch.mockRestore()
})

test('ScheduleElementsSet.diff 0418', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData002))

  const api = new MIMApi()
  const s1 = new Schedule()
  s1.initByDBdata(await api.getAll())

  const s2 =  s1.copy()

  s2.tasks.get(498).title = 'Listen to a cool muzz'
  s2.tasks.get(499).title = 'Drink a cup of tea'

  const diff01 = {
    "create": {},
    "delete": {},
    "update": {
     '498': {...s2.tasks.get(498).dataDB, 'title': 'Listen to a cool muzz'},
     '499': {...s2.tasks.get(499).dataDB, 'title': 'Drink a cup of tea'},
    },
  }

  const diff02 = s1.tasks.diff(s2.tasks)
  expect(diff02.update[498].getDataDB()).toStrictEqual(diff01.update[498])
  expect(diff02.update[499].getDataDB()).toStrictEqual(diff01.update[499])


  window.fetch.mockRestore()

})

test('ScheduleElementsSet.diff 0419', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData002))

  const api = new MIMApi()
  const s1 = new Schedule()
  s1.initByDBdata(await api.getAll())

  const s2 =  s1.copy()

  const diff01 = {
    "create": {},
    "delete": {},
    "update": {},
  }

  diff01.delete[498] = s2.tasks.objs[498].dataDB
  delete s2.tasks.objs[498]

  diff01.delete[499] = s2.tasks.objs[499].dataDB
  delete s2.tasks.objs[499]

  const diff02 = s1.tasks.diff(s2.tasks)
  expect(diff02.delete[498].getDataDB()).toStrictEqual(undefined)
  expect(diff02.delete[499].getDataDB()).toStrictEqual(undefined)

  window.fetch.mockRestore()

})

test('ScheduleElementsSet.diff 0420', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData002))

  const api = new MIMApi()
  const s1 = new Schedule()
  s1.initByDBdata(await api.getAll())

  const s2 =  s1.copy()

  const diff01 = {
    "create": {},
    "delete": {},
    "update": {},
  }

  diff01.delete[498] = s2.tasks.objs[498].dataDB
  diff01.delete[499] = s2.tasks.objs[499].dataDB
  diff01.delete[500] = s2.tasks.objs[500].dataDB
  diff01.delete[501] = s2.tasks.objs[501].dataDB
  delete s2.tasks.objs[498]
  delete s2.tasks.objs[499]
  delete s2.tasks.objs[500]
  delete s2.tasks.objs[501]

  const diff02 = s1.tasks.diff(s2.tasks)
  expect(diff02.delete[498].getDataDB()).toStrictEqual(undefined)
  expect(diff02.delete[499].getDataDB()).toStrictEqual(undefined)
  expect(diff02.delete[500].getDataDB()).toStrictEqual(undefined)
  expect(diff02.delete[501].getDataDB()).toStrictEqual(undefined)

  window.fetch.mockRestore()

})

test('ScheduleElementsSet.diff 0421', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData002))

  const api = new MIMApi()
  const s1 = new Schedule()
  s1.initByDBdata(await api.getAll())

  const s2 =  s1.copy()

  const diff01 = {
    "create": {},
    "delete": {},
    "update": {},
  }

  const t1 = {
    "id": 502,
    "title": "Build a bridge",
    "pinned": true,
    "duration": "01:40:00",
    "complete": true
  }

  const t2 = {
    "id": 503,
    "title": "Launch a spaceship",
    "pinned": true,
    "duration": "01:40:00",
    "complete": true
  }

  s2.addTask(Task.fromDB(t1))
  diff01.create[t1.id] = t1

  s2.addTask(Task.fromDB(t2))
  diff01.create[t2.id] = t2

  const diff02 = s1.tasks.diff(s2.tasks)
  expect(diff02.create[502].getDataDB()).toStrictEqual(diff01.create[502])
  expect(diff02.create[503].getDataDB()).toStrictEqual(diff01.create[503])


  window.fetch.mockRestore()

})

test('ScheduleElementsSet.diff 0422', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData002))

  const api = new MIMApi()
  const s1 = new Schedule()
  s1.initByDBdata(await api.getAll())

  const diff01 = {
    "create": {},
    "delete": {},
    "update": {},
  }

  const s2 =  s1.copy()

  delete s1.tasks.objs[498]
  delete s1.tasks.objs[499]
  delete s1.tasks.objs[500]
  delete s1.tasks.objs[501]
  delete s2.tasks.objs[498]
  delete s2.tasks.objs[499]
  delete s2.tasks.objs[500]
  delete s2.tasks.objs[501]


  const t1 = {
    "id": 502,
    "title": "Build a bridge",
    "pinned": true,
    "duration": "01:40:00",
    "complete": true
  }

  const t2 = {
    "id": 503,
    "title": "Launch a spaceship",
    "pinned": true,
    "duration": "01:40:00",
    "complete": true
  }

  s2.addTask(Task.fromDB(t1))
  diff01.create[t1.id] = t1

  s2.addTask(Task.fromDB(t2))
  diff01.create[t2.id] = t2

  const diff02 = s1.tasks.diff(s2.tasks)
  expect(diff02.create[502].getDataDB()).toStrictEqual(diff01.create[502])
  expect(diff02.create[503].getDataDB()).toStrictEqual(diff01.create[503])

  window.fetch.mockRestore()

})

test('ScheduleElementsSet.diff 0423', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData002))

  const api = new MIMApi()
  const s1 = new Schedule()
  s1.initByDBdata(await api.getAll())
  const s2 =  s1.copy()

  const diff01 = {
    "create": {},
    "delete": {},
    "update": {},
  }

  // Update

  s2.tasks.get(498).title = 'Listen to a cool music'
  diff01.update[498] = s2.tasks.get(498).dataDB

  s2.tasks.get(499).title = 'Drink a cup of tea'
  diff01.update[499] = s2.tasks.get(499).dataDB

  // Remove

  diff01.delete[500] = s2.tasks.get(500).dataDB
  delete s2.tasks.objs[500]

  diff01.delete[501] = s2.tasks.get(501).dataDB
  delete s2.tasks.objs[501]

  // Add

  const t1 = {
    "id": 502,
    "title": "Build a bridge",
    "pinned": true,
    "duration": "01:40:00",
    "complete": true
  }

  const t2 = {
    "id": 503,
    "title": "Launch a spaceship",
    "pinned": true,
    "duration": "01:40:00",
    "complete": true
  }


  s2.addTask(Task.fromDB(t1))
  diff01.create[502] = s2.tasks.get(502).dataDB
  diff01.update[502] = s2.tasks.get(502).dataDB

  s2.addTask(Task.fromDB(t2))
  diff01.create[503] = s2.tasks.get(503).dataDB
  diff01.update[503] = s2.tasks.get(503).dataDB

  // Validations

  const diff02 = s1.tasks.diff(s2.tasks)
  expect(diff02.create[502].getDataDB()).toStrictEqual(diff01.create[502])
  expect(diff02.create[503].getDataDB()).toStrictEqual(diff01.create[503])
  expect(diff02.delete[500].getDataDB()).toStrictEqual(undefined)
  expect(diff02.delete[501].getDataDB()).toStrictEqual(undefined)
  expect(diff02.update[502].getDataDB()).toStrictEqual(diff01.update[502])
  expect(diff02.update[503].getDataDB()).toStrictEqual(diff01.update[503])
  expect(diff02.update[498].getDataDB()).toStrictEqual(diff01.update[498])
  expect(diff02.update[499].getDataDB()).toStrictEqual(diff01.update[499])

  window.fetch.mockRestore()

})

test('ScheduleElementsSet.diff 0424', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData002))

  const api = new MIMApi()
  const s1 = new Schedule()
  s1.initByDBdata(await api.getAll())

  const s2 =  s1.copy()

  delete s1.tasks.objs[498]
  delete s1.tasks.objs[499]
  delete s1.tasks.objs[500]
  delete s1.tasks.objs[501]
  delete s2.tasks.objs[498]
  delete s2.tasks.objs[499]
  delete s2.tasks.objs[500]
  delete s2.tasks.objs[501]

  const diff01 = {
    "create": {},
    "delete": {},
    "update": {},
  }

  expect(s1.tasks.diff(s2.tasks)).toStrictEqual(diff01)

  window.fetch.mockRestore()

})

test('ScheduleElementsSet.diff 0425', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData002))

  const api = new MIMApi()
  const s1 = new Schedule()
  s1.initByDBdata(await api.getAll())

  const s2 =  s1.copy()

  const diff01 = {
    "create": {},
    "delete": {},
    "update": {},
  }

  expect(s1.tasks.diff(s2.tasks)).toStrictEqual(diff01)

  window.fetch.mockRestore()

})

test('Schedule.timeInsert 0526', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData003))

  const api = new MIMApi()
  const s = new Schedule()
  s.initByDBdata(await api.getAll())

  const timeDBrecordToBe = {
    "task": 502,
    "event": 1156,
    "prev": 1824,
    "next": 1825,
    "duration": 600000,
    "title": "New task 01",
    "pinned": false,
    "timeComplete": false,
    "taskComplete": false,
  }

  const timeDBrecord = s.timeInsert(
    502,
    1156,
    1824,
    true,
    "00:10:00")


  delete timeDBrecord.time
  expect(timeDBrecord).toStrictEqual(timeDBrecordToBe)

  window.fetch.mockRestore()

})

test('Schedule.timeInsert 0527', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData003))

  const api = new MIMApi()
  const s = new Schedule()
  s.initByDBdata(await api.getAll())

  const timeDBrecordToBe = {
    "task": 502,
    "event": 1157,
    "prev": 1828,
    "next": null,
    "duration": 600000,
    "title": "New task 01",
    "pinned": false,
    "timeComplete": false,
    "taskComplete": false,
  }

  const timeDBrecord = s.timeInsert(
    502,
    1157,
    1828,
    true,
    "00:10:00")


  delete timeDBrecord.time
  expect(timeDBrecord).toStrictEqual(timeDBrecordToBe)

  window.fetch.mockRestore()

})

test('Schedule.timeInsert 0530', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData003))

  const api = new MIMApi()
  const s = new Schedule()
  s.initByDBdata(await api.getAll())

  const timeDBrecordToBe = {
    "task": 502,
    "event": 1156,
    "prev": null,
    "next": 1824,
    "duration": 600000,
    "title": "New task 01",
    "pinned": false,
    "timeComplete": false,
    "taskComplete": false,
  }

  const timeDBrecord = s.timeInsert(
    502,
    1156,
    1824,
    false,
    "00:10:00")

  delete timeDBrecord.time
  expect(timeDBrecord).toStrictEqual(timeDBrecordToBe)

  window.fetch.mockRestore()

})

test('Schedule.getTimeInsertPN 0628', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData003))

  let pn

  const api = new MIMApi()
  const s = new Schedule()
  s.initByDBdata(await api.getAll())

  // Micro-service function
  const e = (id) => s.events.getByidApp(id)
  const t = (id) => s.timeRecs.getByidApp(id)
  const f = (a, b, c, d) => s.getTimeInsertPN(a, b, c, d)

  const msgErrNoPosUnPin =
    "Schedule.getTimeInsertPN(): Unpinned time record without position"

  expect.assertions(16)

  // UNPINNED WITH NO POSITION

  // Between two records
  try {
    let {prev, next} = f(false, e(1156))
  } catch (e) {
    expect(e.message).toBe(msgErrNoPosUnPin)
  }

  // To be last
  try {
    f(false, e(1157))
  } catch (e) {
    expect(e.message).toBe(msgErrNoPosUnPin)
  }

  // To an empty event with time records in previous events
  try {
    f(false, e(1160))
  } catch (e) {
    expect(e.message).toBe(msgErrNoPosUnPin)
  }

  // To an empty standalone event
  try {
    f(false, e(1159))
  } catch (e) {
    expect(e.message).toBe(msgErrNoPosUnPin)
  }

  // UNPINNED WITH POSITION

  // Between two records, using after=true
  pn = f(false, e(1156), t(1824), true)
  expect([pn.prev.idApp, pn.next.idApp])
    .toStrictEqual([1824, 1825])

  // Between two records, using after=false
  pn = f(false, e(1156), t(1825), false)
  expect([pn.prev.idApp, pn.next.idApp])
    .toStrictEqual([1824, 1825])

  // First, using after=false
  pn = f(false, e(1156), t(1824), false)
  expect([pn.prev, pn.next.idApp])
    .toStrictEqual([undefined, 1824])

  // Last, using after=true
  pn = f(false, e(1157), t(1828), true)
  expect([pn.prev.idApp, pn.next])
    .toStrictEqual([1828, undefined])

  // PINNED WITH NO POSITION

  // To existing pinned records
  pn = f(true, e(1157))
  expect([pn.prev.idApp, pn.next])
    .toStrictEqual([1830, undefined])

  // To an empty event
  pn = f(true, e(1159))
  expect([pn.prev, pn.next])
    .toStrictEqual([undefined, undefined])

  // To an empty event with non pinned records
  pn = f(true, e(1156))
  expect([pn.prev, pn.next])
    .toStrictEqual([undefined, undefined])

  // PINNED WITH POSITION

  // Between two records, using after=true
  pn = f(true, e(1157), t(1829), true)
  expect([pn.prev.idApp, pn.next.idApp])
    .toStrictEqual([1829, 1830])

  // Between two records, using after=false
  pn = f(true, e(1157), t(1830), false)
  expect([pn.prev.idApp, pn.next.idApp])
    .toStrictEqual([1829, 1830])

  // First, using after=false
  pn = f(true, e(1157), t(1829), false)
  expect([pn.prev, pn.next.idApp])
    .toStrictEqual([undefined, 1829])

  // Last, using after=true
  pn = f(true, e(1157), t(1830), true)
  expect([pn.prev.idApp, pn.next])
    .toStrictEqual([1830, undefined])

  // INCONSISTENT EVENT & TIME

  const msgInconsistentEventVStime =
    "Schedule.getTimeInsertPN(): The event 1159 have no time record 1830"

  // Last, using after=true with wrong event
  try {
    f(true, e(1159), t(1830), true)
  } catch (e) {
    expect(e.message).toBe(msgInconsistentEventVStime)
  }

  window.fetch.mockRestore()
})

test('Schedule.taskInsert 0731', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData003))

  const api = new MIMApi()
  const sched = new Schedule()
  sched.initByDBdata(await api.getAll())

  // Micro-service function
  const e = (id) => sched.events.getByidApp(id)
  const t = (id) => sched.timeRecs.getByidApp(id)


  // Inserting task to the schedule
  const task = sched.taskInsert(
    'Cool task',
    false
  )

  // Linking the task to the event by inserting time record
  const tins = sched.timeInsert(
    task.idApp,
    1156,
    1824,
    true,
    "00:10:00"
  )

  // Validate

  // Remove task id since it is different every time
  delete tins.task
  delete tins.time
  expect(tins).toStrictEqual({
    event: 1156,
    duration: 600000,
    title: 'Cool task',
    pinned: false,
    timeComplete: false,
    taskComplete: false,
    prev: 1824,
    next: 1825
  })

  window.fetch.mockRestore()
})

test('Schedule.createTask 0832', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData003))

  let taskCreated

  const api = new MIMApi()
  const sched = new Schedule()
  sched.initByDBdata(await api.getAll())

  // Inserting unpinned task to the schedule

  taskCreated = sched.createTask(
    'Cool task',
    false,
    1156
    )

  delete taskCreated.task
  delete taskCreated.time
  expect(taskCreated).toStrictEqual({
    event: 1156,
    duration: 600000,
    title: 'Cool task',
    pinned: false,
    timeComplete: false,
    taskComplete: false,
    prev: 1825,
    next: 1826
  })
  expect(sched.appState.events[0].time[2].title).toBe('Cool task')

  // Inserting unpinned task to the schedule

  taskCreated = sched.createTask(
    'Amazing',
    true,
    1156
    )

  expect(sched.appState.events[0].time[0].title).toBe('Amazing')
  delete taskCreated.task
  delete taskCreated.time
  expect(taskCreated).toStrictEqual({
    event: 1156,
    duration: 600000,
    title: 'Amazing',
    pinned: true,
    timeComplete: false,
    taskComplete: false,
    prev: null,
    next: null
  })

  window.fetch.mockRestore()
})

test('Schedule.createTask 0833', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData003))

  let taskCreated

  const api = new MIMApi()
  const sched = new Schedule()
  sched.initByDBdata(await api.getAll())

  // Inserting pinned task to the schedule

  taskCreated = sched.createTask(
    'Cool task',
    true,
    1157
    )

  delete taskCreated.task
  delete taskCreated.time
  expect(taskCreated).toStrictEqual({
    event: 1157,
    duration: 600000,
    title: 'Cool task',
    pinned: true,
    timeComplete: false,
    taskComplete: false,
    prev: 1830,
    next: null
  })
  expect(sched.appState.events[1].time[2].title).toBe('Cool task')

  // Inserting unpinned task to the schedule

  taskCreated = sched.createTask(
    'Amazing',
    true,
    1157,
    '00:20:00',
    1830,
    false
    )

  expect(sched.appState.events[1].time[1].title).toBe('Amazing')
  delete taskCreated.task
  delete taskCreated.time
  expect(taskCreated).toStrictEqual({
    event: 1157,
    duration: 1200000,
    title: 'Amazing',
    pinned: true,
    timeComplete: false,
    taskComplete: false,
    prev: 1829,
    next: 1830
  })

  window.fetch.mockRestore()
})

test('Schedule.createTask 0834', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData003))

  let taskCreated

  const api = new MIMApi()
  const sched = new Schedule()
  sched.initByDBdata(await api.getAll())

  // Inserting unpinned task to the schedule

  taskCreated = sched.createTask(
    'Cool task',
    false,
    1156
    )
  const newTaskID = taskCreated.task
  const newTimeID = taskCreated.time

  delete taskCreated.task
  delete taskCreated.time
  expect(taskCreated).toStrictEqual({
    event: 1156,
    duration: 600000,
    title: 'Cool task',
    pinned: false,
    timeComplete: false,
    taskComplete: false,
    prev: 1825,
    next: 1826
  })
  expect(sched.appState.events[0].time[2].title).toBe('Cool task')


  sched.tasks.onCreateSuccess(
    newTaskID,
    {...sched.tasks.dataDB[newTaskID]},
    {...sched.tasks.dataDB[newTaskID], 'id': 8888}
  )

  sched.timeRecs.onCreateSuccess(
    newTimeID,
    {...sched.timeRecs.dataDB[newTimeID]},
    {...sched.timeRecs.dataDB[newTimeID], 'id': 9999}
  )

  window.fetch.mockRestore()
})



test('Schedule.fit 0626', async ()=> {

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData003))

  const api = new MIMApi()
  const s = new Schedule()
  s.initByDBdata(await api.getAll())

  s.fit()

  expect(true).toBeTruthy()

  window.fetch.mockRestore()
})


test('ScheduleElementsSet.onCreateSuccess() 0727', async () => {

  let dataDBold, dataDBnew

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData003))

  const api = new MIMApi()
  const s = new Schedule()
  s.initByDBdata(await api.getAll())

  const t =
    s.createTask('Amazingly cool task', false, 1156)


  dataDBold = s.timeRecs.get(t.time).dataDB
  dataDBnew = {...dataDBold, 'id': 555}
  s.timeRecs.onCreateSuccess(t.time, dataDBold, dataDBnew)

  dataDBold = s.tasks.get(t.task).dataDB
  dataDBnew = {...dataDBold, 'id': 5555}
  s.tasks.onCreateSuccess(t.task, dataDBold, dataDBnew)

  const sCopy = s.copy()

  // TODO: Fix this results with assertions
  expect(sCopy.timeRecs.dataDB[1825]).toStrictEqual(
    {
      id: 1825,
      task: 499,
      event: 1156,
      prev: 1824,
      next: 555,
      duration: '00:30:00',
      complete: false
    })

  expect(sCopy.timeRecs.dataDB[555]).toStrictEqual(
  {
    id: 555,
    task: 5555,
    event: 1156,
    prev: 1825,
    next: 1826,
    duration: '00:10:00',
    complete: false
  })

  expect(sCopy.timeRecs.dataDB[1826]).toStrictEqual(
  {
    id: 1826,
    task: 499,
    event: 1157,
    prev: 555,
    next: 1827,
    duration: '00:30:00',
    complete: false
  })

  window.fetch.mockRestore()
})
