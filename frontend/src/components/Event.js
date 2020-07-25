import React, {Component} from "react";
import {Draggable, Droppable} from "react-beautiful-dnd";
import Task from "./Task";
import moment from 'moment';
import Moment from 'react-moment';


class Event extends Component {
  constructor(props) {
    super(props);

    this.ref = React.createRef();
    this.props.appRefs.event[this.props.id] = this.ref;
  }

  componentDidMount() {
    if (this.props.id === 20) this.ref.current.focus();
  }

  render() {

    // UNPACK VALUES

    const {
      allTasks, getTask, filterActivity, overSheduled, duration, tasksByEventId,
      timeRecords
    } = this.props;

    const taskNewIndex = tasksByEventId.length;
    const taskCreate = () => this.props.taskCreate(taskNewIndex);


    const durationHours = moment.duration(duration).hours('h');
    const durationMinutes = moment.duration(duration).minutes();
    const leftSign = Math.sign(overSheduled())
    const leftHours = Math.floor(Math.abs(overSheduled()) / 60);
    const leftMinutes = Math.abs(overSheduled()) % 60;

    return (
      <div
        ref={this.ref}
      >
        {/* EVENT BLOCK START */}

        <div
          className="new-day my-3 p-2 shadow-sm"
          style={{display: this.props.displayDate ? "" : "none"}}
        >
          <Moment format={"YYYY.MM.DD"}>
            {this.props.start}
          </Moment>
        </div>


        <div className="d-flex bd-highlight">
          <div
            className="bd-highlight media-body pt-1 mt-2 mb-0 small text-secondary align-bottom border-bottom border-gray">
            <span
              className="font-weight-bold"
            >
              <Moment format={"hh:mm"}>{this.props.start}</Moment>
              &nbsp;{this.props.title}-({this.props.id})&nbsp;
            </span>

            <span
              style={{
                color: leftSign < 0 ? "red" : "",
                display: leftSign === 0 ? "none" : "",
              }}
            >
              {leftSign < 0 ? "Oversheduled " : ""}
              {leftSign > 0 ? "Available " : ""}

              {leftHours !== 0 ? leftHours: ""}
              {leftMinutes === 0 && durationMinutes === 0 ? "" : leftHours !== 0 ? " h" : ""}

              {(leftHours !== 0 && leftMinutes !== 0) ? " " : ""}

              {leftMinutes !== 0 ? leftMinutes: ""}
              {leftHours === 0 && durationHours === 0 ? "" : leftMinutes !== 0 ? " min" : ""}

            </span>
            <span>
              {(leftSign !== 0) ? " of " : ""}
              {durationHours > 0 ? durationHours + " h" : ""}
              {(durationHours > 0 && durationMinutes > 0) ? " " : ""}
              {durationMinutes > 0 ? durationMinutes + " min" : ""}
            </span>
          </div>
          <div
            className="bd-highlight pt-1 pb-1 pr-2 mt-2 mb-0 small text-secondary align-bottom border-bottom border-gray"
          >
            <img
              alt="Task checkbox Complete / To be done"
              width="15" height="15"
              className={"filterImgClass mr-2 rounded"}
              onClick={filterActivity}
            />

            <svg width="12" height="12"
                 className="bd-highlight rounded border-primary bg-primary rounded-circle"/>
          </div>
        </div>

        {/* Event tasks list */}

        <Droppable droppableId={String(this.props.id)}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
            >
              {timeRecords.map((ti, index) => {
                const task_id = ti.task
                return (
                  <Draggable
                    key={String(ti.id)}
                    draggableId={String(ti.id)}
                    index={index}>

                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {getTask() > 0 ?
                          <Task
                            {...allTasks[task_id]}
                            allTasks={allTasks}
                            time={ti}
                            taskUpdate={this.props.taskUpdate}
                            timePut={this.props.timePut}
                            taskCreate={this.props.taskCreate}
                            index={index}
                            taskLastCreatedId={this.props.taskLastCreatedId}
                            taskDelete={() => this.props.taskDelete(task_id)}
                            isNewTask={this.props.isNewTask(task_id)}
                          /> : ""}
                      </div>
                    )}

                </Draggable>)
              })}
              {provided.placeholder}
                <div
                  className="media text-muted pt-1">
                  {/* Button: "Add a new task to this event" */}
                  <div
                    className="pt-1 bd-highlight ml-auto pr-2 h5 text-right text-primary"
                    onClick={taskCreate}
                    style={{cursor: "default"}}
                  >+</div>
                </div>
            </div>
          )}
        </Droppable>

        {/* EVENT BLOCK END */}

      </div>
    );
  }
}

export default Event;