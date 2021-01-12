import ContentEditable from "react-contenteditable";
import React, { Component, useState, useEffect } from "react";
import APIsecretary from "../APIsecretary";


export default function TaskTitleFldUIC (props){
  const msg = '[TaskTitleFldUIC.render()]'

  const [titleUpdDelay, stu] = useState(new APIsecretary(2000))

  function titleUpdate(title){
    props.scheduleManager.updTaskTitleByTime(props.timeId, title)
  }

  function titleChange(e){
    titleUpdDelay.schedule(
      'title', 0, titleUpdate, e.target.value)
  }

  function createTaskBelow() {
    const title = '***'
    const time = props.scheduleManager.current.timeRecs.getByidApp(props.timeId)
    const pinned = time.task.pinned
    const eventAppID = time.event.idApp

    props.scheduleManager.createTask(
      title, pinned, eventAppID, undefined, props.timeId
    )
  }

  function keyDownScenarios(e) {

    // Enter
    if(e.keyCode === 13) {
      e.preventDefault()
      createTaskBelow()
    }
  }

  return (
    <ContentEditable
      tagname='Title'
      style={{cursor: "text",}}
      html={props.title}
      onChange={titleChange}
      onKeyDown={keyDownScenarios}
    />
  )
}
