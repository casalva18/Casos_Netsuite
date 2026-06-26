/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/url', 'N/log', 'N/runtime'], (url, log, runtime) => {

  function beforeLoad(context) {
    try {
      if (context.type !== context.UserEventType.VIEW) {
        return;
      }

      const form = context.form;
      const newRec = context.newRecord;
      const currentRole = runtime.getCurrentUser().role;
      const ROL_FACTURACION = 1020;
      const enviadoFact = newRec.getValue({ fieldId: 'custbody_sm_enviado_fact' });

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

      if (currentRole === ROL_FACTURACION && enviadoFact !== true) {
        form.addButton({
          id: 'custpage_btn_enviar_facturacion',
          label: 'Enviar a Facturación',
          functionName: 'enviarFacturacion'
        });
      }

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