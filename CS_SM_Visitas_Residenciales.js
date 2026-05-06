/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define([], function () {

    function saveRecord(context) {
        var record = context.currentRecord;

        var articuloObjetivo = '6440';
        var itemCount = record.getLineCount({ sublistId: 'item' });

        var tieneArticulo = false;

        for (var i = 0; i < itemCount; i++) {
            var item = record.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i
            });

            if (String(item) === articuloObjetivo) {
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