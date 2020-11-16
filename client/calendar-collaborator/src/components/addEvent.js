import React, {useState} from 'react';
import apiCalendar from '../ApiCalendar';
import './addEvent.css';

export default function addEvent(props) {
  const [title, setTitle] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [recurrence, setRecurrence] = useState('NONE');
  const [participants, setParticipants] = useState([]);
  const [holiday, setHoliday] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [participantAdder, setParticipantAdder] = useState('');
  const [additionalParticipants, setAdditionalParticipants] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.length===0||startDate.length===0||endDate.length===0||!(participants.includes(true)||additionalParticipants.length===0)) {
      setErrorMessage('Please set all fields');
      return;
    }
    for (let j=0;j<props.timesAvailable[0].length;j++) {
      if (props.timesAvailable[0][j][0] < startDate && props.timesAvailable[0][j][1] > startDate) {
        setErrorMessage('There was a clash with a global event');
        return;
      }
    }
    for (let j=0;j<props.holidaysAvailable.length;j++) {
      if (props.holidaysAvailable[j][0] < startDate && props.holidaysAvailable[j][1] > startDate) {
        setErrorMessage('There was a clash with another holiday');
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
              setErrorMessage('There was a clash with a participants other event');
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
    if (additionalParticipants.length) {
      for (const email of additionalParticipants) {
        event.attendees.push({'email': email});
      }
    }
    try {
      await apiCalendar.createEvent(event);
      await apiCalendar.listEvents().then((res)=>props.setEventList(res.result.items));
    } catch (err) {
      console.error(err);
    }
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
    } else if (e.target.name==='additional participant') {
      setParticipantAdder(e.target.value);
    } else {
      let tempParticipants = participants.slice();
      tempParticipants[parseInt(e.target.name)] = !tempParticipants[parseInt(e.target.name)];
      setParticipants(tempParticipants);
    }
  }

  const submitAdditionalParticipant = (e) => {
    e.preventDefault();
    if (additionalParticipants.includes(participantAdder)) {
      setErrorMessage('Participant already added');
    } else {
      setAdditionalParticipants([...additionalParticipants, participantAdder]);
    }
  }

  return (
    <>
      <form onSubmit = {handleSubmit}>
        <label>Event title:</label>
          <input autocomplete="off" type="text" name="title" onChange={handleChange}/>
        <label>Start Date and Time:</label>
          <input type="datetime-local" name="startDate" onChange={handleChange}/>
        <label>End Date and Time:</label>
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
        {props.groups.map(group => <div key={group.title}>
          <label>{group.title}</label>
          <input type="checkbox" name={group.id} onChange={handleChange}/>
          </div>)}
          <input type="submit" value="Submit"/>
        <label>{errorMessage}</label>
      </form>
      <form onSubmit = {submitAdditionalParticipant}>
        <label>Additional participants:</label>
        <input autocomplete="off" type="text" name="additional participant" onChange={handleChange}/>
        {additionalParticipants.map(participant=><label key={participant}>{participant}</label>)}
        <input type="submit" value="Set Additional Participant"/>
      </form>
    </>
  )
}