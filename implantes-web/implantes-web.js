const https = require('https');
const path = require('path');
const fs = require('fs');
const express = require('express')
const cookieParser = require('cookie-parser');
const expressHandlebars = require('express-handlebars');
const { Auth } = require('./auth');
const { Crypto } = require('./crypto');
const { CloneDb } = require('./clone-db');
const app = express()


class ImplantesWeb {

  constructor(conf) {
    this.conf = conf;
    this.auth = new Auth();
    this.crypto = new Crypto();
    this.cloneDb = new CloneDb();
  }

  async start() {

    await this.cloneDb.start();

    app.engine('handlebars', expressHandlebars.engine());
    app.set('view engine', 'handlebars');
    app.set('views', path.join(__dirname, './views'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'static')))

    app.get('/', (req, res) => {

      if(this.auth.isAuthenticated(req?.cookies?.id)) {
        return res.render('download-db')
      }

      res.render('home')
    })

    app.post('/login', (req, res) => {

      if(!this.auth.login(req?.body?.username, req?.body?.password)) {
        return res.render('home')
      }

      let options = {
        maxAge: 1000 * 60 * 15,
        httpOnly: true
      }

      const id = this.crypto.id();
      this.auth.setSession(id);
      res.cookie('id', id, options);
      res.redirect('download-db')
    })

    app.get('/download-db', (req, res) => {

      if(!this.auth.isAuthenticated(req?.cookies?.id)) {
        return res.render('home')
      }

      res.render('download-db')
    })

    app.post('/download-db', (req, res) => {
      res.download('./.tmp/data_anonmyous.db')
    })

    app.get('/exit', (req, res) => {
      this.auth.deleteSession(req?.cookies?.id)
      res.redirect('/')
    })

    app.get('*', function(req, res){
      res.redirect('/')
    });

    let options = {}
    if(fs.existsSync(this.conf.obtenerServidorKey()) && (this.conf.obtenerServidorCert())) {
      options = {
        key: fs.readFileSync(this.conf.obtenerServidorKey()),
        cert: fs.readFileSync(this.conf.obtenerServidorCert()),
      };
    }

    https.createServer(options, app).listen(8081);

    // app.listen(8081)
  }

}

module.exports = {
  ImplantesWeb
}
