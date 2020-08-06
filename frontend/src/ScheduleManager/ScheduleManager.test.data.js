
export const allActivities = {
  301: {"id": 301, "title": "WorldTime cafe"},
  302: {"id": 302, "title": "Something useless"},
}

export const allEvents = {
  "101": {
    "id": 101,
    "prev": null,
    "next": 102,
    "activity_id": 301,
    "google_calendar_id": "_6co51j0di58o",
    "title": "WorldTime cafe",
    "start": "2020-07-01T05:00:00Z",
    "duration": "01:00:00",
  },
  "102": {
    "id": 102,
    "prev": 101,
    "next": 103,
    "activity_id": 301,
    "google_calendar_id": "_8l1jcdhn84r44c1h6o",
    "title": "WorldTime cafe",
    "start": "2020-07-01T06:00:00Z",
    "duration": "02:00:00",
  },
  "103": {
    "id": 103,
    "prev": 102,
    "next": null,
    "activity_id": 301,
    "google_calendar_id": "_6gpl6s",
    "title": "WorldTime cafe",
    "start": "2020-07-02T14:00:00Z",
    "duration": "03:00:00",
  },
}
export const allTasks = {
  "201": {
    "id": 201,
    "title": "Listen to music",
    "duration": "00:30:00",
    "pinned": false,
    "complete": false,
  },
  "202": {
    "id": 202,
    "title": "Drink a cup a cappuccino",
    "duration": "00:40:00",
    "pinned": false,
    "complete": false,
  },
  "203": {
    "id": 203,
    "title": "Make a todo list",
    "duration": "00:10:00",
    "pinned": true,
    "complete": false,
  },
  "204": {
    "id": 204,
    "title": "Produce genius idea",
    "duration": "01:40:00",
    "pinned": true,
    "complete": false,
  },
}
export const allTimeRecords = {
  402: {"id":402, "task":201, "event": 101, "prev": null, "next": 403,  "duration":"00:30:00", "complete":false},
  403: {"id":403, "task":202, "event": 101, "prev": 402,  "next": 404,  "duration":"00:20:00", "complete":false},
  404: {"id":404, "task":202, "event": 102, "prev": 403,  "next": null, "duration":"00:20:00", "complete":false},
  405: {"id":405, "task":203, "event": 102, "prev": null, "next": 406,  "duration":"00:10:00", "complete":false},
  406: {"id":406, "task":204, "event": 102, "prev": 405,  "next": null, "duration":"01:40:00", "complete":false},
}

export const allSettings = {
  501: {"id":501, "code": "min_dur", "title": "Minimal Time Record split size", "value": "00:20:00"},
}

const testData001 = {
  "events": allEvents,
  "activities": allActivities,
  "tasks": allTasks,
  "timeRecs": allTimeRecords,
}
export default testData001
