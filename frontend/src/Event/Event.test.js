import Event from "../Event";
import { allEvents } from "../App.test_data";
import moment from "moment";

test('Event.Constructor', ()=>{
  const event = new Event()
  expect(event).toBeInstanceOf(Event)
})

test('Event.fromDBJSON() 01', ()=>{
  let dataWhole = {...allEvents[108]}
  const json = JSON.stringify(dataWhole)
  const event = Event.fromDBJSON(json)
  // ID
  expect(event.id).toBe(108)
  //Title
  expect(event.title).toBe('MIMA Dev')
  // Start
  const dateMomUTC = moment(event.start, 'x').utc()
  const rg = RegExp('\\+00:00')
  const dateMomUTCStr = dateMomUTC.format("YYYY-MM-DDTHH:mm:ssZ")
  const dateMomUTCStrZ = dateMomUTCStr.replace(rg, 'Z')
  expect(dateMomUTCStrZ).toBe(JSON.parse(json).start)
  // Duration
  expect(event.duration).toBe(39600000)
  expect(event.dataDB.id).toBe(108)
})

test('Event.fromDBJSON() 02', ()=>{
  const json = '{"title": "MIMA Dev"}'
  const msg = "Event.initByDB(): 'id' is not provided"

  try {
    const event = Event.fromDBJSON(json)
  } catch (e) {
    expect(e.message).toBe(msg)
  }
})

test('Event.fromDBJSON() 03', ()=>{
  const json = '{"id": 96}'
  const msg = "Event.initByDB_DataFields(): 'title' is not provided"

  try {
    const event = Event.fromDBJSON(json)
  } catch (e) {
    expect(e.message).toBe(msg)
  }
})

test('Event.fromDBJSON() 04', ()=>{
  const json = '{"title": "MIMA Dev", "id": ""}'
  const msg = "Event.initByDB(): 'id' is not correct"

  try {
    const event = Event.fromDBJSON(json)
  } catch (e) {
    expect(e.message).toBe(msg)
  }
})
