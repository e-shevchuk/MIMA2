import React, {Component} from "react";
import ContentEditable from 'react-contenteditable';
import Numeral from "numeral";
import TaskCheckboxComplete from './TaskCheckboxComplete';

window.Numeral = Numeral;

function durationToMinutes(duration_str = "") {
  // Empty dictionary for hours, minutes
  const l = {};
  // Regular expression to parse the string
  const re = /[0-9]{1,3}/gi;

  // If string is empty
  if (duration_str.length === 0)
    // We don't go there
    return 0;

  // Parsing the string to the empty dictionary
  duration_str.match(re).map((n, i) => {
    l[i] = Number(n)
  });

  // If no numbers parsed
  if (!(0 in l))
    // Get the f* out of there
    return 0;

  // To compute minutes consider first two groups only
  const minutes = ((1 in l) ? l[0] * 60 + l[1] : l[0]);

  return minutes;
}

function cut3RightChars(str){
  return str ? str.substring(0, str.length - 3) : "";
}

function durationToJsonFormat(m = 1) {
  return (m / 60 < 10 ? "0" : "") +
    (Numeral(Math.floor(m * 60)).format('00:00:0#'));
}

window.durationToJsonFormat = durationToJsonFormat;


class Task extends Component {
  constructor(props) {
    super(props);

    const isTitleEmpty = this.props.title.length === 0;

    this.state = {
      isControlsSetVisible: false,
      isTitleEditable: isTitleEmpty,
      isDurationEditable: false,
      isDurationVisible: !isTitleEmpty,
      titleCursor: isTitleEmpty ? "text" : "grab",
      displayDurationControls: "none",
      pushControlIconsRightClass: "mr-auto",
      title: this.props.allTasks ? this.props.allTasks[this.props.id].title : "",
      duration: this.props.allTasks ? this.props.allTasks[this.props.id].duration : "",
      complete: this.props.complete,
      order: this.props.order,
      id: this.props.id,
      keys: {shift: false},
    };

    // Make task title editable
    this.titleRef = React.createRef();
    this.durationRef = React.createRef();
    this.startEditTitle = this.startEditTitle.bind(this);
    this.stopEditTitle = this.stopEditTitle.bind(this);
    this.startEditDuration = this.startEditDuration.bind(this);
    this.stopEditDuration = this.stopEditDuration.bind(this);
    this.changeTitle = this.changeTitle.bind(this);
    this.changeDuration = this.changeDuration.bind(this);
    this.intervalUpdDuration = this.intervalUpdDuration.bind(this);
    this.focusOnTitleEdit = this.focusOnTitleEdit.bind(this);
    this.keyShift = this.keyShift.bind(this);
    this.displayControls = this.displayControls.bind(this);
    this.focusOnTitleEditNew = this.focusOnTitleEditNew.bind(this);

    // Duration increment / decrement intervals
    const durationDeltas = {
      "+": [
        {min: 0, max: 4, delta: 1},
        {min: 5, max: 15, delta: 5},
        {min: 20, max: 80, delta: 10},
        {min: 90, max: 270, delta: 30},
        {min: 300, max: 600, delta: 60},
      ],
      "-": [
        {min: 0, max: 5, delta: -1},
        {min: 10, max: 20, delta: -5},
        {min: 30, max: 90, delta: -10},
        {min: 120, max: 300, delta: -30},
        {min: 360, max: 600, delta: -60},
      ]
    };
    this.durationDeltas = durationDeltas;

    this._isMounted = false;

  }

  displayControls(display=undefined){
    if (display == undefined)
      return this.state.isControlsSetVisible;

    this.setState(
      {isControlsSetVisible: display});
  }

  keyShift(isPressed = undefined){
    // If no pressed or not signal passed
    if (isPressed == undefined)
      // Do nothing, return current state
      return this.state.keys.shift;

    // Copy current state branch
    const newKeys = JSON.parse(JSON.stringify(this.state.keys))
    // Update its value
    newKeys.shift = isPressed;
    // Update the state
    this.setState({keys: newKeys});
  }

