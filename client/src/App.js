import './App.css';
import LogIn from './components/logIn'
import AddEvent from './components/addEvent'
import React, {useState, useEffect} from 'react';
import apiCalendar from './ApiCalendar'
import Timeline from 'react-calendar-timeline';
import './Timeline.css';
import moment from 'moment';

function App() {
  const [eventList, setEventList] = useState([]);
  const [ready, setReady] = useState(false);
  const [groups, setGroups] = useState([{ id: 1, title: 'Global Events' }]);
  const [holidaysAvailable, setHolidaysAvailable] = useState([]);
  const [timesAvailable, setTimesAvailable] = useState([[]]);
  const [items, setItems] = useState([]);
  const [reload, setReload] = useState(0);
  const [user, setUser] = useState('');
  const [timeLine, setTimeLine] = useState([<Timeline
    key={1}
    groups={groups}
    items={items}
    defaultTimeStart={moment().add(0, 'hour')}
    defaultTimeEnd={moment().add(96, 'hour')}
  />]);
  const [toggle, setToggle] = useState(0);

  useEffect(() => {
    if (!ready && eventList.length) {
      let groupID = 1;
      const groupTemp= [];
      for (let i=0;i<eventList.length;i++) {
        if (eventList[i].attendees) {
          for (const attendee of eventList[i].attendees) {
            if (attendee.email!==user) {
              let groupFind = groupTemp.filter(group => group.title === attendee.email);
              if (!groupFind.length) {
                groupTemp.push({ id: groupID, title: attendee.email });
                groupID++;
                setTimesAvailable([...timesAvailable, []]);
              }
            }
          }
        }
      }
      setGroups([{ id: 0, title: 'Global Events' }, ...groupTemp]);
      setReload(reload+1);
      
      setReady(true);
    }
  },[eventList]);

  useEffect(() => {
    if (ready) {
      let result = resetItems(groups.length, groups);
      setTimesAvailable(result[0]);
      setHolidaysAvailable(result[1]);
      setItems(result[2]);
      setTimeLine([<Timeline
        key={1}
        groups={groups}
        items={items}
        defaultTimeStart={moment().add(0, 'hour')}
        defaultTimeEnd={moment().add(96, 'hour')}
      />])
      console.log('called')
      if (reload<=2) {
        setReload(reload+1);
      }
    }
    setToggle(toggle+1);
  },[eventList, reload]);

  const resetItems = (groupNum, groupList) => {
    let itemID = 0;
    let timesTemp;
    let holidayTemp = [];
    let items = [];
    timesTemp = new Array(groupNum).fill([]);
    for (let i=0;i<eventList.length;i++) {
      holidayTemp.push([eventList[i].start.dateTime,eventList[i].end.dateTime]);
      if (eventList[i].attendees) {
        for (const attendee of eventList[i].attendees) {
          let groupFind = groupList.filter(group => group.title === attendee.email);
          let group = 0;
          if (groupFind.length) {
            group = groupFind[0].id;
          }
          if (!ready) {
            timesTemp[group] = [...timesTemp[group], [eventList[i].start.dateTime,eventList[i].end.dateTime]];
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
            group: 0,
            title: eventList[i].summary,
            start_time: moment(eventList[i].start.dateTime),
            end_time: moment(eventList[i].end.dateTime)
          }
        )
        if (!ready) {
          timesTemp[0] = [...timesTemp[0], [eventList[i].start.dateTime,eventList[i].end.dateTime]];
        }
        itemID++;
      }
    }
    return [timesTemp, holidayTemp, items];
  }

  const handleItemClick = async (event, name) => {
    if (name === 'sign-in') {
      if (apiCalendar.gapi) {
        try {
          let authInstance = await apiCalendar.gapi.auth2.getAuthInstance();
          await authInstance.signIn();
          setUser(await authInstance.currentUser.get().getBasicProfile().getEmail());
          await apiCalendar.listEvents().then((res)=>setEventList(res.result.items));
          apiCalendar.updateSignedIn(true);
        } catch (err) {
          console.error(err);
        }
      }
        else {
        console.error("Error: this.gapi not loaded");
      }
    } else if (name === 'sign-out') {
      console.log('signed out')
      if (apiCalendar.gapi) {
        try {
        const auth2 = apiCalendar.gapi.auth2.getAuthInstance();
        await auth2.signOut().then(function () {
          apiCalendar.updateSignedIn(false);
          setEventList([]);
        });
        } catch (err) {
          console.error(err);
        }
        setEventList([]);
        setReady(false);
        setGroups([{ id: 1, title: 'Global Events' }]);
        setHolidaysAvailable([]);
        setTimesAvailable([[]]);
        setItems([]);
        setReload(0);
        setTimeLine([<Timeline
          key={1}
          groups={groups}
          items={items}
          defaultTimeStart={moment().add(0, 'hour')}
          defaultTimeEnd={moment().add(96, 'hour')}
        />]);
      } else {
        console.error("Error: gapi not loaded");
      }
    }
  }

  return (
    <div className="container"> 
      <LogIn handleItemClick={handleItemClick} ready={ready}/>
      {ready &&
      <>
        {timeLine}
        <AddEvent 
        eventList={eventList} 
        setEventList={setEventList} 
        timesAvailable={timesAvailable}
        holidaysAvailable={holidaysAvailable}
        groups={groups}
        toggle={toggle}
        setToggle={setToggle}/>
      </>}
    </div>
  );
}

export default App;
