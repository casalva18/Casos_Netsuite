# NetSuite Scripts - Escaleras

Repositorio con scripts de NetSuite para el proceso de órdenes de servicio, generación automática de OS TV y validaciones específicas del formulario **SM ORDEN DE VENTA ESCALERAS**.

## Descripción

Esta carpeta contiene scripts Client Script y User Event diseñados para:

- Generar OS TV automáticamente desde los artículos de una orden de servicio.
- Validar campos obligatorios en cotizaciones/órdenes cuando se usa el artículo de visitas residenciales.
- Forzar la existencia del subformulario OS TV en el formulario objetivo.
- Mapear equipos de OS TV a competencias de proyecto.

## Archivos y propósito

### `CS_Generar_OSTV.js`
- Client Script para formulario NetSuite.
- Valida el formulario `customform = 139`.
- Revisa los artículos de la sublista `item` y detecta aquellos válidos para generar OS TV.
- Extrae datos de descripción como paradas y empresa de mantenimiento.
- Activa el campo `custbody_sm_generar_ostv_auto` y muestra datos detectados al usuario.

### `CS_SM_Visitas_Residenciales.js`
- Client Script `saveRecord`.
- Verifica si la cotización/orden contiene el artículo `6440`.
- Obliga a diligenciar el campo `custbody_sm_visitas_residenciales` cuando se incluye dicho artículo.

### `MS_SM_Validacion_OS_TV.js`
- Client Script `saveRecord` para validar el formulario `139`.
- Asegura que la sublista relacionada con OS TV (`recmachcustrecordcustrecord_s4_parent_service`) tenga al menos una línea.
- Muestra alerta si falta el subformulario OS TV.

### `SM_Validacion_Campos_OS_TV.js`
- User Event `beforeSubmit`.
- Valida en el servidor la existencia de líneas en el subformulario OS TV para el formulario `139`.
- Lanza un error si el subformulario no está diligenciado.

### `UE_Crear_OSTV_Auto.js`
- User Event `afterSubmit`.
- Crea registros de OS TV (`customrecord_s4_sm_service_scope`) para el formulario `139` cuando el campo `custbody_sm_generar_ostv_auto` está activo.
- Elimina OS TV existentes relacionadas antes de crear nuevas entradas.
- Copia dirección, ciudad, departamento y datos técnicos desde la orden padre.
- Normaliza y mapea texto de empresas de mantenimiento a IDs internos.

### `UE_Generar_OSTV.js`
- User Event `beforeLoad`.
- Vincula el Client Script `CS_Generar_OSTV.js` al formulario.
- Añade el botón `Generar OS TV` para ejecutar la lógica desde la UI.

### `UE_SM_Competencias_Proyecto.js`
- User Event `afterSubmit`.
- Mapea el valor de equipos en líneas OS TV a competencias de proyecto.
- Actualiza campos como `custbody_sm_competencias_proyecto`, `custbody_sm_estado` y `custbody_sm_tipos_estado`.

### `UE_SM_Visitas_Residenciales.js`
- User Event `beforeSubmit`.
- Comprueba en servidor que cuando existe el artículo `6440`, el campo `custbody_sm_visitas_residenciales` esté completado.
- Lanza un error específico si no se cumple la condición.

## Requisitos y despliegue

- NetSuite API version: `2.x` y `2.1`.
- Formulario objetivo principal: `139` (`SM ORDEN DE VENTA ESCALERAS`).
- Artículo de validación de visitas residenciales: `6440`.
- Sublista OS TV objetivo: `recmachcustrecordcustrecord_s4_parent_service`.

## Instrucciones generales

1. Subir cada archivo al File Cabinet de NetSuite.
2. Crear/deployar los scripts correspondientes según su tipo (`ClientScript`, `UserEventScript`).
3. Asociar cada script al formulario y evento correcto.
4. Probar con órdenes de servicio que contengan los artículos configurados y el formulario `139`.

## Notas

- El campo `custbody_sm_generar_ostv_auto` se usa como disparador para la creación automática de OS TV.
- El script `UE_Crear_OSTV_Auto.js` elimina registros OS TV existentes relacionados antes de crear los nuevos.
- Los mapeos de equipos e identificación de empresas están codificados en los scripts.

---

Repositorio listo para subir a GitHub con documentación básica de cada script y su función en el proceso NetSuite.