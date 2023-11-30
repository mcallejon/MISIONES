const credentials = [
  {
    username: "amparo",
    password: "prueba12A!"
  }
]

class Auth {

  constructor() {
    this.sessions = [];
  }

  login(username, password) {
    const credential = credentials.find((credential) => credential.username === username);
    if(!credential) {
      return false;
    }
    return (credential.password === password) ? true : false;
  }

  isAuthenticated(id) {
    const session = this.sessions.find(session => session.id === id);
    if(!session) {
      return false;
    }

    if(!(session.date instanceof Date)) {
      return false;
    }

    const TIME_5_MINUTES = 1000 * 60 * 5;
    if(new Date() > session.date.getTime() + TIME_5_MINUTES) {
      this.deleteSession(id);
      return false;
    }

    return true;
  }

  deleteSession(id) {
    const index = this.sessions.findIndex(session => session.id === id);
    if(index >= 0) {
      this.sessions.splice(index, 1);
    }
  }

  setSession(id) {
    this.sessions.push({
      id,
      date: new Date()
    })
  }

}

module.exports = {
  Auth
}
