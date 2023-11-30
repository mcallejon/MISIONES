const implantesWeb = require('../implantes-web/implantes-web')
const conf = require('../implantes/configuracion');

(async() => {
  const implantesWebInstance = new implantesWeb.ImplantesWeb(conf);
  await implantesWebInstance.start();

})();
