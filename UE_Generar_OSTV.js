/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/ui/serverWidget'], function(serverWidget) {

    function beforeLoad(context) {

        if (context.type !== context.UserEventType.CREATE &&
            context.type !== context.UserEventType.EDIT) {
            return;
        }

        var form = context.form;

        // Vincular Client Script
        form.clientScriptModulePath = './CS_Generar_OSTV.js';

        // Botón SIEMPRE visible
        form.addButton({
            id: 'custpage_btn_generar_ostv',
            label: 'Generar OS TV',
            functionName: 'generarOSTV'
        });
    }

    return {
        beforeLoad: beforeLoad
    };
});