import './App.css';
import LogIn from './components/logIn'
import AddEvent from './components/addEvent'
import React, {useState, useLayoutEffect, useEffect} from 'react';
import apiCalendar from './ApiCalendar'
import Timeline from 'react-calendar-timeline';
import 'react-calendar-timeline/lib/Timeline.css';
import moment from 'moment';


function App() {
  const [eventList, setEventList] = useState([]);
  const [ready, setReady] = useState(false);
  const [groups, setGroups] = useState([{ id: 1, title: 'Global Events' }]);

  let items = []
  useEffect(() => {
    if (!ready && eventList.length) {
      let groupID = 2;
      const groupTemp= [];
      for (let i=0;i<eventList.length;i++) {
        if (eventList[i].attendees) {
          for (const attendee of eventList[i].attendees) {
            let groupFind = groups.filter(group => group.title === attendee);
            if (!groupFind.length) {
              groupTemp.push({ id: groupID, title: attendee.email });
              groupID++;
            }
          }
        }
      }
      setGroups([{ id: 1, title: 'Global Events' }, ...groupTemp]);
      setReady(true);
    }
  },[eventList]);

  useEffect(() => {
    let itemID = 0;
    for (let i=0;i<eventList.length;i++) {
      if (eventList[i].attendees) {
        for (const attendee of eventList[i].attendees) {
          let groupFind = groups.filter(group => group.title === attendee.email);
          let group=1;
          if (groupFind.length) {
            group = groupFind[0].id;
          }
          items.push(
            {
              id: itemID,
              group: group,
              title: eventList[i].summary,
              start_time: moment(eventList[i].start.dateTime),
              end_time: moment(eventList[i].end.dateTime)
            }
          )
          itemID++;
        }
      } else {
        items.push(
          {
            id: itemID,
            group: 1,
            title: eventList[i].summary,
            start_time: moment(eventList[i].start.dateTime),
            end_time: moment(eventList[i].end.dateTime)
          }
        )
        itemID++;
      }
    }
    console.log(items)
  });


  const handleItemClick = async (event, name) => {
    if (name === 'sign-in') {
      if (apiCalendar.gapi) {
        try {
          await apiCalendar.gapi.auth2.getAuthInstance().signIn();
          await apiCalendar.listEvents().then((res)=>setEventList(res.result.items));
          apiCalendar.updateSignedIn(true);
        } catch (err) {
          console.error(err);
        }
      }
        else {
        console.log("Error: this.gapi not loaded");
      }
    } else if (name === 'sign-out') {
      if (apiCalendar.gapi) {
        const auth2 = apiCalendar.gapi.auth2.getAuthInstance();
        await auth2.signOut().then(function () {
          apiCalendar.updateSignedIn(false);
          setEventList([]);
        });
      } else {
        console.log("Error: gapi not loaded");
      }
      console.log(apiCalendar.signedIn)
    } else if (name === 'list') {
      console.log(eventList);
    }
  }

  return (
    <>
      {apiCalendar.signedIn ?
      (ready ?<>
        <Timeline
          groups={groups}
          items={items}
          defaultTimeStart={moment().add(0, 'hour')}
          defaultTimeEnd={moment().add(96, 'hour')}
        />
        <AddEvent eventList={eventList} setEventList={setEventList}/>
      </>:<h1>loading</h1>):
      <LogIn handleItemClick = {handleItemClick}/>}
      <button onClick={(e) => handleItemClick(e, 'sign-out')}>sign-out</button>
      <button onClick={(e) => handleItemClick(e, 'list')}>list</button>
    </>
  );
}

export default App;
