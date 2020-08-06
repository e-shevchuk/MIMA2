const events = [
  {
    "id": 1156,
    "prev": null,
    "next": 1157,
    "activity": 132,
    "google_calendar_id": "",
    "title": "WorldTime cafe",
    "start": "2020-08-07T17:12:11.140288Z",
    "duration": "01:00:00"
  },
  {
    "id": 1157,
    "prev": 1156,
    "next": null,
    "activity": 132,
    "google_calendar_id": "",
    "title": "WorldTime cafe",
    "start": "2020-08-07T19:12:11.140288Z",
    "duration": "01:00:00"
  }
]

const activities = [
  {
    "id": 132,
    "title": "WorldTime cafe"
  }
]

const tasks = [
  {
    "id": 498,
    "title": "Listen to music",
    "pinned": true,
    "duration": "00:30:00",
    "complete": true
  },
  {
    "id": 499,
    "title": "Drink a cup a cappuccino",
    "pinned": true,
    "duration": "00:40:00",
    "complete": true
  },
  {
    "id": 500,
    "title": "Make a todo list",
    "pinned": true,
    "duration": "00:10:00",
    "complete": true
  },
  {
    "id": 501,
    "title": "Produce genius idea",
    "pinned": true,
    "duration": "01:40:00",
    "complete": true
  }
]

const time = [
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
  }
]

const testData002 = {
  "events": events,
  "activities": activities,
  "tasks": tasks,
  "timeRecs": time,
}
export default testData002

