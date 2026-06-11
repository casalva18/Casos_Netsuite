/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/record', 'N/log'], (record, log) => {

    const CAMPO_CLASE = 'custbody_sm_clase_servicio';

    const afterSubmit = (context) => {

        try {

            if (
                context.type !== context.UserEventType.CREATE &&
                context.type !== context.UserEventType.EDIT
            ) {
                return;
            }

            const recId = context.newRecord.id;
            const recType = context.newRecord.type;

            const orden = record.load({
                type: recType,
                id: recId,
                isDynamic: false
            });

            const totalLineas = orden.getLineCount({
                sublistId: 'item'
            });

            let claseId = '';

            for (let i = 0; i < totalLineas; i++) {

                claseId = orden.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'class',
                    line: i
                });

                if (claseId) {
                    break;
                }

            }

            if (!claseId) {
                return;
            }

            // Valor actual en cabecera
            const claseActual = orden.getValue({
                fieldId: CAMPO_CLASE
            });

            // Si ya tiene el mismo valor no hace nada
            if (String(claseActual) === String(claseId)) {
                return;
            }

            record.submitFields({
                type: recType,
                id: recId,
                values: {
                    [CAMPO_CLASE]: claseId
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }
            });

            log.audit({
                title: 'Clase actualizada',
                details: `OS ${recId} - Clase ${claseId}`
            });

        } catch (e) {

            log.error({
                title: 'Error actualizando clase servicio',
                details: e
            });

        }

    };

    return {
        afterSubmit
    };

});