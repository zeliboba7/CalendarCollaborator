import React from 'react';

export default function logIn(props) {

  return (
    <>
      <button
        onClick={(e) => {props.handleItemClick(e, 'sign-in')}}>Log In</button>
    </>
  )
}