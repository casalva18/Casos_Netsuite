/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define([], function () {

    function saveRecord(context) {
        var record = context.currentRecord;

        var articulosObjetivo = ['6440', '6444', '6443', '6441', '6442'];
        var itemCount = record.getLineCount({ sublistId: 'item' });

        var tieneArticulo = false;

        for (var i = 0; i < itemCount; i++) {
            var item = record.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i
            });

            if (articulosObjetivo.indexOf(String(item)) !== -1) {
                tieneArticulo = true;
                break;
            }
        }

        var campo = record.getValue({
            fieldId: 'custbody_sm_visitas_residenciales'
        });

        if (tieneArticulo && !campo) {
            alert('⚠️ Debe diligenciar el campo "Visitas Residenciales" para este tipo de inspección.');
            return false;
        }

        return true;
    }

    return {
        saveRecord: saveRecord
    };
});