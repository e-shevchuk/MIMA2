
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
  // --------------------------------- unused ----------------------------------
}
export const allTimeRecords = {
  1: {"id":1, "task":288, "event":109, "duration":"00:10:00", "complete":false},

  2: {"id":2, "task":1, "event": 1, "prev": null, "next": 3,    "duration":"00:30:00", "complete":false},
  3: {"id":3, "task":2, "event": 1, "prev": 2,    "next": 4,    "duration":"00:20:00", "complete":false},
  4: {"id":4, "task":2, "event": 2, "prev": 3,    "next": null, "duration":"00:20:00", "complete":false},
  5: {"id":5, "task":3, "event": 2, "prev": null, "next": 6,    "duration":"00:10:00", "complete":false},
  6: {"id":6, "task":4, "event": 2, "prev": 5,    "next": null, "duration":"01:40:00", "complete":false},
  // --------------------------------- unused ----------------------------------

}
