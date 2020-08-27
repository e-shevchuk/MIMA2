import {
  dictValidateID, dictValidateString, dictValidateDate,
  dictValidateDuration, dateStrUTCtoUnix, sortPrevNextListForEvent
} from "../service_functions"

// validate number

test('dictValidateID() 0101', ()=>{
  expect.assertions(1)
  try {
    dictValidateID({"id": "", "title": "MIMA Dev"}, 'id')
  } catch (e) {
    expect(e.message).toBe("'id' is not correct")
  }
})

test('dictValidateID() 0202', ()=>{
  expect.assertions(1)
  try {
    dictValidateID({"title": "MIMA Dev"}, 'id')
  } catch (e) {
    expect(e.message).toBe("'id' is not exists")
  }
})

// validate string

test('dictValidateString() 0103', ()=>{
  expect.assertions(0)
  try {
    dictValidateString({"id": 10, "title": "MIMA Dev"}, 'title')
  } catch (e) {
    expect(e.message).toBe("'title' is not provided")
  }
})

test('dictValidateString() 0204', ()=>{
  expect.assertions(1)
  try {
    dictValidateString({"id": 10, "title": ""}, 'title')
  } catch (e) {
    expect(e.message).toBe("'title' is empty")
  }
})

test('dictValidateString() 0305', ()=>{
  expect.assertions(1)
  try {
    dictValidateString({"id": 10, "title": ["MIMA Dev"]}, 'title')
  } catch (e) {
    expect(e.message).toBe("'title' is not correct")
  }
})

// validate date

test('dictValidateDate() 0106', ()=>{
  expect.assertions(0)
  try {
    dictValidateDate({"id": 10, "start": "2020-07-01T05:00:00"}, 'start')
  } catch (e) {
    expect(e.message).toBe("'start' is not provided")
  }
})

test('dictValidateDate() 0207', ()=>{
  expect.assertions(1)
  try {
    dictValidateDate({"id": 10}, 'start')
  } catch (e) {
    expect(e.message).toBe("'start' is not provided")
  }
})

test('dictValidateDate() 0308', ()=>{
  expect.assertions(1)
  try {
    dictValidateDate({"id": 10, "start": ""}, 'start')
  } catch (e) {
    expect(e.message).toBe("'start' is empty")
  }
})

test('dictValidateDate() 0409', ()=>{
  expect.assertions(1)
  const date = "2020-07-01T05:00:00Z"
  try {
    dictValidateDate({"id": 10, "start": date}, 'start')
  } catch (e) {
    expect(e.message).toBe("'start' has wrong format")
  }
})

// validate duration

test('dictValidateDuration() 0110', ()=>{
  expect.assertions(0)
  try {
    dictValidateDuration({"id": 10, "duration": "01:05:00"}, 'duration')
  } catch (e) {
    expect(e.message).toBe("'duration' is not provided")
  }
})

test('dictValidateDuration() 0211', ()=>{
  expect.assertions(1)
  try {
    dictValidateDuration({"id": 10}, 'duration')
  } catch (e) {
    expect(e.message).toBe("'duration' is not provided")
  }
})

test('dictValidateDuration() 0312', ()=>{
  expect.assertions(1)
  try {
    dictValidateDuration({"id": 10, "duration": ""}, 'duration')
  } catch (e) {
    expect(e.message).toBe("'duration' is empty")
  }
})

test('dictValidateDuration() 0413', ()=>{
  expect.assertions(1)
  try {
    dictValidateDuration({"id": 10, "duration": "01:05:0"}, 'duration')
  } catch (e) {
    expect(e.message).toBe("'duration' has wrong format")
  }
})

test('dictValidateDuration() 0514', ()=>{
  expect.assertions(1)
  try {
    dictValidateDuration({"id": 10, "duration": "01:05"}, 'duration')
  } catch (e) {
    expect(e.message).toBe("'duration' has wrong format")
  }
})

test('dateStrUTCtoUnix() 0115', ()=>{
  expect(dateStrUTCtoUnix('2020-07-02T14:00:00'))
    .toBe(1593687600000)
})

test('dateStrUTCtoUnix() 0216', ()=>{
  expect.assertions(1)
  try {
    dateStrUTCtoUnix('2020-07-02T14:00:00Z')
  } catch (e) {
    expect(e.message).toBe('dateStrUTCtoUnix(): wrong date format')
  }
})

test('sortPrevNextListForEvent() 0117', () => {

  // Creating a list to sort
  const a1 = {}, a2 = {}, a3 = {}, a4 = {}, a5 = {}, a6 = {}, a7 = {}
  a1['v'] = '1'
  a2['v'] = '2'
  a3['v'] = '3'
  a4['v'] = '4'
  a5['v'] = '5'
  a6['v'] = '6'
  a7['v'] = '7'
  a1['event'] = '2323333r'
  a2['event'] = '2323r'
  a3['event'] = '2323r'
  a4['event'] = '2323r'
  a5['event'] = '2323r'
  a6['event'] = '2323r'
  a7['event'] = '2324423r'


  a1.prev = undefined
  a1.next = a2
  a2.prev = a1
  a2.next = a3
  a3.prev = a2
  a3.next = a4
  a4.prev = a3
  a4.next = a5
  a5.prev = a4
  a5.next = a6
  a6.prev = a5
  a6.next = a7
  a7.prev = a6
  a7.next = undefined

  let a_unsorted = [a2, a5, a6, a4, a3]
  let a_sorted = sortPrevNextListForEvent(a_unsorted)
  let a_sorted_concat = ''.concat(a_sorted.map(ae => ae.v))
  expect(a_sorted_concat).toBe('2,3,4,5,6')

  a_unsorted = [a1]
  a_sorted = sortPrevNextListForEvent(a_unsorted)
  a_sorted_concat = ''.concat(a_sorted.map(ae => ae.v))
  expect(a_sorted_concat).toBe('1')

  a_unsorted = [a7]
  a_sorted = sortPrevNextListForEvent(a_unsorted)
  a_sorted_concat = ''.concat(a_sorted.map(ae => ae.v))
  expect(a_sorted_concat).toBe('7')

})