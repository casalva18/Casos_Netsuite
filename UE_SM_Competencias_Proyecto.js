/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log'], (record, log) => {

  function afterSubmit(context) {
    try {
      if (
        context.type !== context.UserEventType.CREATE &&
        context.type !== context.UserEventType.EDIT
      ) {
        return;
      }

      const newRec = context.newRecord;
      const recId = newRec.id;
      const recType = newRec.type;

      const FORMULARIO_OBJETIVO = '139';

      const formId = String(
        newRec.getValue({
          fieldId: 'customform'
        }) || ''
      );

      log.debug('Formulario actual', formId);

      if (formId !== FORMULARIO_OBJETIVO) {
        log.debug('Script omitido', 'No es el formulario objetivo');
        return;
      }

      const SUBLIST_ID = 'recmachcustrecordcustrecord_s4_parent_service';
      const LINE_FIELD_ID = 'custrecord_s4_sm_equipment_description';
      const BODY_FIELD_ID = 'custbody_sm_competencias_proyecto';

      const MAPEO_COMPETENCIAS = {
        '1': '274',
        '2': '274',
        '3': '274',
        '4': '271',
        '5': '270',
        '6': '269',
        '7': '268',
        '8': '272',
        '9': '273'
      };

      let lineCount = 0;

      try {
        lineCount = newRec.getLineCount({
          sublistId: SUBLIST_ID
        });
      } catch (sublistError) {
        log.debug('Sublista no disponible', sublistError.message);

        if (context.type === context.UserEventType.CREATE) {
          record.submitFields({
            type: recType,
            id: recId,
            values: {
              custbody_sm_estado: '1',
              custbody_sm_tipos_estado: '11'
            },
            options: {
              enableSourcing: false,
              ignoreMandatoryFields: true
            }
          });
        }

        return;
      }

      const competencias = new Set();

      for (let i = 0; i < lineCount; i++) {
        const equipmentValue = newRec.getSublistValue({
          sublistId: SUBLIST_ID,
          fieldId: LINE_FIELD_ID,
          line: i
        });

        if (!equipmentValue) {
          continue;
        }

        const competenciaId = MAPEO_COMPETENCIAS[String(equipmentValue)];

        if (competenciaId) {
          competencias.add(String(competenciaId));
        }
      }

      const competenciasFinales = Array.from(competencias);

      const valuesToUpdate = {};

      if (context.type === context.UserEventType.CREATE) {
        valuesToUpdate.custbody_sm_estado = '1';
        valuesToUpdate.custbody_sm_tipos_estado = '11';
      }

      if (competenciasFinales.length > 0) {
        valuesToUpdate[BODY_FIELD_ID] = competenciasFinales;
      }

      if (Object.keys(valuesToUpdate).length === 0) {
        return;
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

    } catch (e) {
      log.error('Error llenando competencias y estados', e);
    }
  }

  return {
    afterSubmit
  };
});