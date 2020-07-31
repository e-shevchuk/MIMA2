import ScheduleManager from "../ScheduleManager";

test('At least one test', ()=>{

  const sm = new ScheduleManager( undefined,
                                  undefined,
                                  undefined)

  expect(sm).toBeInstanceOf(ScheduleManager)
})
