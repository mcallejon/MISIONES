const utilidades = require('../implantes/utilidades');
const sqlite3 = require('sqlite3');
const fs = require('fs');
const { open } = require('sqlite');
const xml = require("../implantes/xml");

(async () => {

  const db = await open({
    filename: '../.tmp/data.db',
    driver: sqlite3.Database
  });

  const nuhsas = []
  const nuhsas_repetidos = []
  db.each(`
  SELECT Identificador, NUHSA from pacientes
  `, async (err, row_paciente) => {

    if(!row_paciente.NUHSA) {
      console.log(row_paciente.Identificador);
    }
    else {
      if(nuhsas.includes(row_paciente.NUHSA)) {
        nuhsas_repetidos.push(row_paciente.NUHSA)
      }
      nuhsas.push(row_paciente.NUHSA)
    }

  });
})();
