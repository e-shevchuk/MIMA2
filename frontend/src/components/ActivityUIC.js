import React, { Component } from "react";
import Event from "../Event";

class Activity extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {id, title, events, app_state} = this.props;
    const events_detailed = events.map(id => app_state.all_events[id]);

    return (
      <div>

          {/* ACTIVITY BLOCK START */}
          <h6 className="pb-1 mb-0"> { title } </h6>

          {/* Events list */}
          { events_detailed.map(event => <Event key={ event.id } {...event} app_state={app_state}/>)}

          {/* Activity Footer */}
          <small className="d-block text-right mt-3">
            <a href="#">Load moreActivity events</a>
          </small>
          {/* ACTIVITY BLOCK END */}

      </div>
    );
  }
}

export default Activity;
