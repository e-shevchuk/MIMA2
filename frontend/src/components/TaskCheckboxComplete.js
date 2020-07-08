import React, { useState } from 'react';

function TaskCheckboxComplete(props){

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
  );
}

export default TaskCheckboxComplete;