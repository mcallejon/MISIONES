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

  try {
    await db.run(`ALTER TABLE components_paciente_audiometrias ADD Audiometrias text, Logo text;`)
  }
  catch {}

  const directorioPacientes = '../../../data/PACIENTES';
  if (!utilidades.existeDirectorio(directorioPacientes)) {
    return;
  }


  const errors = [];

  db.each(`
  SELECT
    pacientes.Identificador as Identificador_paciente,
    components_paciente_visitas.Identificador as Identificador_visita,
    components_paciente_audiometrias.id as audiometria_id,
    components_paciente_audiometrias.Nombre_archivo as Nombre_archivo
  FROM components_paciente_audiometrias
	INNER JOIN components_paciente_visitas_components ON components_paciente_audiometrias.id = components_paciente_visitas_components.component_id
	INNER JOIN pacientes_components ON components_paciente_visitas_components.components_paciente_visita_id = pacientes_components.component_id
	INNER JOIN pacientes ON pacientes_components.paciente_id = pacientes.id
	INNER JOIN components_paciente_visitas ON components_paciente_visitas.id = components_paciente_visitas_components.components_paciente_visita_id
  ORDER BY audiometria_id ASC
  `, async (err, row_paciente) => {

    const archivo = `${directorioPacientes}/${row_paciente.Identificador_paciente}/${row_paciente.Identificador_visita}/${row_paciente.Nombre_archivo}`;
    if (!fs.existsSync(archivo)) {
      errors.push(archivo);
      return;
    }

    const resultsAudiometria = xml.obtenerDatosAudiometria(archivo);
    const resultsLogo = xml.obtenerDatosLogo(archivo);

    await db.run(`UPDATE components_paciente_audiometrias SET Audiometrias='${JSON.stringify(resultsAudiometria)}' WHERE id = '${row_paciente.audiometria_id}'`)
    await db.run(`UPDATE components_paciente_audiometrias SET Logo='${JSON.stringify(resultsLogo)}'  WHERE id = '${row_paciente.audiometria_id}'`)

  });
})();
