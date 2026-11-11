const container = require('../../../infrastructure/container');
const { toOrganizationResponse, toPositionResponse } = require('./presenter');

// Payload snake_case → argumen use-case camelCase (field yang tidak dikirim tetap undefined).
const toPositionInput = (payload) => ({
  title: payload.title,
  type: payload.type,
  eventName: payload.event_name,
  startDate: payload.start_date,
  endDate: payload.end_date,
  isCurrent: payload.is_current,
  description: payload.description,
});

module.exports = {
  async listOrganizations(request, h) {
    const organizations = await container.listOrganizations.execute(request.query);
    return h.response({ data: organizations.map(toOrganizationResponse) }).code(200);
  },

  async createOrganization(request, h) {
    const organization = await container.createOrganization.execute(request.payload);
    return h.response({ data: toOrganizationResponse(organization) }).code(201);
  },

  async updateOrganization(request, h) {
    const organization = await container.updateOrganization.execute(
      request.params.id,
      request.payload
    );
    return h.response({ data: toOrganizationResponse(organization) }).code(200);
  },

  async deleteOrganization(request, h) {
    await container.deleteOrganization.execute(request.params.id);
    return h.response().code(204);
  },

  async reorderPositions(request, h) {
    await container.reorderPositions.execute(request.params.id, request.payload.ids);
    return h.response().code(204);
  },

  async createPosition(request, h) {
    const {
      organization_id: organizationId,
      organization_name: organizationName,
      group,
    } = request.payload;
    const position = await container.createPosition.execute({
      organizationId,
      organizationName,
      group,
      ...toPositionInput(request.payload),
      isCurrent: request.payload.is_current ?? false,
    });
    return h.response({ data: toPositionResponse(position) }).code(201);
  },

  async updatePosition(request, h) {
    const position = await container.updatePosition.execute(
      request.params.id,
      toPositionInput(request.payload)
    );
    return h.response({ data: toPositionResponse(position) }).code(200);
  },

  async deletePosition(request, h) {
    await container.deletePosition.execute(request.params.id);
    return h.response().code(204);
  },
};
