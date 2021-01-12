import TimeRec from "../TimeRec";
import {allTasks, allTimeRecords} from '../App.test_data'
import Task from "../Task";
import {testData003} from "../Schedule/Schedule.test.data";
import {mockFetchGetWithData} from "../Mocks";
import MIMApi from "../MIMApi";
import Schedule from "../Schedule";

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

test('fromDBJSON() 0101', ()=>{
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

test('fromDBJSON() 0202', ()=>{
  const msg = "TimeRec.initByDB(): 'id' is not exists"

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

test('fromDBJSON() 0303', ()=>{
  const msg = "TimeRec.initByDB_DataFields(): 'duration' is not provided"

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

test('fromDBJSON() 0404', async ()=>{
  const msg = "fromDBJSON() 0404"

  jest.spyOn(window, 'fetch')
    .mockImplementation(mockFetchGetWithData(testData003))

  const api = new MIMApi()
  const s = new Schedule()
  s.initByDBdata(await api.getAll())
  s.fit()

  window.fetch.mockRestore()
  const timeRec = s.timeRecs.getByidDB(1824)

  // console.log(msg, timeRec.dataDB)
  // timeRec.dataDB.next = 1
  // console.log(msg, timeRec.dataDB)
  // console.log(msg, s.timeRecs.dataDB)
})
