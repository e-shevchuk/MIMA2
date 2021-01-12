import React, {useState} from "react";
import {PinOutline, Pin} from '@styled-icons/typicons'

export default function TaskPinnedFldUIC (props) {

  const [pinned, setPinned] = useState(props.pinned)

  // TODO: Comnplete toggle() function

  function toggle() {
    const msg = 'TaskPinnedFldUIC.toggle():'
    // setPinned(!pinned)
    console.log(msg, 'THIS FUNCTION NEED TO BE COMPLETED')
  }

  return (
    <div className="d-flex bd-highlight mr-auto mb-0 task-props">
      <div className={"p-2 bd-highlight h5 text-prime task-property"}>
        <div
          alt="Task pinned / unpinned"
          onClick={toggle}
        >
          <PinOutline size="18" style={{display: pinned ? "none" : ""}}/>
          <Pin size="18" style={{display: pinned ? "" : "none"}}/>
        </div>
      </div>
    </div>
  )
}

