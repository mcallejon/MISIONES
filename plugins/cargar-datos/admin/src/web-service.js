const ws = require('ws');
const conf = require('./configuracion');
const Parseo = require('./parseo').Parseo;
const WebSocket = require("ws").Server;

const directorioPacientes = `${conf.obtenerDirectorioDatos()}/${conf.obtenerNombreDirectorioPacientes()}/`;

module.exports = {

  async init() {
    
    let wss = new ws.WebSocketServer({
      port: conf.obtenerPortWs()
    });

    // producción
    if (conf.obtenerServidorKey()) {

      const httpsServer = https.createServer({
        key: conf.obtenerServidorKey(),
        cert: conf.obtenerServidorCert()
      });
  
      wss = new WebSocket({
        server: httpsServer
      });

      httpsServer.listen(8080, '0.0.0.0');
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
