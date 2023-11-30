const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

(async () => {

  const db = await open({
    filename: '../.tmp/data.db',
    driver: sqlite3.Database
  });

  db.each("SELECT id, Tipo_de_paciente, Oido_implantado from pacientes", async (err, row_paciente) => {

    const visitas_ids = await db.all('SELECT * FROM pacientes_components WHERE paciente_id = ?', (row_paciente.id));

    let sql = 'SELECT id, Tipo_visita, Logo_audiometria, Intensidad_logo FROM components_paciente_visitas WHERE id = -1 OR ';
    visitas_ids.forEach(visita_id => sql += `id = ${visita_id.component_id} OR `);

    const visitas = await db.all(sql.slice(0, sql.length-3));
    visitas.forEach(async(visita) => {


      if (row_paciente.Tipo_de_paciente === 'Implantado') {

        /*
          Logo (implantado)
        */
        let campo1 = (row_paciente.Oido_implantado === 'Derecho') ? 'Logo_audiometria_od' : 'Logo_audiometria_oi';
        let valor1 = visita.Logo_audiometria;
        let campo2 = (campo1 === 'Logo_audiometria_od') ? 'Logo_audiometria_oi' : 'Logo_audiometria_od';
        let valor2 = 'NULL';

        if (row_paciente.Oido_implantado === 'Bilateral') {
          campo1 = 'Logo_audiometria_od';
          valor1 = visita.Logo_audiometria;
          campo2 = 'Logo_audiometria_oi';
          valor2 = visita.Logo_audiometria;
        }

        valor1 = (!valor1) ? 'NULL' : valor1;
        valor2 = (!valor2) ? 'NULL' : valor2;

        await db.run(
          `UPDATE components_paciente_visitas SET
            ${campo1}=${valor1},
            ${campo2}=${valor2}
          WHERE id=${visita.id}`
        );

        /*
          Intensidad (implantado)
        */
        campo1 = (row_paciente.Oido_implantado === 'Derecho') ? 'Intensidad_logo_od' : 'Intensidad_logo_oi';
        valor1 = visita.Intensidad_logo;
        campo2 = (campo1 === 'Intensidad_logo_od') ? 'Intensidad_logo_oi' : 'Intensidad_logo_od';
        valor2 = 'NULL';

        if (row_paciente.Oido_implantado === 'Bilateral') {
          campo1 = 'Intensidad_logo_od';
          valor1 = visita.Intensidad_logo;
          campo2 = 'Intensidad_logo_oi';
          valor2 = visita.Intensidad_logo;
        }

        valor1 = (!valor1) ? 'NULL' : valor1;
        valor2 = (!valor2) ? 'NULL' : valor2;

        await db.run(
          `UPDATE components_paciente_visitas SET
            ${campo1}=${valor1},
            ${campo2}=${valor2}
          WHERE id=${visita.id}`
        );
      }

      else if (row_paciente.Tipo_de_paciente === 'Normoyente') {

        /*
          Logo (normoyente)
        */

        let valor = (typeof(visita.Logo_audiometria) === 'number') ? visita.Logo_audiometria * 2 : 'NULL';

        await db.run(
          `UPDATE components_paciente_visitas SET
            Logo_audiometria_od=${valor},
            Logo_audiometria_oi=${valor}
          WHERE id=${visita.id}`
        );

        /*
          Intensidad (normoyente)
        */

        valor = (typeof(visita.Intensidad_logo) === 'number') ? visita.Intensidad_logo : 'NULL';

        await db.run(
          `UPDATE components_paciente_visitas SET
            Intensidad_logo_od=${valor},
            Intensidad_logo_oi=${valor}
          WHERE id=${visita.id}`
        );
      }
    });
  });
})();
