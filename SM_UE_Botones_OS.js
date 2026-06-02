/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/url', 'N/log'], (url, log) => {

  function beforeLoad(context) {
    try {
      if (context.type !== context.UserEventType.VIEW) {
        return;
      }

      const form = context.form;
      const newRec = context.newRecord;

      const suiteletParcial = url.resolveScript({
        scriptId: 'customscript_sm_sl_cambiar_estado_os',
        deploymentId: 'customdeploy_sm_sl_cambiar_estado_os',
        params: {
          recId: newRec.id,
          recType: newRec.type,
          accion: 'parcial'
        }
      });

      const suiteletFinalizada = url.resolveScript({
        scriptId: 'customscript_sm_sl_cambiar_estado_os',
        deploymentId: 'customdeploy_sm_sl_cambiar_estado_os',
        params: {
          recId: newRec.id,
          recType: newRec.type,
          accion: 'finalizada'
        }
      });

      form.addButton({
        id: 'custpage_btn_visita_parcial',
        label: 'Visita Parcial',
        functionName: "window.location.href='" + suiteletParcial + "'"
      });

      form.addButton({
        id: 'custpage_btn_finalizada',
        label: 'Finalizada',
        functionName: "window.location.href='" + suiteletFinalizada + "'"
      });

    } catch (e) {
      log.error('Error agregando botones OS', e);
    }
  }

  return {
    beforeLoad
  };
});