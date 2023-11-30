/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

const implantes = require('../../../implantes/implantes');
const configuracion = require('../../../implantes/configuracion');


module.exports = {

  lifecycles: {

    async beforeCreate(paciente) {
      implantes.completarDatosPaciente(paciente);
      implantes.completarDatosVisita(paciente);
      paciente.Identificador_anterior = paciente.Identificador;
      paciente.Visitas.forEach(visita => visita.Identificador_anterior = visita.Identificador);

      // actualiza el valor del número de visitas
      implantes.actualizarNumeroVisitas(paciente);

      // actualiza el valor del último logo y última intensidad
      implantes.actualizarUltimoLogoEIntensidad(paciente);
    },

    afterCreate(_, paciente) {

      const nombreDirectorioTipoPaciente = configuracion.obtenerNombreDirectorioPacientes();

      // crear directorios
      implantes.crearDirectorioTipoPaciente(nombreDirectorioTipoPaciente);
      implantes.crearDirectorioPaciente(paciente, nombreDirectorioTipoPaciente);
      implantes.crearDirectoriosVisitas(paciente, nombreDirectorioTipoPaciente);
    },

    async beforeUpdate(params, paciente) {

      // datos del paciente
      implantes.completarDatosPaciente(paciente);

      if ((!paciente.Nombre) || (!paciente.Apellidos)) {
        throw strapi.errors.badRequest('El nombre y el apellido son campos obligatorios')
      }

      // comprueba si se ha cambiado el identificador del paciente
      paciente.Identificador_temporal = null;
      if (paciente.Identificador !== paciente.Identificador_anterior) {
        paciente.Identificador_temporal = paciente.Identificador_anterior;
        paciente.Identificador_anterior = paciente.Identificador;
      }

      // datos de la visita
      implantes.completarDatosVisita(paciente);

      // comprueba si se ha cambiado el identificador de la visita para todas las visitas
      paciente.Visitas.forEach(visita => {

        if ((!visita.Fecha_visita) || (!visita.Tipo_visita)) {
          throw strapi.errors.badRequest('La fecha o el tipo de la visita son campos obligatorios')
        }

        visita.Identificador_temporal = null;
        if (visita.Identificador !== visita.Identificador_anterior) {
          visita.Identificador_temporal = visita.Identificador_anterior;
          visita.Identificador_anterior = visita.Identificador;
        }
      });

      // actualiza el valor del número de visitas
      implantes.actualizarNumeroVisitas(paciente);

      // actualiza el valor del último logo y última intensidad
      implantes.actualizarUltimoLogoEIntensidad(paciente);
    },

    async afterUpdate(_, __, paciente) {

      const nombreDirectorioTipoPaciente = configuracion.obtenerNombreDirectorioPacientes();

      // comprueba si se ha cambiado el identificador del paciente
      if (paciente.Identificador_temporal) {
        implantes.modificarDirectorioPaciente(paciente, nombreDirectorioTipoPaciente)
      }

      // comprueba si se ha cambiado el identificador de las visitas
      implantes.modificarDirectoriosVisitas(paciente, nombreDirectorioTipoPaciente);
      implantes.crearDirectoriosVisitas(paciente, nombreDirectorioTipoPaciente);
      implantes.eliminarDirectoriosVisitas(paciente, nombreDirectorioTipoPaciente);
    },

    async afterDelete(paciente, _) {
      const nombreDirectorioTipoPaciente = configuracion.obtenerNombreDirectorioPacientes();
      implantes.eliminarDirectorioPaciente(paciente, nombreDirectorioTipoPaciente);
    }
  },
};
