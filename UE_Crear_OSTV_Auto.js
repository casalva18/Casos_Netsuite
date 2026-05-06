/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/log'], (record, search, log) => {

    const FORMULARIO_OBJETIVO = '139';
    const CAMPO_GENERAR = 'custbody_sm_generar_ostv_auto';

    const RECORD_OS_TV = 'customrecord_s4_sm_service_scope';
    const PARENT_FIELD = 'custrecordcustrecord_s4_parent_service';

    const BODY_DIRECCION = 'custbody_sm_direccion';
    const BODY_DEPARTAMENTO = 'custbodysm_departamento_nslc';
    const BODY_CIUDAD = 'custbodysm_ciudad_o_municipio_nslc';

    const BODY_COMPETENCIAS = 'custbody_sm_competencias_proyecto';

    const MAPEO_COMPETENCIAS = {
        '1': '274',
        '2': '274',
        '3': '274',
        '4': '271',
        '5': '270',
        '6': '269',
        '7': '268',
        '8': '272',
        '9': '273'
    };

    const itemsValidos = [
        797,3441,3442,798,3443,3444,799,3445,3446,
        800,3447,3448,803,804,3449,3450,
        2176,2178,6246,6247
    ];

    const mapaDescripcionEquipo = {
        797: 7, 3441: 7, 3442: 6,
        798: 7, 3443: 7, 3444: 6,
        799: 7, 3445: 7, 3446: 6,
        800: 5, 3447: 5, 3448: 4,
        803: 1,
        804: 5, 3449: 5, 3450: 4,
        2176: 8,
        2178: 9,
        6246: 5, 6247: 4
    };

    const mapaEmpresaMtto = {
        'INTERLIF': 1,
        'OTIS': 2,
        'VIA ELEVADORES': 3,
        'SOLUCIONES VERTICALES': 4,
        'PROPIA': 5,
        'SCALA ASCENSORES': 6,
        'ESTILO': 7,
        'RIGHA': 8,
        'MITSUBISHI': 9,
        'SCHINDLER': 10,
        'TKE ELEVADORES': 11,
        'LIFT INGENIERIA SAS': 12,
        'R PUERTAS': 13,
        'PUERTAS MB INGENIERIA': 14,
        'PANTEC': 15,
        'TECNIASCENSORES': 16,
        'PH HOLDINGS': 17,
        'PROCESOS VERTICALES': 19,
        'ROLLIET': 20,
        'LA IMPERIAL': 21,
        'ASCONOR': 22,
        'NIKE': 23,
        'IVEGAS': 24,
        'ASCENDENTE ASCENSORES': 25,
        'EXMELL': 26,
        'EUROWINDOOR': 27,
        'INDUVENTAS EMPRESARIAL': 28,
        'INGE PAC INGENIERIA SAS': 29,
        'GECKO': 30,
        'TECNIVEC': 31,
        'ASCEL': 32,
        'DOMA ELECTRONICA': 33,
        'INGETRAVERT': 34,
        'ENGICORP LIFTS': 35,
        'ELEVADORES EYM': 36,
        'ASCENSORES GOLD SYSTEM': 37,
        'TECNOLOGIA EN ASCENSORES': 38,
        'ELECTROMECANICA EN ASCENSORES': 39,
        'SERTEEL': 41,
        'INGEPAR': 42,
        'ESTILO INGENIERIA': 43,
        'TELEFONOS & CITOFONOS SAS': 44,
        'ALSANTEC ELEVADORES': 45,
        'ASCENSORES GRAM': 46,
        'ELEVAR ASCENSORES': 47,
        'ELEVATOR': 48,
        'SUPERVISA': 49,
        'ACCESS CONTROL': 50,
        'EUROLIFT': 51,
        'ELARINGENERIA': 52,
        'TECNOTRANS': 53,
        'ESPARTA SOLUCIONES': 56,
        'CONTROL IN': 58,
        'ADVANCED ELEVADORES': 59,
        'GRUPO BRABANTE': 60,
        'G&C PUERTAS ELECTRICAS': 62
    };

    function normalizar(texto) {
        return String(texto || '')
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[.]/g, '')
            .replace(/-/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function esItemValido(itemId) {
        return itemsValidos.indexOf(Number(itemId)) !== -1;
    }

    function extraerDatosDescripcion(descripcion) {
        const resultado = { paradas: '', empresa: '' };

        if (!descripcion) return resultado;

        const texto = normalizar(descripcion);

        const matchParadas = texto.match(/(\d+)\s*P\b/i);
        if (matchParadas) {
            resultado.paradas = matchParadas[1];
        }

        const matchEmpresa = texto.match(/EMP\s*MTTO\s*(.*)$/i);
        if (matchEmpresa && matchEmpresa[1]) {
            resultado.empresa = normalizar(matchEmpresa[1]);
        }

        if (/MTTO\s+PROPIA/i.test(texto)) {
            resultado.empresa = 'PROPIA';
        }

        return resultado;
    }

    function obtenerEmpresaId(nombreEmpresa) {
        const empresaNormalizada = normalizar(nombreEmpresa);

        if (!empresaNormalizada) return '';

        if (mapaEmpresaMtto[empresaNormalizada]) {
            return mapaEmpresaMtto[empresaNormalizada];
        }

        for (let nombre in mapaEmpresaMtto) {
            if (
                empresaNormalizada.indexOf(nombre) !== -1 ||
                nombre.indexOf(empresaNormalizada) !== -1
            ) {
                return mapaEmpresaMtto[nombre];
            }
        }

        return '';
    }

    function eliminarOSTVExistente(parentId) {
        const resultados = search.create({
            type: RECORD_OS_TV,
            filters: [[PARENT_FIELD, 'anyof', parentId]],
            columns: ['internalid']
        }).run().getRange({
            start: 0,
            end: 1000
        });

        resultados.forEach(r => {
            record.delete({
                type: RECORD_OS_TV,
                id: r.getValue('internalid')
            });
        });
    }

    function afterSubmit(context) {
        try {
            if (
                context.type !== context.UserEventType.CREATE &&
                context.type !== context.UserEventType.EDIT
            ) {
                return;
            }

            const rec = context.newRecord;
            const recId = rec.id;
            const recType = rec.type;

            const formId = String(rec.getValue({ fieldId: 'customform' }) || '');
            const generar = rec.getValue({ fieldId: CAMPO_GENERAR });

            if (formId !== FORMULARIO_OBJETIVO || generar !== true) {
                return;
            }

            const direccion = rec.getValue({ fieldId: BODY_DIRECCION }) || '';
            const departamento = rec.getValue({ fieldId: BODY_DEPARTAMENTO }) || '';
            const ciudad = rec.getValue({ fieldId: BODY_CIUDAD }) || '';

            eliminarOSTVExistente(recId);

            const competencias = new Set();

            const lineCount = rec.getLineCount({
                sublistId: 'item'
            });

            for (let i = 0; i < lineCount; i++) {
                const itemId = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                });

                if (!esItemValido(itemId)) continue;

                const cantidad = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i
                });

                const descripcion = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'description',
                    line: i
                });

                const descripcionEquipo = mapaDescripcionEquipo[Number(itemId)] || '';
                const competenciaId = MAPEO_COMPETENCIAS[String(descripcionEquipo)];

                if (competenciaId) {
                    competencias.add(String(competenciaId));
                }

                const datos = extraerDatosDescripcion(descripcion);
                const empresaId = obtenerEmpresaId(datos.empresa);

                const osTv = record.create({
                    type: RECORD_OS_TV,
                    isDynamic: true
                });

                osTv.setValue({
                    fieldId: PARENT_FIELD,
                    value: recId
                });

                osTv.setValue({
                    fieldId: 'custrecord_s4_sm_team_number',
                    value: Number(cantidad) || 0
                });

                if (descripcionEquipo) {
                    osTv.setValue({
                        fieldId: 'custrecord_s4_sm_equipment_description',
                        value: descripcionEquipo
                    });
                }

                if (datos.paradas) {
                    osTv.setValue({
                        fieldId: 'custrecord_s4_sm_number_stops',
                        value: Number(datos.paradas)
                    });
                }

                if (empresaId) {
                    osTv.setValue({
                        fieldId: 'custrecord_s4_sm_marco_stickers',
                        value: empresaId
                    });
                }

                if (direccion) {
                    osTv.setValue({
                        fieldId: 'custrecord62',
                        value: direccion
                    });
                }

                if (departamento) {
                    osTv.setValue({
                        fieldId: 'custrecord63',
                        value: departamento
                    });
                }

                if (ciudad) {
                    osTv.setValue({
                        fieldId: 'custrecord64',
                        value: ciudad
                    });
                }

                const osTvId = osTv.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: false
                });

                log.audit('OS TV creada', {
                    osTvId,
                    itemId,
                    cantidad,
                    descripcionEquipo,
                    competenciaId,
                    paradas: datos.paradas,
                    empresaTexto: datos.empresa,
                    empresaId
                });
            }

            const valuesToUpdate = {
                [CAMPO_GENERAR]: false,
                custbody_sm_estado: '1',
                custbody_sm_tipos_estado: '11'
            };

            const competenciasFinales = Array.from(competencias);

            if (competenciasFinales.length > 0) {
                valuesToUpdate[BODY_COMPETENCIAS] = competenciasFinales;
            }

            record.submitFields({
                type: recType,
                id: recId,
                values: valuesToUpdate,
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }
            });

            log.audit('Orden actualizada después de crear OS TV', {
                recId,
                competenciasFinales,
                estado: '1',
                tipoEstado: '11'
            });

        } catch (e) {
            log.error('Error creando OS TV automática', e);
        }
    }

    return {
        afterSubmit
    };
});