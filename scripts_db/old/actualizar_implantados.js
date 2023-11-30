const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

(async () => {

  const db = await open({
    filename: '../.tmp/data.db',
    driver: sqlite3.Database
  });

  db.each("SELECT id, Oido_implantado, Fecha_de_implantacion, Electrodos_insertados from pacientes", async (err, row_paciente) => {

    if (row_paciente.Oido_implantado === 'Izquierdo') {

      console.log(`UPDATE pacientes SET
      Fecha_de_implantacion_oi="${row_paciente.Fecha_de_implantacion}",
      Electrodos_insertados_oi=${row_paciente.Electrodos_insertados}
    WHERE id=${row_paciente.id}`);
      await db.run(
        `UPDATE pacientes SET
          Fecha_de_implantacion_oi="${row_paciente.Fecha_de_implantacion}",
          Electrodos_insertados_oi=${row_paciente.Electrodos_insertados}
        WHERE id=${row_paciente.id}`
      );
    }

    else if (row_paciente.Oido_implantado === 'Derecho') {

      await db.run(
        `UPDATE pacientes SET
          Fecha_de_implantacion_od="${row_paciente.Fecha_de_implantacion}",
          Electrodos_insertados_od=${row_paciente.Electrodos_insertados}
        WHERE id=${row_paciente.id}`
      );
    }

    else if (row_paciente.Oido_implantado === 'Bilateral') {

      await db.run(
        `UPDATE pacientes SET
          Fecha_de_implantacion_od=${row_paciente.Fecha_de_implantacion},
          Electrodos_insertados_od=${row_paciente.Electrodos_insertados},
          Fecha_de_implantacion_oi=${row_paciente.Fecha_de_implantacion},
          Electrodos_insertados_oi=${row_paciente.Electrodos_insertados}
        WHERE id=${row_paciente.id}`
      );
    }
  });
})();
