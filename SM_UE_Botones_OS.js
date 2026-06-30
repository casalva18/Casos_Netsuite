/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/url', 'N/log', 'N/runtime', 'N/search', 'N/ui/serverWidget'],(url, log, runtime, search, serverWidget) => {

  function beforeLoad(context) {
    try {
      if (context.type !== context.UserEventType.VIEW) {
        return;
      }

      const form = context.form;
      const newRec = context.newRecord;
      const currentRole = runtime.getCurrentUser().role;
      const ROLES_VISITAS = [
        3
      ];
      const ROLES_FACTURACION = [
        3,
        1020
      ];
      const enviadoFact = newRec.getValue({ fieldId: 'custbody_sm_enviado_fact' });
      const createdFrom = newRec.getValue({ fieldId: 'createdfrom' });

      let cotizacionAprobada = false;
      if (createdFrom) {
        try {
          const lookup = search.lookupFields({
            type: 'estimate',
            id: createdFrom,
            columns: ['custbody_sm_approval_status']
          });
          const approvalField = lookup.custbody_sm_approval_status;
          if (approvalField === '5' || (Array.isArray(approvalField) && approvalField[0] && String(approvalField[0].value) === '5')) {
            cotizacionAprobada = true;
          }
        } catch (e) {
          log.error('Error consultando cotización origen', e);
        }
      }

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

      if (ROLES_VISITAS.indexOf(currentRole) !== -1) {
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
      }

      if (ROLES_FACTURACION.indexOf(currentRole) !== -1 && enviadoFact !== true && cotizacionAprobada) {
        form.addButton({
          id: 'custpage_btn_enviar_facturacion',
          label: 'Enviar a Facturación',
          functionName: 'enviarFacturacion'
        });
      }

      const campoEnviadoFact = form.getField({ id: 'custbody_sm_enviado_fact' });
      if (campoEnviadoFact) {
        campoEnviadoFact.updateDisplayType({
          displayType: serverWidget.FieldDisplayType.DISABLED
        });
      }

    } catch (e) {
      log.error('Error agregando botones OS', e);
    }
  }

  return {
    beforeLoad
  };
});