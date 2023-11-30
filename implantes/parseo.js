const xml_old = require('./xml_old')
const xml = require('./xml')
const utilidades = require('./utilidades');
const conf = require('./configuracion');
const STRAPI_COLECCION = 'pacientes';

class Parseo {

  constructor(ws, directorioPacientes) {
    this.ws = ws;
    this.directorioPacientes = directorioPacientes;
  };

  async actualizarPaciente(paciente) {
    strapi.query(STRAPI_COLECCION).update(
      { Identificador: paciente.Identificador },
      paciente
    );
  }

  async procesarPacientes() {

    if (!utilidades.existeDirectorio(this.directorioPacientes)) {
      return;
    }

    // obtiene directorios de pacientes
    const directoriosPacientes = utilidades.obtenerDirectoriosInternos(this.directorioPacientes);

    if (directoriosPacientes.length === 0) {
      return;
    }

    // procesa los pacientes
    for(let directorioPaciente of directoriosPacientes) {
      await this.procesarPaciente(directorioPaciente);
    }
  };

  async procesarPaciente(directorioPaciente) {

    const identificadorPaciente = utilidades.obtenerNombreDeDirectorio(directorioPaciente);
    const pacientes = await strapi.query(STRAPI_COLECCION).find({ Identificador: identificadorPaciente });

    if(pacientes.length === 0) {
      return;
    }

    const paciente = pacientes[0];

    const directorioVisitas = utilidades.obtenerDirectoriosInternos(directorioPaciente)

    // procesa las visitas
    let actualizar = false;
    for(let directorioVisita of directorioVisitas) {
      if(await this.procesarVisita(directorioVisita, paciente)) {
        actualizar = true;
      }
    }

    if (actualizar) {
      this.actualizarPaciente(paciente);
    }
  };

  async procesarVisita(directorioVisita, paciente) {

    let actualizar = false;

    const identificadorVisita = utilidades.obtenerNombreDeDirectorio(directorioVisita);
    const visita = paciente.Visitas.find(v => v.Identificador === identificadorVisita);

    if(!visita) {
      return actualizar;
    }

    // procesa la audiometria
    const archivoAudiometrias = utilidades.obtenerArchivosXML(directorioVisita);
    if(await this.procesarAudiometria(archivoAudiometrias, paciente, visita)) {
      actualizar = true;
    }

    // procesa los corticales
	  const directorio = `${directorioVisita}/${conf.obtenerNombreDirectorioDatosExportados()}/`;
    if (utilidades.existeDirectorio(directorio)) {
      const archivosCorticales = utilidades.obtenerArchivosXML(directorio);
      if(await this.procesarCorticales(archivosCorticales, paciente, visita)) {
        actualizar = true;
      }
    }

    return actualizar;
  };

  async procesarAudiometria(archivosAudiometrias, paciente, visita) {

    let actualizar = false;
    let contador = 0;

    if (visita.Audiometrias.length == 0) {

      for (let archivoAudiometria of archivosAudiometrias) {

        const audiometria =  xml_old.obtenerDatosAudiometria(archivoAudiometria);
        const audiometrias =  xml.obtenerDatosAudiometria(archivoAudiometria)
        const nombreArchivoAudiometria = (archivoAudiometria.lastIndexOf('/') > -1) ?
          archivoAudiometria.slice(archivoAudiometria.lastIndexOf('/')+1) :
          archivoAudiometria;
        const logo =  xml.obtenerDatosLogo(archivoAudiometria)

        visita.Audiometrias.push({
          Nombre_archivo: nombreArchivoAudiometria,
          Audiometria_izquierda: {
            Frequency: audiometria.Left.Frequency,
            IntensityUT: audiometria.Left.IntensityUT,
            SignalType: audiometria.Left.SignalType
          },
          Audiometria_derecha: {
            Frequency: audiometria.Right.Frequency,
            IntensityUT: audiometria.Right.IntensityUT,
            SignalType: audiometria.Right.SignalType
          },
          Audiometrias: audiometrias,
          Logo: logo
        });

        contador++;
      }
    }

    if (contador > 0) {
      actualizar = true;

      this.ws.send(`<pre>${paciente.Identificador} (${visita.Identificador}): Audiometrías (${contador} archivos cargados)</pre>`);
    }

    return actualizar;
  };

  async procesarCorticales(archivosCorticales, paciente, visita) {

    let actualizar = false;

    if ((archivosCorticales.length > 0) && (visita.Corticales.length == 0)) {

      actualizar = true;

      let contador = 0;
      for (let archivoCorticales of archivosCorticales) {
        visita.Corticales.push(xml.obtenerDatosCorticales(archivoCorticales))
        contador ++;
      }

      this.ws.send(`<pre>${paciente.Identificador} (${visita.Identificador}): Corticales (${contador} archivos cargados)</pre>`);
    }

    return actualizar;
  };
}

module.exports  = {
  Parseo
}
