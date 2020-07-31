import { dictValidateID, dictValidateString, dictValidateDate,
  dictValidateDuration, dateStrUTCtoUnix} from "../service_functions"

// validate number

test('dictValidateNumber() 01', ()=>{
  expect.assertions(1)
  try {
    dictValidateID({"id": "", "title": "MIMA Dev"}, 'id')
  } catch (e) {
    expect(e.message).toBe("'id' is not correct")
  }
})

test('dictValidateNumber() 02', ()=>{
  expect.assertions(1)
  try {
    dictValidateID({"title": "MIMA Dev"}, 'id')
  } catch (e) {
    expect(e.message).toBe("'id' is not provided")
  }
})

// validate string

test('dictValidateString() 01', ()=>{
  expect.assertions(0)
  try {
    dictValidateString({"id": 10, "title": "MIMA Dev"}, 'title')
  } catch (e) {
    expect(e.message).toBe("'title' is not provided")
  }
})

test('dictValidateString() 02', ()=>{
  expect.assertions(1)
  try {
    dictValidateString({"id": 10, "title": ""}, 'title')
  } catch (e) {
    expect(e.message).toBe("'title' is empty")
  }
})

test('dictValidateString() 03', ()=>{
  expect.assertions(1)
  try {
    dictValidateString({"id": 10, "title": ["MIMA Dev"]}, 'title')
  } catch (e) {
    expect(e.message).toBe("'title' is not correct")
  }
})

// validate date

test('dictValidateDate() 01', ()=>{
  expect.assertions(0)
  try {
    dictValidateDate({"id": 10, "start": "2020-07-01T05:00:00Z"}, 'start')
  } catch (e) {
    expect(e.message).toBe("'start' is not provided")
  }
})

test('dictValidateDate() 02', ()=>{
  expect.assertions(1)
  try {
    dictValidateDate({"id": 10}, 'start')
  } catch (e) {
    expect(e.message).toBe("'start' is not provided")
  }
})

test('dictValidateDate() 03', ()=>{
  expect.assertions(1)
  try {
    dictValidateDate({"id": 10, "start": ""}, 'start')
  } catch (e) {
    expect(e.message).toBe("'start' is empty")
  }
})

test('dictValidateDate() 04', ()=>{
  expect.assertions(1)
  const date = "2020-07-01T05:00:00"
  try {
    dictValidateDate({"id": 10, "start": date}, 'start')
  } catch (e) {
    expect(e.message).toBe("'start' has wrong format")
  }
})

// validate duration

test('dictValidateDuration() 01', ()=>{
  expect.assertions(0)
  try {
    dictValidateDuration({"id": 10, "duration": "01:05:00"}, 'duration')
  } catch (e) {
    expect(e.message).toBe("'duration' is not provided")
  }
})

test('dictValidateDuration() 02', ()=>{
  expect.assertions(1)
  try {
    dictValidateDuration({"id": 10}, 'duration')
  } catch (e) {
    expect(e.message).toBe("'duration' is not provided")
  }
})

test('dictValidateDuration() 03', ()=>{
  expect.assertions(1)
  try {
    dictValidateDuration({"id": 10, "duration": ""}, 'duration')
  } catch (e) {
    expect(e.message).toBe("'duration' is empty")
  }
})

test('dictValidateDuration() 04', ()=>{
  expect.assertions(1)
  try {
    dictValidateDuration({"id": 10, "duration": "01:05:0"}, 'duration')
  } catch (e) {
    expect(e.message).toBe("'duration' has wrong format")
  }
})

test('dictValidateDuration() 05', ()=>{
  expect.assertions(1)
  try {
    dictValidateDuration({"id": 10, "duration": "01:05"}, 'duration')
  } catch (e) {
    expect(e.message).toBe("'duration' has wrong format")
  }
})

test('dateStrUTCtoUnix() 01', ()=>{
  expect(dateStrUTCtoUnix('2020-07-02T14:00:00Z'))
    .toBe(1593698400000)
})

test('dateStrUTCtoUnix() 02', ()=>{
  expect.assertions(1)
  try {
    dateStrUTCtoUnix('2020-07-02T14:00:00')
  } catch (e) {
    expect(e.message).toBe('dateStrUTCtoUnix(): wrong date format')
  }
})

