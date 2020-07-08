const initialData = {
  activities: {
    "activity_1": {
      "id": "activity_1",
      key: "activity_1",
      title: "BK Operations",
      events: ["12", "13", "14"]
    }
  },
  events:[
    {
      id: "12",
      "title": "Move it, move it!",
      "date": "22.06",
      "time": "14:30",
      "duration_hours": "1h",
      "duration_min": "10m",
      tasks: ["1", "2", "5"]
    },
    {
      id: "13",
      "title": "Dance whole night :)",
      "date": "23.06",
      "time": "11:30",
      "duration_hours": "",
      "duration_min": "20m",
      tasks: ["3"]
    },
    {
      id: "14",
      "title": "Look into the mirror and smile :)",
      "date": "23.06",
      "time": "11:30",
      "duration_hours": "",
      "duration_min": "20m",
      tasks: ["9", "10", "11"]
    }
  ],
  tasks: {
    "1": {
      id: "1",
      "user_id": "1",
      "event_id": 3,
      "project_id": null,
      "title": "Kus-kus sweet popoziab",
      "duration": "00:10",
      "complete": false,
      "order": 0,
      "active": true
    },
    "2": {
      id: "2",
      "user_id": "2",
      "event_id": 3,
      "project_id": null,
      "title": "Troll little Koziab a bit",
      "duration": "00:10",
      "complete": false,
      "order": 0,
      "active": true
    },
    "3": {
      id: "3",
      "user_id": "3",
      "event_id": 3,
      "project_id": null,
      "title": "Reach for the sky",
      "duration": "00:10",
      "complete": false,
      "order": 0,
      "active": true
    },
    "5": {
      id: "5",
      "user_id": "3",
      "event_id": 3,
      "project_id": null,
      "title": "Dance under the rain",
      "duration": "00:10",
      "complete": false,
      "order": 0,
      "active": true
    }
  }
}

window.initialData = initialData;

export default initialData;