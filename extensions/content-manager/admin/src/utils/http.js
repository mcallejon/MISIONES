module.exports  = {

  ocultarCampoFormulario(id) {

    const element = document.getElementById(id);
    let parentNode = element?.parentNode;
    while (parentNode && (!parentNode.className.startsWith('col'))) {
      parentNode = parentNode.parentNode;
    }

    parentNode?.classList?.add('d-none');
  },

  ocultarCampoCompuesto(nombre) {

    const mySpans = document.getElementsByTagName('span');

    for(let i=0; i<mySpans.length; i++){

      if(mySpans[i].innerHTML.startsWith(`${nombre}&nbsp;`)) {
        mySpans[i].parentNode.parentNode.parentNode.classList.add('d-none');
      }
    }
  },

  mostrarCampoCompuesto(nombre) {

    const mySpans = document.getElementsByTagName('span');

    for(let i=0; i<mySpans.length; i++){

      if(mySpans[i].innerHTML.startsWith(`${nombre}&nbsp;`)) {
        mySpans[i].parentNode.parentNode.parentNode.classList.remove('d-none');
      }
    }
  },

  mostrarCampoFormulario(id) {

    const element = document.getElementById(id);
    let parentNode = element?.parentNode;
    while (parentNode && (!parentNode.className.startsWith('col'))) {
      parentNode = parentNode.parentNode;
    }
    parentNode?.classList?.remove('d-none');
  }

}
