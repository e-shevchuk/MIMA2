import ScheduleManager from "../ScheduleManager";
import {allActivities, allTimeRecords, allEvents, allTasks, allSettings}
  from './ScheduleManager.test.data'

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


test('ScheduleManager.initByDBdata() 0303', () => {
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

