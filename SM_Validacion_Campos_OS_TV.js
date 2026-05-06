/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log'], (log) => {

  function beforeSubmit(context) {
    try {
      if (
        context.type !== context.UserEventType.CREATE &&
        context.type !== context.UserEventType.EDIT
      ) {
        return;
      }

      const newRec = context.newRecord;
      const FORMULARIO_OBJETIVO = '139';

      const formId = String(
        newRec.getValue({
          fieldId: 'customform'
        }) || ''
      );

      if (formId !== FORMULARIO_OBJETIVO) {
        return;
      }

      const SUBLIST_ID = 'recmachcustrecordcustrecord_s4_parent_service';

      let lineCount = 0;

      try {
        lineCount = newRec.getLineCount({
          sublistId: SUBLIST_ID
        });
      } catch (e) {
        throw new Error('Debe llenar el formulario de OS TV para poder programar su servicio.');
      }

      if (!lineCount || lineCount === 0) {
        throw new Error('Debe llenar el formulario de OS TV para poder programar su servicio.');
      }

    } catch (e) {
      log.error('Validación OS TV', e);
      throw e;
    }
  }

  return {
    beforeSubmit
  };
});