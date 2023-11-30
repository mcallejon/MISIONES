import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { get, set, omit, take } from 'lodash';
import isEqual from 'react-fast-compare';
import { useIntl } from 'react-intl';
import { Inputs as InputsIndex } from '@buffetjs/custom';
import { NotAllowedInput, useStrapi } from 'strapi-helper-plugin';
import { useContentTypeLayout } from '../../hooks';
import { getFieldName } from '../../utils';
import InputJSONWithErrors from '../InputJSONWithErrors';
import SelectWrapper from '../SelectWrapper';
import WysiwygWithErrors from '../WysiwygWithErrors';
import InputUID from '../InputUID';
import {
  connect,
  generateOptions,
  getInputType,
  getStep,
  select,
  VALIDATIONS_TO_OMIT,
} from './utils';

/* */

import {
  camposCorticales,
  camposCorticalesNeuroimagen,
  camposProgramacion,
  camposPotencialesCampo,
  camposAudiometriaYPupilometria
} from '../../../../../../../implantes/campos-ocultos';

import {
  mostrarCampoFormulario,
  mostrarCampoCompuesto,
  ocultarCampoFormulario,
  ocultarCampoCompuesto
} from '../../utils/http';

/* */

function Inputs({
  allowedFields,
  autoFocus,
  fieldSchema,
  formErrors,
  isCreatingEntry,
  keys,
  labelIcon,
  metadatas,
  onBlur,
  onChange,
  readableFields,
  shouldNotRunValidations,
  queryInfos,
  value,
}) {
  const {
    strapi: { fieldApi },
  } = useStrapi();
  const { contentType: currentContentTypeLayout } = useContentTypeLayout();
  const { formatMessage } = useIntl();

  const labelIconformatted = labelIcon
    ? { icon: labelIcon.icon, title: formatMessage(labelIcon.title) }
    : labelIcon;

  const disabled = useMemo(() => !get(metadatas, 'editable', true), [metadatas]);
  const type = fieldSchema.type;

  const errorId = useMemo(() => {
    return get(formErrors, [keys, 'id'], null);
  }, [formErrors, keys]);

  const errorMessage = errorId ? formatMessage({ id: errorId, defaultMessage: errorId }) : null;

  const fieldName = useMemo(() => {
    return getFieldName(keys);
  }, [keys]);

  const validations = useMemo(() => {
    const inputValidations = omit(
      fieldSchema,
      shouldNotRunValidations
        ? [...VALIDATIONS_TO_OMIT, 'required', 'minLength']
        : VALIDATIONS_TO_OMIT
    );

    const regexpString = fieldSchema.regex || null;

    if (regexpString) {
      const regexp = new RegExp(regexpString);

      if (regexp) {
        inputValidations.regex = regexp;
      }
    }

    return inputValidations;
  }, [fieldSchema, shouldNotRunValidations]);

  const isRequired = useMemo(() => get(validations, ['required'], false), [validations]);

  const isChildOfDynamicZone = useMemo(() => {
    const attributes = get(currentContentTypeLayout, ['attributes'], {});
    const foundAttributeType = get(attributes, [fieldName[0], 'type'], null);

    return foundAttributeType === 'dynamiczone';
  }, [currentContentTypeLayout, fieldName]);

  const inputType = useMemo(() => {
    return getInputType(type);
  }, [type]);

  const inputValue = useMemo(() => {
    // Fix for input file multipe
    if (type === 'media' && !value) {
      return [];
    }

    return value;
  }, [type, value]);

  const step = useMemo(() => {
    return getStep(type);
  }, [type]);

  const isUserAllowedToEditField = useMemo(() => {
    const joinedName = fieldName.join('.');

    if (allowedFields.includes(joinedName)) {
      return true;
    }

    if (isChildOfDynamicZone) {
      return allowedFields.includes(fieldName[0]);
    }

    const isChildOfComponent = fieldName.length > 1;

    if (isChildOfComponent) {
      const parentFieldName = take(fieldName, fieldName.length - 1).join('.');

      return allowedFields.includes(parentFieldName);
    }

    return false;
  }, [allowedFields, fieldName, isChildOfDynamicZone]);

  const isUserAllowedToReadField = useMemo(() => {
    const joinedName = fieldName.join('.');

    if (readableFields.includes(joinedName)) {
      return true;
    }

    if (isChildOfDynamicZone) {
      return readableFields.includes(fieldName[0]);
    }

    const isChildOfComponent = fieldName.length > 1;

    if (isChildOfComponent) {
      const parentFieldName = take(fieldName, fieldName.length - 1).join('.');

      return readableFields.includes(parentFieldName);
    }

    return false;
  }, [readableFields, fieldName, isChildOfDynamicZone]);

  const shouldDisplayNotAllowedInput = useMemo(() => {
    return isUserAllowedToReadField || isUserAllowedToEditField;
  }, [isUserAllowedToEditField, isUserAllowedToReadField]);

  const shouldDisableField = useMemo(() => {
    if (!isCreatingEntry) {
      const doesNotHaveRight = isUserAllowedToReadField && !isUserAllowedToEditField;

      if (doesNotHaveRight) {
        return true;
      }

      return disabled;
    }

    return disabled;
  }, [disabled, isCreatingEntry, isUserAllowedToEditField, isUserAllowedToReadField]);

  const options = useMemo(() => generateOptions(fieldSchema.enum || [], isRequired), [
    fieldSchema,
    isRequired,
  ]);

  const otherFields = useMemo(() => {
    return fieldApi.getFields();
  }, [fieldApi]);

  const { description, visible } = metadatas;

  if (visible === false) {
    return null;
  }

  if (!shouldDisplayNotAllowedInput) {
    return (
      <NotAllowedInput
        label={metadatas.label}
        labelIcon={labelIconformatted}
        error={errorMessage}
      />
    );
  }

  if (type === 'relation') {
    return (
      <div key={keys}>
        <SelectWrapper
          {...metadatas}
          {...fieldSchema}
          labelIcon={labelIcon}
          isUserAllowedToEditField={isUserAllowedToEditField}
          isUserAllowedToReadField={isUserAllowedToReadField}
          name={keys}
          queryInfos={queryInfos}
          value={value}
        />
      </div>
    );
  }


  /*** ...  ***/

  const label = isRequired ? `${metadatas.label} (*)` : metadatas.label;

  if((keys.lastIndexOf('.') > -1) && (keys.slice(keys.lastIndexOf('.') + 1) === 'Tipo_visita')) {
    localStorage[keys] = value;
  }

  // si el paciente es Normoyente
  if ((keys === 'Tipo_de_paciente') && (value === 'Normoyente')) {
    ocultarCampoFormulario('Fecha_de_implantacion');
    ocultarCampoFormulario('Oido_implantado');
    ocultarCampoFormulario('Fecha_de_implantacion_od');
    ocultarCampoFormulario('Fecha_de_implantacion_oi');
    ocultarCampoFormulario('Etiologia');
    ocultarCampoFormulario('Electrodos_insertados');
    ocultarCampoFormulario('Electrodos_insertados_od');
    ocultarCampoFormulario('Electrodos_insertados_oi');
    ocultarCampoFormulario('Casa_comercial_implantada_od');
    ocultarCampoFormulario('Casa_comercial_implantada_oi');
    ocultarCampoFormulario('Tipo_perdida_od');
    ocultarCampoFormulario('Audifonos_od');
    ocultarCampoFormulario('Tipo_perdida_oi');
    ocultarCampoFormulario('Audifonos_oi');
  }

  // si el paciente es Implantado
  else if ((keys === 'Tipo_de_paciente') && (value === 'Implantado')) {
    mostrarCampoFormulario('Fecha_de_implantacion');
    mostrarCampoFormulario('Oido_implantado');
    mostrarCampoFormulario('Fecha_de_implantacion_od');
    mostrarCampoFormulario('Fecha_de_implantacion_oi');
    mostrarCampoFormulario('Etiologia');
    mostrarCampoFormulario('Electrodos_insertados');
    mostrarCampoFormulario('Electrodos_insertados_od');
    mostrarCampoFormulario('Electrodos_insertados_oi');
    mostrarCampoFormulario('Casa_comercial_implantada_od');
    mostrarCampoFormulario('Casa_comercial_implantada_oi');

    ocultarCampoFormulario('Tipo_perdida_od');
    ocultarCampoFormulario('Audifonos_od');
    ocultarCampoFormulario('Tipo_perdida_oi');
    ocultarCampoFormulario('Audifonos_oi');
  }

  // si el paciente es Hipoacusia
  else if ((keys === 'Tipo_de_paciente') && (value === 'Hipoacusia')) {

    mostrarCampoFormulario('Etiologia');
    mostrarCampoFormulario('Tipo_perdida_od');
    mostrarCampoFormulario('Audifonos_od');
    mostrarCampoFormulario('Tipo_perdida_oi');
    mostrarCampoFormulario('Audifonos_oi');

    ocultarCampoFormulario('Fecha_de_implantacion');
    ocultarCampoFormulario('Oido_implantado');
    ocultarCampoFormulario('Fecha_de_implantacion_od');
    ocultarCampoFormulario('Fecha_de_implantacion_oi');
    ocultarCampoFormulario('Electrodos_insertados');
    ocultarCampoFormulario('Electrodos_insertados_od');
    ocultarCampoFormulario('Electrodos_insertados_oi');
    ocultarCampoFormulario('Casa_comercial_implantada_od');
    ocultarCampoFormulario('Casa_comercial_implantada_oi');
  }

  /*

  // esto no parece tener sentido

  for(let labelHtml of document.getElementsByTagName('label')) {

    if (camposCorticales.indexOf(labelHtml.htmlFor) > -1) {
      labelHtml.parentNode.parentNode.classList.add('d-none');
    }

    else if (camposProgramacion.indexOf(labelHtml.htmlFor) > -1) {
      labelHtml.parentNode.parentNode.classList.add('d-none');
    }
  }
  */


  // Visitas.0.Tipo_visita
  const index = keys.lastIndexOf('.');
  if (index > -1) {

    const field = keys.slice(index+1);

    if (field === 'Tipo_visita') {

      setTimeout(() => {

        // se obtiene el nombre de todos los campos posibles a mostrar (incluyendo índices para varias visitas)
        const camposCorticalesCompletos = [];
        const camposCorticalesNeuroimagenCompletos = [];
        const camposProgramacionCompletos = [];
        const camposAudiometriaYPupilometriaCompletos = [];

        let campo;

        const primerIndice = keys.indexOf('.');
        const ultimoIndice = keys.lastIndexOf('.');

        let indiceVisita;
        if ((primerIndice > -1) && (ultimoIndice > -1)) {

          indiceVisita = keys.slice(primerIndice + 1, ultimoIndice)

          camposCorticales.forEach(campoCortical => {
            campo = document.getElementById(`Visitas.${indiceVisita}.${campoCortical}`);
            if(campo) camposCorticalesCompletos.push(`Visitas.${indiceVisita}.${campoCortical}`);
          });

          camposCorticalesNeuroimagen.forEach(campoNeuroImagen => {
            campo = document.getElementById(`Visitas.${indiceVisita}.${campoNeuroImagen}`);
            if(campo) camposCorticalesNeuroimagenCompletos.push(`Visitas.${indiceVisita}.${campoNeuroImagen}`);
          });

          camposProgramacion.forEach(campoProgramacion => {
            campo = document.getElementById(`Visitas.${indiceVisita}.${campoProgramacion}`);
            if(campo) camposProgramacionCompletos.push(`Visitas.${indiceVisita}.${campoProgramacion}`);
          });

          camposAudiometriaYPupilometria.forEach(campoAudiometriaYPupilometria => {
            campo = document.getElementById(`Visitas.${indiceVisita}.${campoAudiometriaYPupilometria}`);
            if(campo) camposAudiometriaYPupilometriaCompletos.push(`Visitas.${indiceVisita}.${campoAudiometriaYPupilometria}`);
          });
        }

        /*
          * campos: Fecha visita, Tipo de visita, Tipo de cortical, Impedancia, Lateralidad, Observaciones, Corticales, Ubicacion audiometría, Logo audiometría, Logo audiometría (OD), Logo audiometria (OI), Audiometrías
        */
        if (value === 'Corticales') {

          // mostrar campos
          camposCorticalesCompletos.forEach(campo => mostrarCampoFormulario(campo));
          camposCorticalesNeuroimagenCompletos.forEach(campo => mostrarCampoFormulario(campo));
          mostrarCampoCompuesto('Corticales');
          mostrarCampoCompuesto('Audiometrias');

          // ocultar campos
          camposProgramacionCompletos.forEach(campo => ocultarCampoFormulario(campo));
        }

        // Para la visita potenciales de campos, los campos del formulario son los mismos que para Corticales
        else if (value === 'Potenciales de tronco') {

          // mostrar campos
          camposCorticalesCompletos.forEach(campo => mostrarCampoFormulario(campo));
          camposCorticalesNeuroimagenCompletos.forEach(campo => mostrarCampoFormulario(campo));
          mostrarCampoCompuesto('Corticales');
          mostrarCampoCompuesto('Audiometrias');

          // ocultar campos
          camposProgramacionCompletos.forEach(campo => ocultarCampoFormulario(campo));
        }

        /*
          * campos: Fecha visita, Tipo de visita, Tipo de visita (programación), grado de satisfacción, grado de colaboración, grado de adaptación, grado de apoyo familiar, modelo de procesador, uso de audífono, impedancias telemetría, consumo de energía, logopedia, electrodos desactivados, valoración global, Observaciones, Ubicacion audiometría, Logo audiometría, Logo audiometría (OD), Logo audiometria (OI), Audiometrías
        */
        else if (value === 'Programación') {

          // mostrar campos
          camposProgramacionCompletos.forEach(campo => mostrarCampoFormulario(campo));
          camposCorticalesNeuroimagenCompletos.forEach(campo => mostrarCampoFormulario(campo));
          mostrarCampoCompuesto('Audiometrias');

          // ocultar campos
          camposCorticalesCompletos.forEach(campo => ocultarCampoFormulario(campo));
          ocultarCampoCompuesto('Corticales');
        }

        /*
          * campos de Audiometría: Fecha visita, Tipo de visita, Observaciones, Ubicacion audiometría, Logo audiometría, Logo audiometría (OD), Logo audiometria (OI), Audiometrías

          * campos de Pupilometría: Fecha visita, Tipo de visita, Observaciones, Ubicacion audiometría, Logo audiometría, Logo audiometría (OD), Logo audiometria (OI), Audiometrías
        */
        else if ((value === 'Audiometría') || (value === 'Pupilometría')) {

          camposAudiometriaYPupilometriaCompletos.forEach(campo => mostrarCampoFormulario(campo));
          mostrarCampoCompuesto('Audiometrias');

          // ocultar campos
          camposCorticalesCompletos.forEach(campo => ocultarCampoFormulario(campo));
          camposProgramacionCompletos.forEach(campo => ocultarCampoFormulario(campo));
          ocultarCampoCompuesto('Corticales');
        }

        /*
         * campos de Neuroimagen: Fecha visita, Tipo de visita, Observaciones
        */
        else if (value === 'Neuroimagen') {

          // ocultar campos
          camposCorticalesCompletos.forEach(campo => ocultarCampoFormulario(campo));
          camposCorticalesNeuroimagenCompletos.forEach(campo => ocultarCampoFormulario(campo));
          camposProgramacionCompletos.forEach(campo => ocultarCampoFormulario(campo));
          ocultarCampoCompuesto('Audiometrias');
          ocultarCampoCompuesto('Corticales');
        }

        /*
         * campos de Llamada: Fecha visita, Tipo de visita, Observaciones
        */
        else if (value === 'Llamada') {

          // ocultar campos
          camposCorticalesCompletos.forEach(campo => ocultarCampoFormulario(campo));
          camposCorticalesNeuroimagenCompletos.forEach(campo => ocultarCampoFormulario(campo));
          camposProgramacionCompletos.forEach(campo => ocultarCampoFormulario(campo));
          ocultarCampoCompuesto('Audiometrias');
          ocultarCampoCompuesto('Corticales');
        }

      }, 50);
    }
  }

  /*** ...  ***/
  return (
    <InputsIndex
      {...{
        label: label,
        description: metadatas.description,
        placeholder: metadatas.placeholder,
        visible: metadatas.visible,
        editable: metadatas.editable
      }}
      autoComplete="new-password"
      autoFocus={autoFocus}
      disabled={shouldDisableField}
      error={errorMessage}
      inputDescription={description}
      labelIcon={labelIconformatted}
      description={description}
      contentTypeUID={currentContentTypeLayout.uid}
      customInputs={{
        json: InputJSONWithErrors,
        wysiwyg: WysiwygWithErrors,
        uid: InputUID,
        ...otherFields,
      }}
      multiple={fieldSchema.multiple || false}
      attribute={fieldSchema}
      name={keys}
      onBlur={onBlur}
      onChange={onChange}
      options={options}
      step={step}
      type={inputType}
      validations={validations}
      value={inputValue}
      withDefaultValue={false}
    />
  );
}

Inputs.defaultProps = {
  autoFocus: false,
  formErrors: {},
  labelIcon: null,
  onBlur: null,
  queryInfos: {},
  value: null,
};

Inputs.propTypes = {
  allowedFields: PropTypes.array.isRequired,
  autoFocus: PropTypes.bool,
  fieldSchema: PropTypes.object.isRequired,
  formErrors: PropTypes.object,
  keys: PropTypes.string.isRequired,
  isCreatingEntry: PropTypes.bool.isRequired,
  labelIcon: PropTypes.shape({
    icon: PropTypes.node.isRequired,
    title: PropTypes.shape({
      id: PropTypes.string.isRequired,
      defaultMessage: PropTypes.string.isRequired,
    }).isRequired,
  }),
  metadatas: PropTypes.object.isRequired,
  onBlur: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  readableFields: PropTypes.array.isRequired,
  shouldNotRunValidations: PropTypes.bool.isRequired,
  queryInfos: PropTypes.shape({
    containsKey: PropTypes.string,
    defaultParams: PropTypes.object,
    endPoint: PropTypes.string,
  }),
  value: PropTypes.any,
};

const Memoized = memo(Inputs, isEqual);

export default connect(Memoized, select);