  focusOnTitleEdit(){
    if (this._isMounted)
    {
      this.startEditTitle();
      this.startEditDuration();
      this.titleRef.current.focus();
    }
  }

  focusOnTitleEditNew(){
    setTimeout(() => {
      if (this._isMounted)
        this.titleRef.current.focus();
    },200);
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }


  startEditTitle() {
    this.setState({
      isTitleEditable: true,
      titleCursor: "text",
    });
  }

  stopEditTitle() {

    // If the title is empty - remove the task
    if (this.state.title.length === 0) {
      this.props.taskDelete();
      return;
    }

    this.setState({
      isTitleEditable: false,
      titleCursor: "grab",
    });
  }

  startEditDuration() {

    // Start edit duration if title isn't empty only
    if (this.state.title.length > 0)
      this.setState({
        isDurationEditable: true,
        displayDurationControls: "",
        pushControlIconsRightClass: "",
      });
  }

  stopEditDuration() {
    this.setState({
      isDurationEditable: false,
      displayDurationControls: "none",
      pushControlIconsRightClass: "mr-auto",
    });
  }

  changeTitle(event) {

    this.setState({
      title: event.target.value,
      isDurationVisible: event.target.value.length > 0,
    });

    // Update app state & database
    this.props.taskUpdate({ id: this.props.id, title: event.target.value})
  }

  changeDuration(event) {
    // Convert input to minutes, then to #0:00:00 format for this.state
    const newDuration =
      durationToJsonFormat(
        durationToMinutes(event.target.value));

    this.setState({duration: newDuration});
    console.log("New Duration:", newDuration);

    // Update app state & database
    this.props.taskUpdate({id: this.props.id, duration: newDuration})

  }

  intervalUpdDuration(sign) {
    // Get duration in minutes
    const m = durationToMinutes(this.state.duration);

    // Pick delta value
    const delta =
      // From the class table
      this.durationDeltas[sign].map(
        // according to the value of m and sign
        d => (d.min <= m & d.max >= m) ? d.delta : 0)
        .reduce((a, b) => a + b, 0)

    // New duration value in minutes:
    //   - rounded to cur delta value
    const mNew = (m + delta) - (m + delta) % Math.abs(delta);
    //   - but non less than 1
    const mNewBounded = mNew < 1 ? 1 : mNew;
    //   - finally in JSON, state-compartible format
    const newDuration = durationToJsonFormat(mNewBounded)

    // Update the Component state by new Duration
    // in "state" format (not minutes)
    this.setState({duration: newDuration});

    // Update app state & database
    this.props.taskUpdate({id: this.props.id, duration: newDuration})

  }

