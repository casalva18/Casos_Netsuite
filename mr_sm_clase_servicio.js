/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['N/search', 'N/record', 'N/log'], (search, record, log) => {

    const BUSQUEDA_OS = 'customsearch_sm_os_sin_clase_servicio';
    const CAMPO_CLASE = 'custbody_sm_clase_servicio';

    const getInputData = () => {
        return search.load({
            id: BUSQUEDA_OS
        });
    };

    const map = (context) => {
        const result = JSON.parse(context.value);
        const osId = result.id;

        context.write({
            key: osId,
            value: osId
        });
    };

    const reduce = (context) => {
        const osId = context.key;

        try {
            const orden = record.load({
                type: record.Type.SALES_ORDER,
                id: osId,
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

            const claseActual = orden.getValue({
                fieldId: CAMPO_CLASE
            });

            if (String(claseActual) === String(claseId)) {
                return;
            }

            record.submitFields({
                type: record.Type.SALES_ORDER,
                id: osId,
                values: {
                    [CAMPO_CLASE]: claseId
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }
            });

        } catch (e) {
            log.error({
                title: 'Error actualizando OS ' + osId,
                details: e
            });
        }
    };

    const summarize = (summary) => {
        log.audit({
            title: 'Map/Reduce finalizado',
            details: 'Proceso de actualización masiva de Clase Servicio terminado.'
        });
    };

    return {
        getInputData,
        map,
        reduce,
        summarize
    };

});