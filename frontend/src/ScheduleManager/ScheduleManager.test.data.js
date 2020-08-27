
export const allActivities = [
  {"id": 301, "title": "WorldTime cafe"},
  {"id": 302, "title": "Something useless"}
]

export const allEvents = [
  {
    "id": 101,
    "prev": null,
    "next": 102,
    "activity": 301,
    "google_calendar_id": "_6co51j0di58o",
    "title": "WorldTime cafe",
    "start": "2020-07-01T05:00:00",
    "duration": "01:00:00",
  },
  {
    "id": 102,
    "prev": 101,
    "next": 103,
    "activity": 301,
    "google_calendar_id": "_8l1jcdhn84r44c1h6o",
    "title": "WorldTime cafe",
    "start": "2020-07-01T06:00:00",
    "duration": "02:00:00",
  },
  {
    "id": 103,
    "prev": 102,
    "next": null,
    "activity": 301,
    "google_calendar_id": "_6gpl6s",
    "title": "WorldTime cafe",
    "start": "2020-07-02T14:00:00",
    "duration": "03:00:00",
  },
]

export const allTasks = [
  {
    "id": 201,
    "title": "Listen to music",
    "duration": "00:30:00",
    "pinned": false,
    "complete": false,
  },
  {
    "id": 202,
    "title": "Drink a cup a cappuccino",
    "duration": "00:40:00",
    "pinned": false,
    "complete": false,
  },
  {
    "id": 203,
    "title": "Make a todo list",
    "duration": "00:10:00",
    "pinned": true,
    "complete": false,
  },
  {
    "id": 204,
    "title": "Produce genius idea",
    "duration": "01:40:00",
    "pinned": true,
    "complete": false,
  },
]

export const allTimeRecords = [
  {"id":402, "task":201, "event": 101, "prev": null, "next": 403,  "duration":"00:30:00", "complete":false},
  {"id":403, "task":202, "event": 101, "prev": 402,  "next": 404,  "duration":"00:20:00", "complete":false},
  {"id":404, "task":202, "event": 102, "prev": 403,  "next": null, "duration":"00:20:00", "complete":false},
  {"id":405, "task":203, "event": 102, "prev": null, "next": 406,  "duration":"00:10:00", "complete":false},
  {"id":406, "task":204, "event": 102, "prev": 405,  "next": null, "duration":"01:40:00", "complete":false},
]

export const allSettings = [
  {"id":501, "code": "min_dur", "title": "Minimal Time Record split size", "value": "00:20:00"},
]

const testData001 = {
  "events": allEvents,
  "activities": allActivities,
  "tasks": allTasks,
  "timeRecs": allTimeRecords,
  "settings": allSettings,
}

export default testData001

export const stateUpdParams001 = {
  "events": [
    {
      "id": 101,
      "activityId": 301,
      "title": "WorldTime cafe",
      "feasibility": 1,
      "start": 1593568800000,
      "duration": 3600000,
      "time": [
        {
          "id": 402,
          "duration": 1800000,
          "title": "Listen to music",
          "pinned": false,
          "timeComplete": false,
          "taskComplete": false,
        },
        {
          "id": 403,
          "duration": 1200000,
          "title": "Drink a cup a cappuccino",
          "pinned": false,
          "timeComplete": false,
          "taskComplete": false,
        },
      ],
    },
    {
      "id": 102,
      "activityId": 301,
      "title": "WorldTime cafe",
      "feasibility": 1,
      "start": 1593572400000,
      "duration": 7200000,
      "time": [
        {
          "id": 405,
          "duration": 600000,
          "title": "Make a todo list",
          "pinned": true,
          "timeComplete": false,
          "taskComplete": false,
        },
        {
          "id": 406,
          "duration": 6000000,
          "title": "Produce genius idea",
          "pinned": true,
          "timeComplete": false,
          "taskComplete": false,
        },
        {
          "id": 404,
          "duration": 1200000,
          "title": "Drink a cup a cappuccino",
          "pinned": false,
          "timeComplete": false,
          "taskComplete": false,
        },
      ],
    },
    {
      "id": 103,
      "activityId": 301,
      "title": "WorldTime cafe",
      "feasibility": 1,
      "start": 1593687600000,
      "duration": 10800000,
      "time": [],
    },
  ]
}

