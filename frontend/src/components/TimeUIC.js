import React, { useState } from "react";
import {Draggable, Droppable} from "react-beautiful-dnd";
import ContentEditable from 'react-contenteditable';
import TaskPin from "./TaskPin";
import TaskTitleFldUIC from "./TaskTitleFldUIC";
import TaskPinnedFldUIC from "./TaskPinnedFldUIC";

function TaskCheckboxCompleteUIC(props){

  // Unpacking props
  const {updComplete, complete} = props;

  // Picking image in accordance with status
  const checkBoxImgClass = complete ?
    "task_checkbox_complete":"task_checkbox_uncomplete";

  // Render
  return (
    <img
      alt="Task checkbox Complete / To be done"
      className={checkBoxImgClass + " mr-2 rounded"}
      onClick={updComplete}
    />
  )
}

function TaskDurationFldUIC (props) {
  return (
    <div className="d-flex bd-highlight mr-1 mb-0 duration">
      <div
        className={"p-2 bd-highlight h5 text-prime duration-control "}
      >⊖</div>
      <ContentEditable className="p-2 bd-highlight duration"
        tagname='Duration'
        html={"00:10"}
        style={{cursor: "default",}}
      />
      <div
        className={"p-2 bd-highlight h5 text-prime duration-control"}
        onClick={() => true}
        >⊕</div>
    </div>
  )
}

function TaskControlsUIC(props) {
  return (
    <div
      className={"d-flex bd-highlight"}
      style={{cursor: "default"}}
    >
      <div
        className={"h5 ml-1 control_icon5"}
      >➤
      </div>
      <div
        className={"h5 ml-1 control_icon5"}
      >➠
      </div>
    </div>
  )
}

export function TimeUIC(props){
  const msg = '[TimeUIC()]'

  return (
    <div>
      <div className="media text-muted pt-1">
        <TaskCheckboxCompleteUIC updComplete={() => true} complete={false}/>

        <div className="media-body pb-1 mb-0 small border-bottom border-gray">
          <div className="d-flex mr-2 bd-highlight">

            <TaskTitleFldUIC
              timeId={props.time.id}
              title={props.time.title}
              scheduleManager={props.scheduleManager}
            />
            <TaskDurationFldUIC/>
            <TaskPinnedFldUIC
              pinned={props.time.pinned}
            />
            <TaskControlsUIC/>

          </div>
        </div>
      </div>
    </div>
  )
}

export function TimeDraggableUIC(props) {
  const msg = '[TimeDraggableUIC()]'

  return (
    <Draggable
      key={String(props.time.id)}
      draggableId={String(props.time.id)}
      index={props.index}>

      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <TimeUIC time={props.time} scheduleManager={props.scheduleManager}/>
        </div>
      )}

  </Draggable>

  )
}

export default function TimeListUIC(props) {
  const msg = '[TimeListUIC()]'

  // Generate the list with draggable Time Records
  const timeDraggables = props.timeRecs.map((ti, i) =>
    <TimeDraggableUIC
      key={ti.id}
      time={ti}
      index={i}
      scheduleManager={props.scheduleManager}
    />
  )

  return (
    <Droppable droppableId={String(props.eventId)}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
        >
          {timeDraggables}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}
