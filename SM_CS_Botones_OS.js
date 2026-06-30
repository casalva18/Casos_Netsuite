/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/currentRecord', 'N/url'], (currentRecord, url) => {

  function pageInit(context) {}

  function visitaParcial() {
    cambiarEstado('parcial');
  }

  function finalizada() {
    cambiarEstado('finalizada');
  }

  function enviarFacturacion() {
    if (!confirm('¿Está seguro de enviar esta Orden de Servicio a Facturación?')) {
      return;
    }
    cambiarEstado('enviarFacturacion');
  }

  function cambiarEstado(accion) {
    const rec = currentRecord.get();

    const suiteletUrl = url.resolveScript({
      scriptId: 'customscript_sm_sl_cambiar_estado_os',
      deploymentId: 'customdeploy_sm_sl_cambiar_estado_os',
      params: {
        recId: rec.id,
        recType: rec.type,
        accion: accion
      }
    });

    window.location.href = suiteletUrl;
  }

  return {
    pageInit,
    visitaParcial,
    finalizada,
    enviarFacturacion
  };
});