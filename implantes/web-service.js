const ws = require('ws');
const implantesWeb = require('../implantes-web/implantes-web')
const conf = require('./configuracion');
const Parseo = require('./parseo').Parseo;
const fs = require('fs');
const https = require('https');
const WebSocketServer = require('ws').Server;

const directorioPacientes = `${conf.obtenerDirectorioDatos()}/${conf.obtenerNombreDirectorioPacientes()}/`;

module.exports = {

  async init() {

    // implantes-web
    const implantesWebInstance = new implantesWeb.ImplantesWeb(conf);
    await implantesWebInstance.start();

    let wss;

    console.log(`Puerto websocket: ${conf.obtenerPortWs()}`);
    if (conf.obtenerServidorCert() == null) {
      wss = new ws.WebSocketServer({
        port: conf.obtenerPortWs()
      });
    }

    else {

      let httpsServer = https.createServer();

      if(fs.existsSync(conf.obtenerServidorKey()) && (conf.obtenerServidorCert())) {
        console.log('Archivos de certificados existentes para websocket');
        httpsServer = https.createServer({
          key: fs.readFileSync(conf.obtenerServidorKey()),
          cert: fs.readFileSync(conf.obtenerServidorCert())
        });
      }

      wss = new WebSocketServer({
        server: httpsServer
      });

      httpsServer.listen(conf.obtenerPortWs(), "0.0.0.0");
    }

    wss.on('connection', async (ws) => {

      if(wss.clients.size > 1) {
        ws.send('Ya existe un cliente conectado');
        ws.terminate();
        return
      }

      ws.send('PACIENTES');
      await new Parseo(ws, directorioPacientes).procesarPacientes();
      ws.send('----');

      ws.terminate();
    });
  }
}
