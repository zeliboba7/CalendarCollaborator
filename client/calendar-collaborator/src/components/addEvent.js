import React, {useState} from 'react';
import apiCalendar from '../ApiCalendar';

export default function addEvent(props) {
  const [title, setTitle] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [recurrence, setRecurrence] = useState('NONE');
  const [participants, setParticipants] = useState([]);
  const [holiday, setHoliday] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(startDate.length)
    if (title.length===0||startDate.length===0||endDate.length===0||!participants.includes(true)) {
      setErrorMessage('set all fields');
      return;
    }
    for (let j=0;j<props.timesAvailable[0].length;j++) {
      if (props.timesAvailable[0][j][0] < startDate && props.timesAvailable[0][j][1] > startDate) {
        setErrorMessage('clash with global event');
        return;
      }
    }
    console.log(props.holidaysAvailable)
    for (let j=0;j<props.holidaysAvailable.length;j++) {
      if (props.holidaysAvailable[j][0] < startDate && props.timesAvailable[j][1] > startDate) {
        setErrorMessage('clash with another holiday');
        return;
      }
    }
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
    }
    if (participants.includes(true)) {
      let participantEmails = [];
      for (let i=0;i<participants.length;i++) {
        if (participants[i]) {
          for (let j=0;j<props.timesAvailable[i].length;j++) {
            if (props.timesAvailable[i][j][0] < startDate && props.timesAvailable[i][j][1] > startDate) {
              setErrorMessage('clash with participant event');
              return;
            }
          }
          participantEmails.push({'email': props.groups[i].title})
        }
      }
      event["attendees"] = participantEmails;
    }
    if (holiday) {
      event["description"] = 'holiday';
    }
    await apiCalendar.createEvent(event);
    await apiCalendar.listEvents().then((res)=>props.setEventList(res.result.items));

  }

  const handleChange = (e) => {
    if (e.target.name==='title') {
      setTitle(e.target.value);
    } else if (e.target.name==='startDate') {
      setStartDate(e.target.value);
    } else if (e.target.name==='endDate') {
      setEndDate(e.target.value);
    } else if (e.target.name==='reccurence') {
      setRecurrence(e.target.value.toUpperCase());
    } else if (e.target.name==='holiday') {
      setHoliday(!holiday);
    } else {
      let tempParticipants = participants.slice();
      tempParticipants[parseInt(e.target.name)] = !tempParticipants[parseInt(e.target.name)];
      setParticipants(tempParticipants);
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
      <label>Holiday: </label>
      <input type="checkbox" name="holiday" onChange={handleChange}/>
      <label>Participants:</label>
      {props.groups.map(group => <>
        <label>{group.title}</label>
        <input type="checkbox" name={group.id} onChange={handleChange}/>
        </>)}
      <input type="submit" value="Submit"/>
      <label>{errorMessage}</label>
    </form>
  )
}