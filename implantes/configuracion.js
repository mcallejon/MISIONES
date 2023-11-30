const fs = require('fs')
const conf = JSON.parse(fs.readFileSync('../../conf.json', 'utf8'));

module.exports  = {

  obtenerDirectorioDatos() {
    return conf.dataPath;
  },

  obtenerNombreDirectorioPacientes() {
    return conf.pathNamePacientes;
  },

  obtenerNombreDirectorioDatosExportados() {
    return conf.dataExportedName;
  },

  obtenerServidorWs() {
    return conf.serverWs;
  },

  obtenerPortWs() {
    return conf.serverWsPort;
  },

  obtenerServidorKey() {
    return conf.serverKey;
  },

  obtenerServidorCert() {
    return conf.serverCert;
  }
}
