
const activities = {
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 88,
      "title": "Other",
      "feasibility": 1.0
    },
    {
      "id": 96,
      "title": "MIMA Dev",
      "feasibility": 1.0
    },
  ]
}


const events = {
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 109,
      "activity_id": 96,
      "google_calendar_id": "_6cok8chl6ss32b9k64p3eb9k74q3aba16d0k8ba668skagi4751j0di58o",
      "title": "MIMA Dev",
      "feasibility": 1.0,
      "start": "2020-07-06T06:00:00Z",
      "duration": "11:00:00"
    },
    {
      "id": 111,
      "activity_id": 96,
      "google_calendar_id": "_6gpjgd9k8grk6b9g8or4cb9k6t346ba26sr34ba164pk6e1j60rj0cpl6s",
      "title": "MIMA Dev",
      "feasibility": 1.0,
      "start": "2020-07-08T14:00:00Z",
      "duration": "03:00:00"
    },
    {
      "id": 110,
      "activity_id": 96,
      "google_calendar_id": "_8l1j8dpn8kskab9n6ork8b9k70q4ab9o6h1j4b9n750jcdhn84r44c1h6o",
      "title": "MIMA Dev",
      "feasibility": 1.0,
      "start": "2020-07-09T06:00:00Z",
      "duration": "11:00:00"
    }
  ]
}


const tasks = {
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 331,
      "event_id": 110,
      "project_id": null,
      "pinned": false,
      "title": "To-du-dsuzzzzms! OK - At least this is working : )",
      "duration": "00:10:00",
      "complete": false,
      "order": 1.0,
      "active": true
    },
    {
      "id": 333,
      "event_id": 111,
      "project_id": null,
      "pinned": false,
      "title": "And third",
      "duration": "00:10:00",
      "complete": false,
      "order": 1.0,
      "active": true
    },
    {
      "id": 334,
      "event_id": null,
      "project_id": null,
      "pinned": false,
      "title": "zero dark 32",
      "duration": "00:10:00",
      "complete": false,
      "order": 0.0,
      "active": true
    },
    {
      "id": 353,
      "event_id": null,
      "project_id": null,
      "pinned": false,
      "title": "I am very zero and ssoooo Dark!",
      "duration": "00:10:00",
      "complete": false,
      "order": 0.0,
      "active": true
    },
    {
      "id": 449,
      "event_id": 111,
      "project_id": null,
      "pinned": true,
      "title": "Just another task : )",
      "duration": "00:10:00",
      "complete": false,
      "order": 0.1,
      "active": true
    },
  ]
}


const timeRecords = {
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "task": 331,
      "event": 109,
      "duration": "00:10:00",
      "order": 1.0,
    },
    {
      "id": 2,
      "task": 333,
      "event_id": 109,
      "duration": "00:10:00",
      "order": 2.0,
    },
    {
      "id": 3,
      "task": 334,
      "event_id": 111,
      "duration": "00:10:00",
      "order": 1.0,
    },
  ]
}

const MIMApiTestData = {
  'https://mima.f15.dev/api/tasks/': tasks,
  'https://mima.f15.dev/api/events/': events,
  'https://mima.f15.dev/api/activities/': activities,
  'https://mima.f15.dev/api/time_records/': timeRecords,
}

export default MIMApiTestData;