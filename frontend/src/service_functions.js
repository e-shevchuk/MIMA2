import moment from "moment";
require("moment-duration-format");

// CONSTANTS

export const DAYTIMEFORMAT = "YYYY-MM-DDTHH:mm:ss"

// FUNCTIONS

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
    return cookieValue;
}

/**
 * @param {Number} n
 *
 * @returns {boolean} true, if value is convertable into number > 0
 */
export function wrongID(n) {
  return !(Number(n) > 0) || (String(n) === '0' || String(n) === '0.0')
}

/**
 * Validate that:
 * - provided object has a specified key
 * - specified key meets the ID requirements
 *
 * @param {{}} data - Object dictionary
 * @param {Number} key - Object key
 * @param {Number} msg - Parent function description
 *
 * @returns {boolean} true, if value is convertable into number > 0
 */
export function dictValidateID(data, key, msg){

    if (!data)
        throw new Error('dictValidateID(data, key, msg): no data provided')

    if (!key)
        throw new Error('dictValidateID(data, key, msg): no key provided')

  // If message isn't provided - make in empty
  msg = msg || ''

  // key is not provided
  if (!(key in data))
    throw new Error(msg + "'" + key + "' is not exists")

  // key value is not number and not convertable
  if (wrongID(data[key]))
    throw new Error(msg + "'" + key + "' is not correct")
}

export function wrongSinceNonStr(s) {
  return typeof(s) !== 'string'
}

export function wrongSinceEmptyStr(s) {
  return s.length === 0
}

export function dictValidateString(data, key, msg){

    if (!data)
        throw new Error('dictValidate...(data, key, msg): no data provided')

    if (!key)
        throw new Error('dictValidate...(data, key, msg): no key provided')

  // If message isn't provided - make in empty
  msg = msg || ''

  // key is not provided
  if (!(key in data))
    throw new Error(msg + "'" + key + "' is not provided")

  // key value length is not a string
  if (wrongSinceNonStr(data[key]))
    throw new Error(msg + "'" + key + "' is not correct")

  // key value is an empty string
  if (wrongSinceEmptyStr(data[key]))
    throw new Error(msg + "'" + key + "' is empty")

  // // key value length is not a string
  // if (typeof(data[key]) !== 'string')
  //   throw new Error(msg + "'" + key + "' is not correct")
  //
  // // key value is an empty string
  // if (data[key].length === 0)
  //   throw new Error(msg + "'" + key + "' is empty")
}

export function dictValidateDate(data, key, msg){

    if (!data)
        throw new error('dictValidateNumber(data, key, msg): no data provided')

    if (!key)
        throw new error('dictValidateNumber(data, key, msg): no key provided')

  // If message isn't provided - make in empty
  msg = msg || ''

  // key is not provided
  if (!(key in data))
    throw new Error(msg + "'" + key + "' is not provided")

  if (data[key].length === 0)
    throw new Error(msg + "'" + key + "' is empty")

  if (moment(data[key])._f !== DAYTIMEFORMAT)
    throw new Error(msg + "'" + key + "' has wrong format")

}

export function dictValidateDuration(data, key, msg){

    if (!data)
        throw new error('dictValidateNumber(data, key, msg): no data provided')

    if (!key)
        throw new error('dictValidateNumber(data, key, msg): no key provided')

  // If message isn't provided - make in empty
  msg = msg || ''

  // key is not provided
  if (!(key in data))
    throw new Error(msg + "'" + key + "' is not provided")

  if (data[key].length === 0)
    throw new Error(msg + "'" + key + "' is empty")

  if (moment.duration(data[key]).format('hh:mm:ss', {trim:false}) !== data[key])
    throw new Error(msg + "'" + key + "' has wrong format")
}

export function dictValidateBoolean(data, key, msg){

    if (!data)
        throw new error('dictValidateBoolean(data, key, msg): no data provided')

    if (!key)
        throw new error('dictValidateBoolean(data, key, msg): no key provided')

  // If message isn't provided - make in empty
  msg = msg || ''

  // key is not provided
  if (!(key in data))
    throw new Error(msg + "'" + key + "' is not provided")

  if(typeof(data[key]) !== 'boolean')
    throw new Error(msg + "'" + key + "' wrong type")
}

export function dictValidateKeys(data, keys, msg){

    if (!data)
        throw new error('dictValidateKeys(data, keys, msg): no data provided')

    if (!keys || keys.length === 0)
        throw new error('dictValidateKeys(data, keys, msg): no keys provided')

  // If message isn't provided - make it empty
  msg = msg || ''

  // Add all missing keys to the list
  let keysMissing = []
  keys.map(k => {
    if(!(k in data))
      keysMissing.push(k)
  })

  if (keysMissing.length > 0)
    throw new Error(msg + "missing keys: " + keysMissing.join(', '))

}

export function dateStrUTCtoUnix (dateStr){
  const msg = 'dateStrUTCtoUnix(): '

  if (moment(dateStr)._f !== DAYTIMEFORMAT)
    throw new Error(msg + "wrong date format")

  const dateStrX = Number(moment(dateStr, DAYTIMEFORMAT).format('x'))

  return dateStrX
}

export function jsonValidate(str, msg) {
    try {
        JSON.parse(str);
    } catch (e) {
      throw new Error(msg + "Wrong JSON format: " + str)
    }
}

export function sortPrevNextListForEvent(l) {

  // If the list is empty
  if (l.length === 0)
    // Do nothing
    return []

  // ALGORITHM INITIALIZATIONS

  let first, ptr, eventCurrent, order
  const lSorted = [...l]

  // ALGORITHM

  // Save current event value, to make sure we work within current event
  eventCurrent = l[0].event

  // Let's find the first element in this connected list

  // Pick any element of the list (index=0 will do)
  first = l[0]
  // Go from picked element "up" while it is the eventCurrent and we 'can'
  while(first.prev && first.prev.event === eventCurrent){
    // If this element has 'prev', assign begin to be 'prev'
    first = first.prev
  }

  // So we've found the first element in the list => set each element order now

  // Set pointer to the first element and it's order to 1
  ptr = first
  order = 1
  ptr.order = order

  // If there are next element
  while(ptr.next && ptr.next.event === eventCurrent) {
    // Update the next element with incremented order
    order++
    ptr = ptr.next
    ptr.order = order
  }

  // Now sort the list using update order values
  lSorted.sort((a, b) => a.order > b.order ? 1 : -1)

  return lSorted

}


/**
 * Awaits untill all promisest were resolved
**/
export const flushPromises = () => {
  return new Promise(resolve => setImmediate(resolve));
}



export default getCookie
