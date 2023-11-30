const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

(async () => {

  const db = await open({
    filename: '../.tmp/data.db',
    driver: sqlite3.Database
  });

  db.each("SELECT id from pacientes", async (err, row_paciente) => {

    const visitas_ids = await db.all('SELECT * FROM pacientes_components WHERE paciente_id = ?', (row_paciente.id));

    let sql = 'SELECT id, Tipo_visita, Logo_audiometria, Intensidad_logo FROM components_paciente_visitas WHERE id = -1 OR ';
    visitas_ids.forEach(visita_id => sql += `id = ${visita_id.component_id} OR `);

    const visitas = await db.all(sql.slice(0, sql.length-3));

    let Numero_de_visitas_corticales = 0;
    let Numero_de_visitas_audiometria = 0;
    let Numero_de_visitas_programacion = 0;
    let Numero_de_visitas_pupilometria = 0;
    let Numero_de_visitas_neuroimagen = 0;
    let Numero_de_visitas_llamada = 0;
    let Ultima_intensidad = 'NULL';
    let Ultimo_logo = 'NULL';

    visitas.forEach(visita => {
      if (visita.Tipo_visita === 'Corticales') {
        Numero_de_visitas_corticales += 1;
      }
      else if (visita.Tipo_visita === 'Audiometría') {
        Numero_de_visitas_audiometria += 1;
      }
      else if (visita.Tipo_visita === 'Programación') {
        Numero_de_visitas_programacion += 1;
      }
      else if (visita.Tipo_visita === 'Pupilometría') {
        Numero_de_visitas_pupilometria += 1;
      }
      else if (visita.Tipo_visita === 'Neuroimagen') {
        Numero_de_visitas_neuroimagen += 1;
      }
      else if (visita.Tipo_visita === 'Llamada') {
        Numero_de_visitas_llamada += 1;
      }
    });

    if(visitas.length > 0) {
      const ultimaVisita = visitas[visitas.length - 1];
      Ultimo_logo = (ultimaVisita.Logo_audiometria) ?? ultimaVisita.Logo_audiometria;
      Ultima_intensidad = (ultimaVisita.Intensidad_logo) ?? ultimaVisita.Intensidad_logo ;
    }

    const Numero_de_visitas_total = Numero_de_visitas_corticales + Numero_de_visitas_audiometria + Numero_de_visitas_programacion + Numero_de_visitas_pupilometria + Numero_de_visitas_neuroimagen + Numero_de_visitas_llamada;

    await db.run(
      `UPDATE pacientes SET
        Numero_de_visitas_corticales=${Numero_de_visitas_corticales},
        Numero_de_visitas_audiometria=${Numero_de_visitas_audiometria},
        Numero_de_visitas_programacion=${Numero_de_visitas_programacion},
        Numero_de_visitas_pupilometria=${Numero_de_visitas_pupilometria},
        Numero_de_visitas_neuroimagen=${Numero_de_visitas_neuroimagen},
        Numero_de_visitas_llamada=${Numero_de_visitas_llamada},
        Numero_de_visitas_total=${Numero_de_visitas_total},
        Ultima_intensidad=${Ultima_intensidad},
        Ultimo_logo=${Ultimo_logo}
      WHERE id=${row_paciente.id}`
    );

  });
})();
