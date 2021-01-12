
export const allEvents = {
  "108": {
    "id": 108,
    "activity": 96,
    "google_calendar_id": "_6cok1j0di58o",
    "title": "MIMA Dev",
    "feasibility": 1,
    "start": "2020-07-01T04:00:00",
    "duration": "11:00:00"
  },

  "1": {
    "id": 1,
    "activity": 1,
    "google_calendar_id": "_6co51j0di58o",
    "title": "WorldTime cafe",
    "feasibility": 1,
    "start": "2020-07-01T05:00:00",
    "duration": "11:00:00",
    "prev": null,
    "next": 2,
  },
  "2": {
    "id": 2,
    "activity": 1,
    "google_calendar_id": "_8l1jcdhn84r44c1h6o",
    "title": "WorldTime cafe",
    "feasibility": 1,
    "start": "2020-07-01T06:00:00",
    "duration": "11:00:00",
    "prev": 1,
    "next": 3,
  },
  "3": {
    "id": 3,
    "activity": 1,
    "google_calendar_id": "_6gpl6s",
    "title": "WorldTime cafe",
    "feasibility": 1,
    "start": "2020-07-02T14:00:00",
    "duration": "03:00:00",
    "prev": 2,
    "next": null,
  },
}
export const allTasks = {
  "288": {
    "id": 288,
    "title": "288 Redirect & all the sh*t",
    "duration": "02:00:00",
    "pinned": false,
    "complete": false,
  },
  "1": {
    "id": 1,
    "title": "1 Redirect unlogged users to Google Auth",
    "duration": "00:30:00",
    "pinned": false,
    "complete": false,
  },
  "2": {
    "id": 2,
    "title": "2 Redirect unlogged users to Google Auth",
    "duration": "00:40:00",
    "pinned": false,
    "complete": false,
  },
  "3": {
    "id": 3,
    "title": "3 Redirect unlogged users to Google Auth",
    "duration": "00:10:00",
    "pinned": true,
    "complete": false,
  },
  "4": {
    "id": 4,
    "title": "4 Redirect unlogged users to Google Auth",
    "duration": "01:40:00",
    "pinned": true,
    "complete": false,
  },
}

export const allActivities = {
  96: {"id": 96, "title": "MIMA Dev"},
  1: {"id": 1, "title": "WorldTime cafe"},
  2: {"id": 2, "title": "Something useless"},
}
export const allTimeRecords = {
  1: {"id":1, "task":288, "event":109, "duration":"00:10:00", "complete":false},

  2: {"id":2, "task":1, "event": 1, "prev": null, "next": 3,    "duration":"00:30:00", "complete":false},
  3: {"id":3, "task":2, "event": 1, "prev": 2,    "next": 4,    "duration":"00:20:00", "complete":false},
  4: {"id":4, "task":2, "event": 2, "prev": 3,    "next": null, "duration":"00:20:00", "complete":false},
  5: {"id":5, "task":3, "event": 2, "prev": null, "next": 6,    "duration":"00:10:00", "complete":false},
  6: {"id":6, "task":4, "event": 2, "prev": 5,    "next": null, "duration":"01:40:00", "complete":false},
}


const activities3 = [
  {
    "id": 132,
    "title": "WorldTime cafe"
  },
  {
    "id": 134,
    "title": "WorldTime cafe"
  },
]

const events3 = [
  {
    "id": 1156,
    "prev": null,
    "next": 1157,
    "activity": 132,
    "google_calendar_id": "",
    "title": "WorldTime cafe",
    "start": "2020-08-07T17:12:11",
    "duration": "01:00:00"
  },
  {
    "id": 1157,
    "prev": 1156,
    "next": 1158,
    "activity": 132,
    "google_calendar_id": "",
    "title": "WorldTime cafe",
    "start": "2020-08-07T19:12:11",
    "duration": "01:00:00"
  },
  {
    "id": 1158,
    "prev": 1157,
    "next": 1160,
    "activity": 132,
    "google_calendar_id": "",
    "title": "WorldTime cafe",
    "start": "2020-08-07T19:12:11",
    "duration": "01:00:00"
  },
  {
    "id": 1159,
    "prev": null,
    "next": null,
    "activity": 134,
    "google_calendar_id": "",
    "title": "WorldTime cafe",
    "start": "2020-08-07T19:12:11",
    "duration": "01:00:00"
  },
  {
    "id": 1160,
    "prev": 1158,
    "next": null,
    "activity": 132,
    "google_calendar_id": "",
    "title": "WorldTime cafe",
    "start": "2020-08-07T19:12:11",
    "duration": "01:00:00"
  },
]

const tasks3 = [
  {
    "id": 498,
    "title": "Listen to music",
    "pinned": false,
    "duration": "00:30:00",
    "complete": true
  },
  {
    "id": 499,
    "title": "Drink a cup a cappuccino",
    "pinned": false,
    "duration": "00:40:00",
    "complete": true
  },
  {
    "id": 500,
    "title": "Make a todo list",
    "pinned": false,
    "duration": "00:10:00",
    "complete": true
  },
  {
    "id": 501,
    "title": "Produce genius idea",
    "pinned": false,
    "duration": "01:40:00",
    "complete": true
  },
  {
    "id": 502,
    "title": "New task 01",
    "pinned": false,
    "duration": "00:10:00",
    "complete": false
  },
  {
    "id": 503,
    "title": "New task 02",
    "pinned": false,
    "duration": "00:10:00",
    "complete": false
  },
  {
    "id": 504,
    "title": "New task 03(p)",
    "pinned": true,
    "duration": "00:10:00",
    "complete": false
  },
  {
    "id": 505,
    "title": "New task 04(p)",
    "pinned": true,
    "duration": "00:10:00",
    "complete": false
  },
]

const time3 = [
  {
    "id": 1824,
    "task": 498,
    "event": 1156,
    "prev": null,
    "next": 1825,
    "duration": "00:30:00",
    "complete": false
  },
  {
    "id": 1825,
    "task": 499,
    "event": 1156,
    "prev": 1824,
    "next": 1826,
    "duration": "00:30:00",
    "complete": false
  },
  {
    "id": 1826,
    "task": 499,
    "event": 1157,
    "prev": 1825,
    "next": 1827,
    "duration": "00:30:00",
    "complete": false
  },
  {
    "id": 1827,
    "task": 500,
    "event": 1157,
    "prev": 1826,
    "next": 1828,
    "duration": "00:30:00",
    "complete": false
  },
  {
    "id": 1828,
    "task": 501,
    "event": 1157,
    "prev": 1827,
    "next": null,
    "duration": "00:30:00",
    "complete": false
  },
  {
    "id": 1829,
    "task": 504,
    "event": 1157,
    "prev": null,
    "next": 1830,
    "duration": "00:10:00",
    "complete": false
  },
  {
    "id": 1830,
    "task": 505,
    "event": 1157,
    "prev": 1829,
    "next": null,
    "duration": "00:20:00",
    "complete": false
  },
]

const settings3 = [
  {
    "id": 9,
    "code": "google",
    "title": "Google Calendar sync",
    "value": "N"
  }
]

export const testData003 = {
  "events": events3,
  "activities": activities3,
  "tasks": tasks3,
  "timeRecs": time3,
  "settings": settings3,
}
