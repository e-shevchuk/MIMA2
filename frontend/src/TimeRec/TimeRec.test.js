import TimeRec from "../TimeRec";
import {allTasks, allTimeRecords} from '../App.test_data'
import Task from "../Task";

test('Constructor', ()=>{

  const tr = new TimeRec()

  expect(tr).toBeInstanceOf(TimeRec)
})

test('Simple properties', ()=>{

  const dataWhole = {...allTimeRecords[1]}
  const tr = new TimeRec()

  tr.complete = dataWhole.complete
  tr.duration = 7200000

  expect(tr.duration).toBe(7200000)
  expect(tr.complete).toBe(dataWhole.complete)
})

test('fromDBJSON() 01', ()=>{
  const dataWhole = {...allTimeRecords[1]}
  const json = JSON.stringify(dataWhole)
  const timeRec = TimeRec.fromDBJSON(json)
  // ID
  expect(timeRec.id).toBe(1)
  // Duration
  expect(timeRec.duration).toBe(600000)
  // Complete
  expect(timeRec.complete).toBe(false)
  // Data from DB
  expect(timeRec.dataDB.id).toBe(1)
})

test('fromDBJSON() 02', ()=>{
  const msg = "TimeRec.fromDBJSON(): 'id' is not provided"

  const dataWhole = {...allTimeRecords[1]}
  delete dataWhole.id
  const json = JSON.stringify(dataWhole)

  expect.assertions(1)
  try {
    const timeRec = TimeRec.fromDBJSON(json)
  } catch (e) {
    expect(e.message).toBe(msg)
  }
})

test('fromDBJSON() 03', ()=>{
  const msg = "TimeRec.fromDBJSON(): 'duration' is not provided"

  const dataWhole = {...allTimeRecords[1]}
  delete dataWhole.duration
  const json = JSON.stringify(dataWhole)

  expect.assertions(1)
  try {
    const timeRec = TimeRec.fromDBJSON(json)
  } catch (e) {
    expect(e.message).toBe(msg)
  }
})
