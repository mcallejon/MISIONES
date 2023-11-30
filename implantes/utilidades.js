const fs = require('fs');


module.exports  = {

  crearDirectorioSiNoExiste(directorio) {
    if (!fs.existsSync(directorio)){
      fs.mkdirSync(directorio);
    }
  },

  modificarDirectorioSiNoExiste(directorioAntiguo, directorioNuevo) {
    if (fs.existsSync(directorioAntiguo)){
      fs.renameSync(directorioAntiguo, directorioNuevo);
    }
  },

  eliminarDirectorioSiExiste(directorio) {
    if (fs.existsSync(directorio)){
      fs.rmdirSync(directorio, { recursive: true });
    }
  },

  existeDirectorio(directorio) {
    return fs.existsSync(directorio);
  },

  obtenerDirectoriosInternos(directorio) {
    return fs.readdirSync(directorio)
    .filter( file => fs.statSync(`${directorio}/${file}`).isDirectory())
    .map(file => `${directorio}/${file}`);
  },

  obtenerArchivosXML(directorio) {
    return fs.readdirSync(directorio)
    .filter( file => fs.statSync(`${directorio}/${file}`).isFile() && (file.slice(file.lastIndexOf('.')) === '.xml'))
    .map(file => `${directorio}/${file}`);
  },

  obtenerNombreDeDirectorio(directorio) {
    return directorio.slice(directorio.lastIndexOf('/') + 1);
  },

  obtenerNombresDeDirectorios(directorio) {
    return fs.readdirSync(directorio, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
  }
}
