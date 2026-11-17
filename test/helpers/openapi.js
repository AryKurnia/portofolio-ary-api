// Membaca docs/openapi.yaml dan memvalidasi respons server.inject() terhadap skemanya.
const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const SPEC_PATH = path.join(__dirname, '../../docs/openapi.yaml');
const SPEC_ID = 'openapi';
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

const spec = YAML.parse(fs.readFileSync(SPEC_PATH, 'utf8'));

// strict: false karena skema OpenAPI memuat keyword non-JSON-Schema seperti `example`.
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
ajv.addSchema(spec, SPEC_ID);

const escapePointer = (segment) => segment.replace(/~/g, '~0').replace(/\//g, '~1');

const resolvePointer = (pointer) =>
  pointer
    .split('/')
    .slice(1)
    .reduce((node, key) => node?.[key.replace(/~1/g, '/').replace(/~0/g, '~')], spec);

// Daftar operasi terdokumentasi: ['GET /skills', 'POST /skills', ...]
const listOperations = () =>
  Object.entries(spec.paths).flatMap(([routePath, item]) =>
    HTTP_METHODS.filter((method) => item[method]).map(
      (method) => `${method.toUpperCase()} ${routePath}`
    )
  );

const listDocumentedResponses = () =>
  Object.entries(spec.paths).flatMap(([routePath, item]) =>
    HTTP_METHODS.filter((method) => item[method]).flatMap((method) =>
      Object.keys(item[method].responses).map(
        (status) => `${method.toUpperCase()} ${routePath} ${status}`
      )
    )
  );

/**
 * Memvalidasi respons terhadap operasi `method routePath` (path tanpa prefix /api/v1).
 * Melempar Error yang jelas bila status tidak terdokumentasi atau body tidak cocok skema.
 */
const assertMatchesSpec = ({ method, routePath, response }) => {
  const operationPointer = `/paths/${escapePointer(routePath)}/${method.toLowerCase()}`;
  const operation = resolvePointer(operationPointer);
  if (!operation) {
    throw new Error(`Operasi ${method} ${routePath} tidak ada di openapi.yaml`);
  }

  const status = String(response.statusCode);
  let responsePointer = `${operationPointer}/responses/${status}`;
  const responseSpec = resolvePointer(responsePointer);
  if (!responseSpec) {
    throw new Error(`Status ${status} untuk ${method} ${routePath} tidak terdokumentasi`);
  }
  if (responseSpec.$ref) {
    responsePointer = responseSpec.$ref.slice(1);
  }

  const content = resolvePointer(`${responsePointer}/content`);
  if (!content) {
    if (response.payload) {
      throw new Error(`${method} ${routePath} ${status} terdokumentasi tanpa body, tapi ada body`);
    }
    return;
  }

  const validate = ajv.getSchema(`${SPEC_ID}#${responsePointer}/content/application~1json/schema`);
  const body = JSON.parse(response.payload);
  if (!validate(body)) {
    throw new Error(
      `Body ${method} ${routePath} ${status} tidak cocok dengan openapi.yaml:\n` +
        `${ajv.errorsText(validate.errors, { separator: '\n' })}\n` +
        `Body: ${JSON.stringify(body)}`
    );
  }
};

module.exports = { spec, listOperations, listDocumentedResponses, assertMatchesSpec };
