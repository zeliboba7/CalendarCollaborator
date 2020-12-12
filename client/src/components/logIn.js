import React from 'react';
import apiCalendar from '../ApiCalendar'
import './logIn.css';

export default function logIn(props) {

  return (
    <div className="center">
      {apiCalendar.signedIn ? <button className="out" onClick={(e) => props.handleItemClick(e, 'sign-out')}>Sign-Out</button>:
      <button className="in" onClick={(e) => {props.handleItemClick(e, 'sign-in')}}>Log-In</button>}
    </div>
  )
}