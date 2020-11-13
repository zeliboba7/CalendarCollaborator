import Config from './apiGoogleconfig.json';

class ApiCalendar {
  constructor() {
    this.signedIn = false;
    this.gapi = null;
    this.onLoadCallback = null;
    this.calendar = 'primary';
    try {
      this.updateSignedIn = this.updateSignedIn.bind(this);
      this.initClient = this.initClient.bind(this);
      this.createEvent = this.createEvent.bind(this);
      this.listEvents = this.listEvents.bind(this);
      this.listenSign = this.listenSign.bind(this);
      this.setCalendar = this.setCalendar.bind(this);
      this.handleClientLoad();
    }
    catch (e) {
      console.log(e);
    }
  }

  updateSignedIn(isSignedIn) {
    this.signedIn = isSignedIn;
  }
  /**
   * Auth to the google Api.
   */
  initClient() {
    this.gapi = window['gapi'];
    this.gapi.client.init(Config)
      .then(() => {
      // Listen for sign-in state changes.
      this.gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSignedIn);
      // Handle the initial sign-in state.
      this.updateSignedIn(this.gapi.auth2.getAuthInstance().isSignedIn.get());
      if (this.onLoadCallback) {
        this.onLoadCallback();
      }
    })
      .catch((e) => {
      console.log(e);
    });
  }
  /**
   * Init Google Api
   * And create gapi in global
   */
  handleClientLoad() {
    this.gapi = window['gapi'];
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    document.body.appendChild(script);
    script.onload = () => {
      window['gapi'].load('client:auth2', this.initClient);
    };
  }

  /**
   * Set the default attribute calendar
   * @param {string} newCalendar
   */
  setCalendar (newCalendar) {
    this.calendar = newCalendar;
  }
  /**
   * Execute the callback function when a user is disconnected or connected with the sign status.
   * @param callback
   */
  listenSign(callback) {
    if (this.gapi) {
      this.gapi.auth2.getAuthInstance().isSignedIn.listen(callback);
    } else {
      console.log("Error: this.gapi not loaded");
    }
  }

  listEvents() {
    if (this.gapi) {
      return this.gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date(new Date()-6.048e+8)).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 50,
        'orderBy': 'startTime'
      });
    } else {
      console.log("Error: this.gapi not loaded");
      return false;
    }
  }

  /**
   * Create Calendar event
   * @param {string} calendarId for the event.
   * @param {object} event with start and end dateTime
   * @returns {any}
   */
  createEvent(event, calendarId = this.calendar) {
    return this.gapi.client.calendar.events.insert({
      'calendarId': calendarId,
      'resource': event,
    });
  }
}
const apiCalendar = new ApiCalendar();
export default apiCalendar;