/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define([], () => {

  function saveRecord(context) {
    try {
      const rec = context.currentRecord;

      const FORMULARIO_OBJETIVO = '139';
      const SUBLIST_ID = 'recmachcustrecordcustrecord_s4_parent_service';

      const formId = String(rec.getValue({
        fieldId: 'customform'
      }) || '');

      // Solo aplicar a este formulario
      if (formId !== FORMULARIO_OBJETIVO) {
        return true;
      }

      let lineCount = 0;

      try {
        lineCount = rec.getLineCount({
          sublistId: SUBLIST_ID
        });
      } catch (e) {
        alert('Debe llenar el formulario de OS TV para poder programar su servicio.');
        return false;
      }

      // Validar que tenga al menos una línea
      if (!lineCount || lineCount === 0) {
        alert('Debe llenar el formulario de OS TV para poder programar su servicio.');
        return false;
      }

      return true;

    } catch (e) {
      alert('Ocurrió un error validando la información de OS TV.');
      return false;
    }
  }

  return {
    saveRecord
  };
});