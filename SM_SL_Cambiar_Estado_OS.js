/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/redirect', 'N/log'], (record, redirect, log) => {

  function onRequest(context) {
    try {
      const recId = context.request.parameters.recId;
      const recType = context.request.parameters.recType;
      const accion = context.request.parameters.accion;

      if (!recId || !recType || !accion) {
        throw new Error('Faltan parámetros: recId, recType o accion');
      }

      let valuesToUpdate = {};

      if (accion === 'parcial') {
        valuesToUpdate = {
          custbody_sm_estado: '2',
          custbody_sm_tipos_estado: '14'
        };
      } else if (accion === 'finalizada') {
        valuesToUpdate = {
          custbody_sm_estado: '3',
          custbody_sm_tipos_estado: '16'
        };
      } else if (accion === 'enviarFacturacion') {
        const osRecord = record.load({
          type: recType,
          id: recId
        });

        const createdFrom = osRecord.getValue({ fieldId: 'createdfrom' });
        if (!createdFrom) {
          throw new Error('No se puede enviar a facturación porque la orden no tiene cotización origen.');
        }

        const quote = record.load({
          type: 'estimate',
          id: createdFrom
        });

        const approvalStatus = quote.getValue({ fieldId: 'custbody_sm_approval_status' });
        const cotizacionAprobada = String(approvalStatus) === '5';

        if (!cotizacionAprobada) {
          throw new Error('No se puede enviar a facturación porque la cotización origen no está aprobada.');
        }

        valuesToUpdate = {
          custbody_sm_enviado_fact: true,
          orderstatus: 'F'
        };
      } else {
        throw new Error('Acción no válida: ' + accion);
      }

      record.submitFields({
        type: recType,
        id: recId,
        values: valuesToUpdate,
        options: {
          enableSourcing: false,
          ignoreMandatoryFields: true
        }
      });

      redirect.toRecord({
        type: recType,
        id: recId
      });

    } catch (e) {
      log.error('Error cambiando estado OS', e);
      context.response.write('Error cambiando estado OS: ' + e.message);
    }
  }

  return {
    onRequest
  };
});