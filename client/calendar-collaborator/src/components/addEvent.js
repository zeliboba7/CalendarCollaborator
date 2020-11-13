import React, {useState, useEffect} from 'react';
import apiCalendar from '../ApiCalendar';

export default function addEvent(props) {
  const [title, setTitle] = useState([]);
  const [startDate, setStartDate] = useState([]);
  const [endDate, setEndDate] = useState([]);
  const [recurrence, setRecurrence] = useState('NONE');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const event = {
      "summary": title,
      "location": "Somewhere",
      "start": {
        "dateTime": new Date(startDate).toISOString(),
        "timeZone": "Europe/London"
      },
      "end": {
        "dateTime": new Date(endDate).toISOString(),
        "timeZone": "Europe/London"
      },
    }
    if (recurrence!=='NONE') {
      event["recurrence"] = [`RRULE:FREQ=${recurrence};UNTIL=20210701T170000Z`];
      await apiCalendar.createEvent(event);
      await apiCalendar.listEvents().then((res)=>props.setEventList(res.result.items));
      apiCalendar.updateSignedIn(true);
    } else {
      await apiCalendar.createEvent(event)
        .then((res)=>{
          props.setEventList([...props.eventList, res.result]);
        });
    }
  }

  const handleChange = (e) => {
    if (e.target.name==='title') {
      setTitle(e.target.value);
    } else if (e.target.name==='startDate') {
      setStartDate(e.target.value);
    } else if (e.target.name==='endDate') {
      setEndDate(e.target.value);
    } else {
      setRecurrence(e.target.value.toUpperCase());
      console.log(recurrence);
    }
  }

  return (
    <form onSubmit = {handleSubmit}>
      <label>Event title</label>
      <input type="text" name="title" onChange={handleChange}/>
      <label>Start Date and Time</label>
      <input type="datetime-local" name="startDate" onChange={handleChange}/>
      <label>End Date and Time</label>
      <input type="datetime-local" name="endDate" onChange={handleChange}/>
      <label>Repeat every:</label>
      <select id="reccurence" name="reccurence" onChange={handleChange}>
        <option value="none">none</option>
        <option value="monthly">monthly</option>
        <option value="weekly">weekly</option>
        <option value="daily">daily</option>
      </select>
      <input type="submit" value="Submit"/>
    </form>
  )
}