  render() {

    // If no Task ID passed - render placeholder
    if (!("id" in this.props))
      return (<div className="mr-2 editable task_title bd-highlight"> </div>);

    const {
      isControlsSetVisible,
      isTitleEditable,
      pushControlIconsRightClass,
      isDurationEditable,
      isDurationVisible,
      id,
      order,
      titleCursor,
    } = this.state;
    const {
      complete,
      taskUpdate,
      title,
      allTasks,
      duration,
    } = this.props;

    const displayControls = this.displayControls;

    // FUNCTION: Create a new task below the current on "Enter"
    const createNewTaskBelow = () => {
      this.props.taskCreate(this.props.order + 0.1);
    };

    // FUNCTION: Change task checkbox (complete / uncomplete status)
    const updComplete = () => {
      taskUpdate({id: id, complete: !complete});
    }

    if (this.props.isNewTask && title.length === 0)
    {
      window.focusOnTitleEdit = this.focusOnTitleEditNew;
      setTimeout(this.focusOnTitleEditNew, 200)
    }

    return (
      <div
        onMouseEnter={() => {this.displayControls(true)}}
        onMouseLeave={() => {this.displayControls(false)}}
      >
        <div className="media text-muted pt-1">
          {/* TASK BLOCK START */}
          <TaskCheckboxComplete updComplete={updComplete} complete={complete}/>

          <div className="media-body pb-1 mb-0 small border-bottom border-gray">
            <div className="d-flex mr-2 bd-highlight">
              <ContentEditable
                tagname='Title'
                onDoubleClick={() => {
                  this.startEditTitle();
                  this.startEditDuration();
                  this.titleRef.current.focus();
                }}
                onFocus={() => {
                  this.startEditDuration();
                }}
                onKeyDown={(event) => {

                  // Esc - stop editing
                  if (event.keyCode === 27) this.stopEditTitle();

                  // Enter - create a new Task below
                  if (event.keyCode === 13) {
                    event.returnValue = false;
                    event.preventDefault();
                    createNewTaskBelow();
                  }
                  // Backspace - remove the task, if title is empty
                  if (event.keyCode === 8)
                    if (this.state.title.length === 0)
                      this.props.taskDelete();


                }}
                onBlur={() => {this.stopEditTitle();}}
                onChange={this.changeTitle}
                innerRef={this.titleRef}
                disabled={!isTitleEditable}
                style={{
                  cursor: titleCursor,
                  minWidth: title.length > 0 ? 0 : 20,
                }}
                html={title ? title : ""}
              />

              <div className="d-flex bd-highlight mr-auto mb-0 duration">
                <div
                  className={"p-2 bd-highlight h5 text-prime duration-control "}
                  onClick={() => {this.intervalUpdDuration("-")}}
                  style={{display: displayControls() ? "" : "none"}}
                >⊖</div>
                <ContentEditable className="p-2 bd-highlight duration"
                  tagname='Duration'
                  onClick={() => {
                    this.startEditTitle();
                    this.startEditDuration();
                  }}
                  onFocus={() => {
                    this.startEditTitle();
                  }}
                  onKeyDown={(event) => {
                    // Enter - create a new task below
                    if (event.keyCode === 13) {
                      event.returnValue = false;
                      event.preventDefault();
                      createNewTaskBelow();
                    }
                    // Esc - stop editing
                    if (event.keyCode in {27: ""}) this.stopEditDuration()

                    // Shift - set up "Shift is pressed" flag
                    if (event.keyCode in {16: ""}) this.keyShift(true)

                    // Key ↓ - decrement
                    if (event.keyCode in {40: ""})
                      this.intervalUpdDuration("-")

                    // Key ↓ - increment
                    if (event.keyCode in {38: ""})
                      this.intervalUpdDuration("+")

                    // Shift+Tab - bring focus back to title field
                    if (event.keyCode in {9: ""} && this.keyShift())
                      this.focusOnTitleEdit();

                    event.preventDefault();
                  }}

                  // Shift - remove "Shift is pressed" flag
                  onKeyUp={(event) => {
                    if (event.keyCode in {16: ""})
                      this.keyShift(false)
                  }}
                  onBlur={this.stopEditDuration}
                  onChange={this.changeDuration}
                  innerRef={this.durationRef}
                  disabled={!isDurationEditable}
                  html={cut3RightChars(duration)}
                  style={{
                    cursor: isDurationEditable ? "" : "default",
                    display: isDurationVisible ? "" : "none",
                  }}
                />
                <div
                  className={"p-2 bd-highlight h5 text-prime duration-control"}
                  onClick={() => {this.intervalUpdDuration("+")}}
                  style={{display: displayControls() ? "" : "none"}}
                  >⊕</div>
              </div>
              <div
                className={"d-flex bd-highlight"}
                style={{cursor: "default"}}
              >
                <div
                  className={"h5 ml-1 control_icon5"}
                  style={{display: isControlsSetVisible ? "" : "none"}}
                >➤
                </div>
                <div
                  className={"h5 ml-1 control_icon5"}
                  style={{display: isControlsSetVisible ? "" : "none"}}
                >➠
                </div>
              </div>
            </div>
          </div>
          {/* TASK BLOCK END */}
        </div>
      </div>

    );
  }
}

export default Task;