const utilidades = require('../implantes/utilidades');
const sqlite3 = require('sqlite3');
const fs = require('fs');
const { open } = require('sqlite');
const xml = require("../implantes/xml");

(async () => {

  const db = await open({
    filename: './.tmp/data.db',
    driver: sqlite3.Database
  });

  const logosVacios = []
  db.each(`
  SELECT
    pacientes.Identificador as Identificador_paciente,
    components_paciente_visitas.Identificador as Identificador_visita,
    components_paciente_audiometrias.id as audiometria_id,
    components_paciente_audiometrias.Logo as Logo
  FROM components_paciente_audiometrias
	INNER JOIN components_paciente_visitas_components ON components_paciente_audiometrias.id = components_paciente_visitas_components.component_id
	INNER JOIN pacientes_components ON components_paciente_visitas_components.components_paciente_visita_id = pacientes_components.component_id
	INNER JOIN pacientes ON pacientes_components.paciente_id = pacientes.id
	INNER JOIN components_paciente_visitas ON components_paciente_visitas.id = components_paciente_visitas_components.components_paciente_visita_id
  ORDER BY audiometria_id ASC
  `, async (err, row_paciente) => {

    const Logo = JSON.parse(row_paciente.Logo);
    if(JSON.stringify(Logo) === '[{"SpeechPoint":[{"SpeechWord":[]}]}]') {
      console.log(row_paciente.Identificador_paciente, row_paciente.Identificador_visita);
    }

  });
})();
