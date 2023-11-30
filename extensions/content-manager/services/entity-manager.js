'use strict';

const { assoc, has, prop, omit } = require('lodash/fp');
const strapiUtils = require('strapi-utils');

const { sanitizeEntity } = strapiUtils;
const { hasDraftAndPublish } = strapiUtils.contentTypes;
const { PUBLISHED_AT_ATTRIBUTE, CREATED_BY_ATTRIBUTE } = strapiUtils.contentTypes.constants;
const { ENTRY_PUBLISH, ENTRY_UNPUBLISH } = strapiUtils.webhook.webhookEvents;

const omitPublishedAtField = omit(PUBLISHED_AT_ATTRIBUTE);

const emitEvent = (event, fn) => async (entity, model) => {
  const result = await fn(entity, model);

  const modelDef = strapi.getModel(model);

  strapi.eventHub.emit(event, {
    model: modelDef.modelName,
    entry: sanitizeEntity(result, { model: modelDef }),
  });

  return result;
};

const findCreatorRoles = entity => {
  const createdByPath = `${CREATED_BY_ATTRIBUTE}.id`;

  if (has(createdByPath, entity)) {
    const creatorId = prop(createdByPath, entity);
    return strapi.query('role', 'admin').find({ 'users.id': creatorId }, []);
  }

  return [];
};

module.exports = {
  async assocCreatorRoles(entity) {
    if (!entity) {
      return entity;
    }

    const roles = await findCreatorRoles(entity);
    return assoc(`${CREATED_BY_ATTRIBUTE}.roles`, roles, entity);
  },

  find(params, model, populate) {
    return strapi.entityService.find({ params, populate }, { model });
  },

  findPage(params, model, populate) {
    return strapi.entityService.findPage({ params, populate }, { model });
  },

  findWithRelationCounts(params, model, populate) {
    return strapi.entityService.findWithRelationCounts({ params, populate }, { model });
  },

  search(params, model, populate) {
    return strapi.entityService.search({ params, populate }, { model });
  },

  searchPage(params, model, populate) {
    return strapi.entityService.searchPage({ params, populate }, { model });
  },

  searchWithRelationCounts(params, model, populate) {

    /* .... */

    if (params?._q?.length > 0) {

      let q = params._q;
      q = q.replace('á', 'a');
      q = q.replace('é', 'e');
      q = q.replace('í', 'i');
      q = q.replace('ó', 'o');
      q = q.replace('ú', 'u');
      params._q = '';

      params._where = [];
      params._where.push({"_or": []});

      const vocales = ['a', 'e', 'i', 'o', 'u']
      const vocalesConTilde = ['á', 'é', 'í', 'ó', 'ú'];
      const vocalesEncontradas = [];

      vocales.forEach((vocal, i) => {

        let puntero = 0

        while(q.indexOf(vocal, puntero)  > -1)  {
          const indice = q.indexOf(vocal, puntero);
          vocalesEncontradas.push({
            vocal: vocales[i],
            indice,
          });
          vocalesEncontradas.push({
            vocal: vocalesConTilde[i],
            indice,
          });
          puntero = indice + 1;
        }
      });

      const terminos = new Set();

      const lon = vocalesEncontradas.length;

      if (lon > 0) {
        for(let i=0; i<lon; i++) {

          let termino = q;

          for(let j=0; j<lon - 1; j++) {

            let indice = vocalesEncontradas[i].indice;
            let vocal = vocalesEncontradas[i].vocal;
            termino = termino.substring(0, indice) + vocal + termino.substring(indice + 1);

            indice = vocalesEncontradas[j].indice;
            vocal = vocalesEncontradas[j].vocal;
            termino = termino.substring(0, indice) + vocal + termino.substring(indice + 1);
            terminos.add(termino);
          }
        }
      }

      terminos.forEach(termino => {

        params._where[0]._or.push({
          "Nombre_contains": termino
        });

        params._where[0]._or.push({
          "Apellidos_contains": termino
        });
      });

      params._where[0]._or.push({
        "NUHSA_contains": q
      });
      params._where[0]._or.push({
        "Telefono_contains": q
      });
      params._where[0]._or.push({
        "Edad_contains": q
      });
      params._where[0]._or.push({
        "Sexo_contains": q
      });
      params._where[0]._or.push({
        "Email_contains": q
      });
    }

    /* .... */

    return strapi.entityService.searchWithRelationCounts({ params, populate }, { model });
  },

  count(params, model) {
    return strapi.entityService.count({ params }, { model });
  },

  async findOne(id, model, populate) {
    return strapi.entityService.findOne({ params: { id }, populate }, { model });
  },

  async findOneWithCreatorRoles(id, model, populate) {
    const entity = await this.findOne(id, model, populate);

    if (!entity) {
      return entity;
    }

    return this.assocCreatorRoles(entity);
  },

  async create(body, model) {
    const modelDef = strapi.getModel(model);
    const publishData = { ...body };

    if (hasDraftAndPublish(modelDef)) {
      publishData[PUBLISHED_AT_ATTRIBUTE] = null;
    }

    return strapi.entityService.create({ data: publishData }, { model });
  },

  update(entity, body, model) {
    const params = { id: entity.id };
    const publishData = omitPublishedAtField(body);

    return strapi.entityService.update({ params, data: publishData }, { model });
  },

  delete(entity, model) {
    const params = { id: entity.id };
    return strapi.entityService.delete({ params }, { model });
  },

  findAndDelete(params, model) {
    return strapi.entityService.delete({ params }, { model });
  },

  publish: emitEvent(ENTRY_PUBLISH, async (entity, model) => {
    if (entity[PUBLISHED_AT_ATTRIBUTE]) {
      throw strapi.errors.badRequest('already.published');
    }

    // validate the entity is valid for publication
    await strapi.entityValidator.validateEntityCreation(strapi.getModel(model), entity);

    const params = { id: entity.id };
    const data = { [PUBLISHED_AT_ATTRIBUTE]: new Date() };

    return strapi.entityService.update({ params, data }, { model });
  }),

  unpublish: emitEvent(ENTRY_UNPUBLISH, (entity, model) => {
    if (!entity[PUBLISHED_AT_ATTRIBUTE]) {
      throw strapi.errors.badRequest('already.draft');
    }

    const params = { id: entity.id };
    const data = { [PUBLISHED_AT_ATTRIBUTE]: null };

    return strapi.entityService.update({ params, data }, { model });
  }),
};
