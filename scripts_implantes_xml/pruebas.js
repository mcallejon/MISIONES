
const xml = require("../implantes/xml");
const fs = require('fs');


(async () => {


  const datos1 = xml.obtenerDatosAudiometria('D:/workspace_home/workspace_implantes/data/PACIENTES/CAROLINA_MERA_TORNER/2021-June-29-Corticales/carolina.mera(Selected Session).xml')
  console.log(datos1)

  // const datos1 = xml.obtenerDatosLogo('./../../data/PACIENTES/ADRIÁN_REINA_HURTADO/2021-July-1-Corticales/audiometria(Selected Session).xml')
  // const datos2 = xml.obtenerDatosLogo('./../../data/PACIENTES/MIGUEL_FLORENCIO_JIMÉNEZ/2021-June-6-Corticales/audiometria(Selected Session).xml')

  // console.log(JSON.stringify(datos1))
  // console.log(datos2)

  // fs.writeFileSync(
  //   '../docs/XML/via.aerea(Selected Session).json',
  //   JSON.stringify(xml.obtenerDatosAudiometria('../docs/XML/via.aerea(Selected Session).xml'), null, 4));

  // fs.writeFileSync(
  //   '../docs/XML/via.osea(Selected Session).json',
  //   JSON.stringify(xml.obtenerDatosAudiometria('../docs/XML/via.osea(Selected Session).xml'), null, 4));

  // fs.writeFileSync(
  //   '../docs/XML/via.osea.y.aerea(Selected Session).json',
  //   JSON.stringify(xml.obtenerDatosAudiometria('../docs/XML/via.osea.y.aerea(Selected Session).xml'), null, 4));

  // fs.writeFileSync(
  //   '../docs/XML/enmascarada.cascos.OI.json',
  //   JSON.stringify(xml.obtenerDatosAudiometria('../docs/XML/enmascarada.cascos.OI.xml'), null, 4));

  // fs.writeFileSync(
  //   '../docs/XML/logoaudiometria(Selected Session).json',
  //   JSON.stringify(xml.obtenerDatosLogo('../docs/XML/logoaudiometria(Selected Session).xml'), null, 4));

  // fs.writeFileSync(
  //   '../docs/XML/logo(Selected Session).json',
  //   JSON.stringify(xml.obtenerDatosLogo('../docs/XML/logo(Selected Session).xml'), null, 4));

})();
