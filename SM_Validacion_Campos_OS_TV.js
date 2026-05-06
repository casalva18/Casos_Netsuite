/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/search'], (log, search) => {

  const FORMULARIO_OBJETIVO = '139';
  const CAMPO_GENERAR = 'custbody_sm_generar_ostv_auto';

  const RECORD_OS_TV = 'customrecord_s4_sm_service_scope';
  const PARENT_FIELD = 'custrecordcustrecord_s4_parent_service';

  function existeOSTV(parentId) {
    if (!parentId) return false;

    const result = search.create({
      type: RECORD_OS_TV,
      filters: [
        [PARENT_FIELD, 'anyof', parentId]
      ],
      columns: ['internalid']
    }).run().getRange({
      start: 0,
      end: 1
    });

    return result && result.length > 0;
  }

  function beforeSubmit(context) {
    try {
      if (
        context.type !== context.UserEventType.CREATE &&
        context.type !== context.UserEventType.EDIT
      ) {
        return;
      }

      const newRec = context.newRecord;

      const formId = String(newRec.getValue({
        fieldId: 'customform'
      }) || '');

      if (formId !== FORMULARIO_OBJETIVO) {
        return;
      }

      const generarAutomatico = newRec.getValue({
        fieldId: CAMPO_GENERAR
      });

      if (generarAutomatico === true || generarAutomatico === 'T') {
        return;
      }

      if (existeOSTV(newRec.id)) {
        return;
      }

      throw new Error('Debe llenar la OS TV o usar el botón "Generar OS TV" antes de guardar.');

    } catch (e) {
      log.error('Validación OS TV', e);
      throw e;
    }
  }

  return {
    beforeSubmit
  };
});