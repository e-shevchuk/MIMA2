import React from "react";
import Moment from 'react-moment';
import TimeListUIC from "./TimeUIC";

function EventHeaderDate(props) {
  return(
    <div className="new-day my-3 p-2 shadow-sm">
      <Moment format={"YYYY.MM.DD"}>{props.start}</Moment>
    </div>
  )
}

function EventHeaderControls(props) {
  return(
    <div className="bd-highlight pt-1 pb-1 pr-2 mt-2 mb-0 small text-secondary align-bottom border-bottom border-gray">
      <svg width="12" height="12" className="bd-highlight ml-1 rounded border-primary bg-primary rounded-circle"/>
      <svg width="12" height="12" className="bd-highlight ml-1 rounded border-primary bg-primary rounded-circle"/>
    </div>
  )
}

function EventHeaderTitle(props) {
  return(
    <div className="bd-highlight media-body pt-1 mt-2 mb-0 small text-secondary align-bottom border-bottom border-gray">
      <span className="font-weight-bold" >
        <Moment format={"HH:mm"}>{props.event.start}</Moment>
        {" " + props.event.title} {" ("+props.event.id+")"}
      </span>
      <span>
        {" 20 min left"}
      </span>
    </div>
  )
}

function EventFooterControls(props) {
  return (
    <div
      className="media text-muted pt-1">
      {/* Button: "Add a new task to this event" */}
      <div
        className="pt-1 bd-highlight ml-auto pr-2 h5 text-right text-primary"
        onClick={() => true}
        style={{cursor: "default"}}
      >+</div>
    </div>
  )
}

function EventUIC(props){
  return (
    <div>
      {/* EVENT BLOCK START */}
      <EventHeaderDate start={props.event.start} />

      <div className="d-flex bd-highlight">
        <EventHeaderTitle event={props.event} />
        <EventHeaderControls />
      </div>

      <TimeListUIC eventId={props.event.id} timeRecs={props.event.time}/>

      <EventFooterControls />

    </div>
  )
}

export default function EventListUIC(props) {

  // Generate the EventUIC components list
  const events = props.events.map(e =>
    <div key={e.id}><EventUIC event={e}/></div>
  )

  return (
    <div className="scrollingcolumns col-12 mh-100 overflow-auto py-12">
      <div className="my-3 p-3 bg-white shadow-sm">
        {events}
      </div>
    </div>
  )
}