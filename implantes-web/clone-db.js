
const { exec } = require("child_process");
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const DATABASE_TEMP = './.tmp/data_temp.db'
const DATABASE_ANONYMOUS = './.tmp/data_anonmyous.db'

class CloneDb {

  async cloneDb() {
    return new Promise((resolve, reject) => {
      exec(`sqlite3 ./.tmp/data.db ".dump" | sqlite3 ${DATABASE_TEMP}`, (error, stdout, stderr) => {
        if ((error) || (stderr)) {
          reject(stderr);
        }
        resolve();
      });
    });
  }

  async startCloneDb() {

    try {
      if(fs.existsSync(DATABASE_TEMP)) {
        fs.unlinkSync(DATABASE_TEMP);
      }
      await this.cloneDb();
    }
    catch(e) {
      return console.log('Error clonando base de datos');
    }

    const db = await open({
      filename: DATABASE_TEMP,
      driver: sqlite3.Database
    });

    try {
      await db.run(`DROP TABLE s`)
      await db.run(`DROP TABLE components_paciente_asds`)
      await db.run(`DROP TABLE corticales`)
      await db.run(`DROP TABLE core_store`)
      await db.run(`DROP TABLE i18n_locales`)
      await db.run(`DROP TABLE strapi_administrator`)
      await db.run(`DROP TABLE strapi_permission`)
      await db.run(`DROP TABLE strapi_role`)
      await db.run(`DROP TABLE strapi_users_roles`)
      await db.run(`DROP TABLE strapi_webhooks`)
      await db.run(`DROP TABLE upload_file`)
      await db.run(`DROP TABLE upload_file_morph`)
      await db.run(`DROP TABLE 'users-permissions_role'`)
      await db.run(`DROP TABLE 'users-permissions_user'`)
      await db.run(`DROP TABLE 'users-permissions_permission'`)
    }
    catch {
      return console.log('Error borrando tablas');
    }


    const results = await db.get(`SELECT COUNT(*) count FROM pacientes`);
    const total = results.count;

    let contador = 0;
    let contador2 = 0;
    db.each(`
      SELECT id, Identificador, Identificador_anterior, NUHSA, Nombre, Apellidos, Telefono, Email FROM pacientes
    `, async (err, row_paciente) => {

      contador++;
      await db.run(`
        UPDATE pacientes SET
        Identificador='Identificador${contador}',
        Identificador_anterior='Identificador_anterior${contador}',
        NUHSA='NUHSA${contador}',
        Nombre='Nombre${contador}',
        Apellidos='Apellidos${contador}',
        Telefono='Telefono${contador}',
        Email='Email${contador}'
        WHERE id=${row_paciente.id}`);

        contador2++;
          if(contador2 === total) {
            await db.close()
            if(fs.existsSync(DATABASE_ANONYMOUS)) {
              fs.unlinkSync(DATABASE_ANONYMOUS)
            }
            fs.renameSync(DATABASE_TEMP, DATABASE_ANONYMOUS)
          }
    });
  }

  async start() {

    console.log('Clonando');
    await this.startCloneDb();
    console.log('Terminado');

    setInterval(async() => {
      console.log('Clonando');
      await this.startCloneDb();
      console.log('Terminado');
    }, 1000 * 60 * 60);
  }
}

module.exports = {
  CloneDb
}
