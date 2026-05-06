/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/currentRecord'], function(currentRecord) {

    var itemsEscaleras = [
        797,3441,3442,798,3443,3444,799,3445,3446,
        800,3447,3448,
        803,
        804,3449,3450,
        2176,
        2178,
        6246,6247
    ];

    var mapaDescripcionEquipo = {
        797: 7,
        3441: 7,
        3442: 6,

        798: 7,
        3443: 7,
        3444: 6,

        799: 7,
        3445: 7,
        3446: 6,

        800: 5,
        3447: 5,
        3448: 4,

        803: 1,

        804: 5,
        3449: 5,
        3450: 4,

        2176: 8,
        2178: 9,

        6246: 5,
        6247: 4
    };

    function pageInit(context) {
        // Requerido por NetSuite.
    }

    function esArticuloValido(itemId) {
        return itemsEscaleras.indexOf(Number(itemId)) !== -1;
    }

    function obtenerDescripcionEquipo(itemId) {
        return mapaDescripcionEquipo[Number(itemId)] || '';
    }

    function extraerDatosDescripcion(descripcion) {
        var resultado = {
            paradas: '',
            empresa: ''
        };

        if (!descripcion) {
            return resultado;
        }

        var texto = descripcion.toUpperCase().trim();

        // Ej: 12P, 12 P, 23p
        var matchParadas = texto.match(/(\d+)\s*P\b/i);
        if (matchParadas) {
            resultado.paradas = matchParadas[1];
        }

        // Ej: EMP MTTO MITSUBISHI
        var matchEmpresa = texto.match(/EMP\s*MTTO\s*(.*)$/i);
        if (matchEmpresa && matchEmpresa[1]) {
            resultado.empresa = matchEmpresa[1].trim();
        }

        // Ej: MTTO PROPIA
        if (/MTTO\s+PROPIA/i.test(texto)) {
            resultado.empresa = 'PROPIA';
        }

        return resultado;
    }

    function generarOSTV() {

        var rec = currentRecord.get();

        var formId = rec.getValue({
            fieldId: 'customform'
        });

        if (Number(formId) !== 139) {
            alert('Este botón solo aplica para el formulario de Escaleras.');
            return;
        }

        var lineCount = rec.getLineCount({
            sublistId: 'item'
        });

        if (lineCount === 0) {
            alert('No hay artículos para procesar.');
            return;
        }

        var resultado = [];

        for (var i = 0; i < lineCount; i++) {

            var itemId = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i
            });

            if (!esArticuloValido(itemId)) {
                continue;
            }

            var cantidad = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: i
            });

            var descripcion = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'description',
                line: i
            });

            var descripcionEquipo = obtenerDescripcionEquipo(itemId);
            var datosDescripcion = extraerDatosDescripcion(descripcion);

            resultado.push(
                'Item: ' + itemId +
                ' | Equipos: ' + cantidad +
                ' | Descripción equipo ID: ' + descripcionEquipo +
                ' | Paradas: ' + datosDescripcion.paradas +
                ' | Empresa MTTO: ' + datosDescripcion.empresa
            );
        }

        if (resultado.length === 0) {
            alert('No hay artículos válidos para OS TV.');
            return;
        }
        rec.setValue({
        fieldId: 'custbody_sm_generar_ostv_auto',
        value: true
});
        alert('Datos detectados para OS TV:\n\n' + resultado.join('\n'));
    }

    return {
        pageInit: pageInit,
        generarOSTV: generarOSTV
    };
});