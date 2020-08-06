import Activity from "../Activity";
import Task from "../Task";

test('Constructor', ()=>{
  const activity = new Activity()
  expect(activity).toBeInstanceOf(Activity)
})

test('fromDBJSON() 01', ()=>{
  const json = '{"id": 96, "title": "MIMA Dev"}'
  const activity = Activity.fromDBJSON(json)
  expect(activity.id).toBe(96)
  expect(activity.dataDB.id).toBe(96)
})

test('fromDBJSON() 02', ()=>{
  const json = '{"title": "MIMA Dev"}'
  const msg = "Activity.initByDB(): 'id' is not provided"

  try {
    const activity = Activity.fromDBJSON(json)
  } catch (e) {
    expect(e.message).toBe(msg)
  }
})

test('fromDBJSON() 03', ()=>{
  const json = '{"id": 96}'
  const msg = "Activity.initByDB_DataFields(): 'title' is not provided"

  try {
    const activity = Activity.fromDBJSON(json)
  } catch (e) {
    expect(e.message).toBe(msg)
  }
})
