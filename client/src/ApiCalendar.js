import Config from './apiGoogleconfig.json';

class ApiCalendar {
  constructor() {
    this.signedIn = false;
    this.gapi = null;
    this.onLoadCallback = null;
    try {
      this.updateSignedIn = this.updateSignedIn.bind(this);
      this.initClient = this.initClient.bind(this);
      this.createEvent = this.createEvent.bind(this);
      this.listEvents = this.listEvents.bind(this);
      this.handleClientLoad();
    }
    catch (e) {
      console.log(e);
    }
  }

  updateSignedIn(isSignedIn) {
    this.signedIn = isSignedIn;
  }

  initClient() {
    this.gapi = window['gapi'];
    this.gapi.client.init(Config)
      .then(() => {
      this.gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSignedIn);
      this.updateSignedIn(this.gapi.auth2.getAuthInstance().isSignedIn.get());
      if (this.onLoadCallback) {
        this.onLoadCallback();
      }
    })
      .catch((e) => {
      console.log(e);
    });
  }

  handleClientLoad() {
    this.gapi = window['gapi'];
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    document.body.appendChild(script);
    script.onload = () => {
      window['gapi'].load('client:auth2', this.initClient);
    };
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

  createEvent(event) {
    return this.gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': event,
    });
  }
}
const apiCalendar = new ApiCalendar();
export default apiCalendar;