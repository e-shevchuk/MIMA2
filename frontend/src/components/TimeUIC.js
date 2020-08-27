import React from "react";
import {Draggable, Droppable} from "react-beautiful-dnd";
import ContentEditable from 'react-contenteditable';
import TaskPin from "./TaskPin";

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

function TaskTitleFldUIC (props){
  return (
    <ContentEditable
      tagname='Title'
      style={{cursor: "text",}}
      html={props.title}
    />
  )
}

function TaskDurationFldUIC (props) {
  return (
    <div className="d-flex bd-highlight mr-auto mb-0 duration">
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
      <div className={"p-2 ml-1 bd-highlight h5 text-prime duration-control"}>
          <TaskPin pinned={false} pinToggle={() => true}/>
      </div>
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
  return (
    <div>
      <div className="media text-muted pt-1">
        <TaskCheckboxCompleteUIC updComplete={() => true} complete={false}/>

        <div className="media-body pb-1 mb-0 small border-bottom border-gray">
          <div className="d-flex mr-2 bd-highlight">

            <TaskTitleFldUIC title={props.time.title}/>
            <TaskDurationFldUIC/>
            <TaskControlsUIC/>

          </div>
        </div>
      </div>
    </div>
  )
}

export function TimeDraggableUIC(props) {
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
          <TimeUIC time={props.time}/>
        </div>
      )}

  </Draggable>

  )
}

export default function TimeListUIC(props) {

  // Generate the list with draggable Time Records
  const timeDraggables = props.timeRecs.map((ti, i) =>
    <TimeDraggableUIC key={ti.id} time={ti} index={i}/>
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
