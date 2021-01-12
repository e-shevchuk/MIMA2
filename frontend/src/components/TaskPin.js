import React, { useState } from 'react';
import {PinOutline, Pin} from '@styled-icons/typicons'

function TaskPin(props){

  // Unpacking props
  const {pinToggle, pinned} = props;

  // Picking image in accordance with status
  const checkBoxImgClass = pinned ?
    "task_checkbox_pinned":"task_checkbox_unpinned";

  // Render
  return (
    <div
      className={checkBoxImgClass + " mr-2 rounded"}
      alt="Task pinned / unpinned"
      onClick={()=>0}
    >
      <PinOutline size="18" style={{display: pinned ? "none" : ""}}/>
      <Pin size="18" style={{display: pinned ? "" : "none"}}/>
    </div>
  );
}

export default TaskPin;