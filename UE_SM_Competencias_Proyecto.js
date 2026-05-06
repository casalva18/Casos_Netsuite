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

      // Solo ejecutar para este formulario
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

      // Sublista y campos
      const SUBLIST_ID = 'recmachcustrecordcustrecord_s4_parent_service';
      const LINE_FIELD_ID = 'custrecord_s4_sm_equipment_description';
      const BODY_FIELD_ID = 'custbody_sm_competencias_proyecto';

      // Mapeo: equipo de línea -> competencia proyecto
      const MAPEO_COMPETENCIAS = {
        '1': '274', // PUERTA HORIZONTAL VERSIÓN 2014 -> PUERTA 2014
        '2': '274', // PUERTA VERTICAL VERSIÓN 2014   -> PUERTA 2014
        '3': '274', // PUERTA GIRATORIA VERSIÓN 2014  -> PUERTA 2014
        '4': '271', // ESCALERAS Y/O ANDENES VERSIÓN 2021 -> ESCALERA Y/O ANDÉN 2021
        '5': '270', // ESCALERAS Y/O ANDENES VERSIÓN 2012 -> ESCALERA Y/O ANDÉN 2012
        '6': '269', // ASCENSORES VERSIÓN 2021 -> ASCENSOR 2021
        '7': '268', // ASCENSORES VERSIÓN 2012 -> ASCENSOR 2012
        '8': '272', // PLATAFORMAS VERSIÓN 2018 -> PLATAFORMA 2018
        '9': '273'  // SALVAESCALERAS VERSIÓN 2018 -> SALVAESCALERA 2018
      };

      let lineCount = 0;

      try {
        lineCount = newRec.getLineCount({
          sublistId: SUBLIST_ID
        });
      } catch (sublistError) {
        log.debug('Sublista no disponible', sublistError.message);

        // Aun si no hay sublista, sí actualiza los estados para este formulario
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
        return;
      }

      log.debug('Line Count', lineCount);

      const competencias = new Set();

      for (let i = 0; i < lineCount; i++) {
        const equipmentValue = newRec.getSublistValue({
          sublistId: SUBLIST_ID,
          fieldId: LINE_FIELD_ID,
          line: i
        });

        log.debug('Valor línea ' + i, equipmentValue);

        if (!equipmentValue) {
          continue;
        }

        const competenciaId = MAPEO_COMPETENCIAS[String(equipmentValue)];

        if (competenciaId) {
          competencias.add(String(competenciaId));
        }
      }

      const competenciasFinales = Array.from(competencias);

      log.debug('Resultado final', competenciasFinales);

      const valuesToUpdate = {
        custbody_sm_estado: '1',
        custbody_sm_tipos_estado: '11'
      };

      if (competenciasFinales.length > 0) {
        valuesToUpdate[BODY_FIELD_ID] = competenciasFinales;
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