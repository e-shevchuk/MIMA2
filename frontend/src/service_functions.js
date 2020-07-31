import moment from "moment";
require("moment-duration-format");

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

export function dictValidateID(data, key, msg){

    if (!data)
        throw new error('dictValidateNumber(data, key, msg): no data provided')

    if (!key)
        throw new error('dictValidateNumber(data, key, msg): no key provided')

  // If message isn't provided - make in empty
  msg = msg || ''

  // key is not provided
  if (!(key in data))
    throw new Error(msg + "'" + key + "' is not provided")

  // key value is not number and not convertable
  if (wrongID(data[key]))
    throw new Error(msg + "'" + key + "' is not correct")

  // // key value is not number and not convertable
  // if (!(Number(data[key]) > 0) || String(data[key]) === '0')
  //   throw new Error(msg + "'" + key + "' is not correct")
  //
}

export function wrongSinceNonStr(s) {
  return typeof(s) !== 'string'
}

export function wrongSinceEmptyStr(s) {
  return s.length === 0
}

export function dictValidateString(data, key, msg){

    if (!data)
        throw new error('dictValidateNumber(data, key, msg): no data provided')

    if (!key)
        throw new error('dictValidateNumber(data, key, msg): no key provided')

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

  if (moment(data[key])._f !== "YYYY-MM-DDTHH:mm:ssZ")
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
        throw new error('dictValidateNumber(data, key, msg): no data provided')

    if (!key)
        throw new error('dictValidateNumber(data, key, msg): no key provided')

  // If message isn't provided - make in empty
  msg = msg || ''

  // key is not provided
  if (!(key in data))
    throw new Error(msg + "'" + key + "' is not provided")

  if(typeof(data[key]) !== 'boolean')
    throw new Error(msg + "'" + key + "' wrong type")
}

export function dateStrUTCtoUnix (dateStr){
  const errPref = 'dateStrUTCtoUnix(): '

  if (moment(dateStr)._f !== "YYYY-MM-DDTHH:mm:ssZ")
    throw new Error(errPref + "wrong date format")

  return Number(moment(dateStr, "YYYY-MM-DDTHH:mm:ssZ")
    .format("x"))
}

export default getCookie;