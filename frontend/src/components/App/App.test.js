import {
  allTasks, allEvents, allActivities, allTimeRecords
} from '../../App.test_data'

import React from 'react';
import { shallow } from 'enzyme';

jest.mock("../App.css", () => {})
import App from "../App";
import mockFetch from "../../Mocks";
import { softTime, eventStartCompare } from "../App";

// jest.spyOn(window, 'fetch').mockImplementation(mockFetch)

// Initializing app for testing
// const app = shallow(<App/>)
// app.setState({
//     'allEvents': allEvents,
//     'allTasks': allTasks,
//     'allActivities': allActivities,
//     'allTimeRecords': allTimeRecords,
//   })
// const appInstance = app.instance()

// ===========================        TESTS        =============================

test('Minimum one test', ()=>{
  expect(true).toBe(true)
})
