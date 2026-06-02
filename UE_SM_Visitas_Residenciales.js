/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/error'], function(error) {

    function beforeSubmit(context) {

        var record = context.newRecord;

        var articulosObjetivo = ['6440', '6444', '6443', '6441', '6442'];
        var campoObligatorio = record.getValue({
            fieldId: 'custbody_sm_visitas_residenciales'
        });

        var itemCount = record.getLineCount({
            sublistId: 'item'
        });

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

        if (tieneArticulo && !campoObligatorio) {
            throw error.create({
                name: 'VISITAS_RESIDENCIALES_OBLIGATORIO',
                message: 'Debe diligenciar el campo Visitas Residenciales cuando la cotización contiene el artículo INSPECCION RETIE USO FINAL BASICAS RESIDENCIAL.',
                notifyOff: false
            });
        }
    }

    return {
        beforeSubmit: beforeSubmit
    };
});