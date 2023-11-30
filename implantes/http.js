module.exports  = {

  ocultarCampoFormulario(element) {
    element.parentNode.parentNode.parentNode.parentNode.classList.add('d-none');
  },

  mostrarCampoFormulario(element) {
    element.parentNode.parentNode.parentNode.parentNode.classList.remove('d-none');
  }

}
