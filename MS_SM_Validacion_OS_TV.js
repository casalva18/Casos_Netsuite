/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/search'], (search) => {

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

  function saveRecord(context) {
    try {
      const rec = context.currentRecord;

      const formId = String(rec.getValue({
        fieldId: 'customform'
      }) || '');

      if (formId !== FORMULARIO_OBJETIVO) {
        return true;
      }

      const generarAutomatico = rec.getValue({
        fieldId: CAMPO_GENERAR
      });

      if (generarAutomatico === true || generarAutomatico === 'T') {
        return true;
      }

      if (rec.id && existeOSTV(rec.id)) {
        return true;
      }

      alert('Debe llenar la OS TV o usar el botón "Generar OS TV" antes de guardar.');
      return false;

    } catch (e) {
      alert('Ocurrió un error validando la información de OS TV.');
      return false;
    }
  }

  return {
    saveRecord
  };
});