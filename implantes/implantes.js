const utilidades = require('../implantes/utilidades');
const configuracion = require('../implantes/configuracion');

function generarPacienteId (nombre, apellidos) {
  return `${nombre.trim()}_${apellidos.trim()}`
    .replace(/\s{2,}/g,' ')
    .trim()
    .replace(/ /g, '_')
    .toUpperCase();
}

const meses = ['January', 'Februrary', 'March', 'April', 'May', 'June',
'July', 'August', 'September', 'October', 'November', 'December'];


function obtenerEdad (fechaDeNacimiento) {
  const fecha = new Date(fechaDeNacimiento);
  const ahora = new Date();
  return Math.floor((ahora - fecha) / 1000 / 60 / 60 / 24 / 365.256363);
}

module.exports  = {

  crearDirectorioTipoPaciente(tipoPaciente) {
    const directorioPacientes = `${configuracion.obtenerDirectorioDatos()}/${tipoPaciente}`;
    utilidades.crearDirectorioSiNoExiste(directorioPacientes);
  },

  completarDatosPaciente(paciente) {
    paciente.Identificador = generarPacienteId(paciente.Nombre, paciente.Apellidos);
    paciente.Edad = obtenerEdad(paciente.Fecha_de_nacimiento);
    if(paciente.Edad < 0) paciente.Edad = 0;
  },

  actualizarNumeroVisitas(paciente) {


    paciente.Numero_de_visitas_corticales = 0;
    paciente.Numero_de_visitas_audiometria = 0;
    paciente.Numero_de_visitas_programacion = 0;
    paciente.Numero_de_visitas_pupilometria = 0;
    paciente.Numero_de_visitas_neuroimagen = 0;
    paciente.Numero_de_visitas_llamada = 0;
    paciente.Numero_de_visitas_total = 0;

    paciente.Visitas.forEach(visita => {

      if (visita.Tipo_visita === 'Corticales') {
        paciente.Numero_de_visitas_corticales += 1;
      }
      else if (visita.Tipo_visita === 'Audiometría') {
        paciente.Numero_de_visitas_audiometria += 1;
      }
      else if (visita.Tipo_visita === 'Programación') {
        paciente.Numero_de_visitas_programacion += 1;
      }
      else if (visita.Tipo_visita === 'Pupilometría') {
        paciente.Numero_de_visitas_pupilometria += 1;
      }
      else if (visita.Tipo_visita === 'Neuroimagen') {
        paciente.Numero_de_visitas_neuroimagen += 1;
      }
      else if (visita.Tipo_visita === 'Llamada') {
        paciente.Numero_de_visitas_llamada += 1;
      }
    });

    paciente.Numero_de_visitas_total = paciente.Numero_de_visitas_corticales + paciente.Numero_de_visitas_audiometria + paciente.Numero_de_visitas_programacion + paciente.Numero_de_visitas_pupilometria + paciente.Numero_de_visitas_neuroimagen + paciente.Numero_de_visitas_llamada;
  },

  actualizarUltimoLogoEIntensidad(paciente) {

    const visitas = paciente.Visitas;

    paciente.Ultimo_logo = 'NULL';
    paciente.Ultima_intensidad = 'NULL';

    if(visitas.length > 0) {

      const ultimaVisita = visitas[visitas.length - 1];

      paciente.Ultimo_logo = (ultimaVisita.Logo_audiometria_od) ? ultimaVisita.Logo_audiometria_od : paciente.Ultimo_logo;
      paciente.Ultimo_logo = (ultimaVisita.Logo_audiometria_oi) ? ultimaVisita.Logo_audiometria_oi : paciente.Ultimo_logo ;

      paciente.Ultima_intensidad = (ultimaVisita.Intensidad_logo_od) ? ultimaVisita.Intensidad_logo_od : paciente.Ultima_intensidad;
      paciente.Ultima_intensidad = (ultimaVisita.Intensidad_logo_oi) ? ultimaVisita.Intensidad_logo_oi : paciente.Ultima_intensidad;
    }
  },

  crearDirectorioPaciente(paciente, tipoPaciente) {
    const directorioPaciente = `${configuracion.obtenerDirectorioDatos()}/${tipoPaciente}/${paciente.Identificador}`;
    utilidades.crearDirectorioSiNoExiste(directorioPaciente);
  },

  modificarDirectorioPaciente(paciente, tipoPaciente) {
    const directorioPacienteAntiguo = `${configuracion.obtenerDirectorioDatos()}/${tipoPaciente}/${paciente.Identificador_temporal}`;
    const directorioPacienteNuevo = `${configuracion.obtenerDirectorioDatos()}/${tipoPaciente}/${paciente.Identificador}`;
    utilidades.modificarDirectorioSiNoExiste(directorioPacienteAntiguo, directorioPacienteNuevo);
  },

  eliminarDirectorioPaciente(paciente, tipoPaciente) {
    const directorioPaciente = `${configuracion.obtenerDirectorioDatos()}/${tipoPaciente}/${paciente.Identificador}`;
    utilidades.eliminarDirectorioSiExiste(directorioPaciente);
  },

  completarDatosVisita(paciente) {
    paciente.Visitas.forEach(visita => {
      const date = new Date(visita.Fecha_visita);
      visita.Identificador = `${date.getFullYear()}-${meses[date.getMonth()]}-${date.getDate()}-${visita.Tipo_visita}`;
    })
  },

  crearDirectoriosVisitas(paciente, tipoPaciente) {
    const directorioPaciente = `${configuracion.obtenerDirectorioDatos()}/${tipoPaciente}/${paciente.Identificador}`;
    paciente.Visitas.forEach(visita => {
      const directorioVisita = `${directorioPaciente}/${visita.Identificador}`;
      utilidades.crearDirectorioSiNoExiste(directorioVisita);
    });
  },

  modificarDirectoriosVisitas(paciente, tipoPaciente) {
    const directorioPaciente = `${configuracion.obtenerDirectorioDatos()}/${tipoPaciente}/${paciente.Identificador}`;
    paciente.Visitas.forEach(visita => {
      if (visita.Identificador_temporal) {
        const directorioVisitaAntiguo = `${directorioPaciente}/${visita.Identificador_temporal}`;
        const directorioVisitaNuevo = `${directorioPaciente}/${visita.Identificador}`;
        utilidades.modificarDirectorioSiNoExiste(directorioVisitaAntiguo, directorioVisitaNuevo);
      }
    });
  },

  eliminarDirectoriosVisitas(paciente, tipoPaciente) {
    const directorioPaciente = `${configuracion.obtenerDirectorioDatos()}/${tipoPaciente}/${paciente.Identificador}`;
    const directoriosVisitas = utilidades.obtenerNombresDeDirectorios(directorioPaciente);
    const identificadoresPacientes = paciente.Visitas.map(visita => visita.Identificador);

    directoriosVisitas.forEach(directorioVisita => {
      if(identificadoresPacientes.indexOf(directorioVisita) === -1) {
        utilidades.eliminarDirectorioSiExiste(`${directorioPaciente}/${directorioVisita}`)
      }
    });
  }

}
