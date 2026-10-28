const assert = require('node:assert/strict');
const test = require('node:test');
const { createOrganizationUnitRouter } = require('../src/organization-unit/router');
const { validateOrganizationUnit } = require('../src/organization-unit/validation');

function validUnit(overrides = {}) {
  return {
    unitName: 'Phòng Tổ chức',
    unitCode: 'P_TOCHUC_UNIT',
    unitType: 'Phòng',
    email: 'tochuc@example.com',
    phone: '0912345678',
    website: '',
    address: '',
    ...overrides
  };
}

function errorsFor(overrides, field) {
  return validateOrganizationUnit(validUnit(overrides))
    .filter((error) => error.field === field);
}

function createDatabase({
  parent = undefined,
  insertError = undefined,
  createdUnit = { id: 11, unitCode: 'P_TOCHUC_UNIT' }
} = {}) {
  const calls = [];

  return {
    calls,
    prepare(sql) {
      const statement = sql.trim();
      return {
        get(value) {
          calls.push({ operation: 'get', statement, value });
          if (statement.startsWith('SELECT id FROM organization_units')) {
            return parent;
          }
          if (statement.includes('FROM organization_units WHERE id = ?')) {
            return createdUnit;
          }
          throw new Error(`Unexpected SELECT statement: ${statement}`);
        },
        run(...values) {
          calls.push({ operation: 'run', statement, values });
          if (insertError) {
            throw insertError;
          }
          return { lastInsertRowid: 11 };
        }
      };
    }
  };
}

async function postToRouter(body, database) {
  const router = createOrganizationUnitRouter({ database });
  let finishRequest;
  const requestFinished = new Promise((resolve) => {
    finishRequest = resolve;
  });
  const request = {
    method: 'POST',
    url: '/',
    originalUrl: '/',
    baseUrl: '',
    body,
    params: {},
    query: {}
  };
  const response = {
    statusCode: undefined,
    body: undefined,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(value) {
      this.body = value;
      finishRequest(undefined);
      return this;
    }
  };

  router.handle(request, response, (nextError) => finishRequest(nextError));
  const error = await requestFinished;

  return { response, error };
}

test('validator: required fields reject missing, wrong-type, and blank values', () => {
  const cases = [
    [{ unitName: '' }, 'unitName'],
    [{ unitCode: '  ' }, 'unitCode'],
    [{ unitType: 3 }, 'unitType'],
    [{ email: '' }, 'email'],
    [{ phone: null }, 'phone']
  ];

  for (const [overrides, field] of cases) {
    assert.notEqual(errorsFor(overrides, field).length, 0, `${field} should be required`);
  }
});

test('validator: null input falls back to an empty object and reports required fields', () => {
  const errors = validateOrganizationUnit(null);
  assert.deepEqual(
    errors.map((error) => error.field),
    ['unitName', 'unitCode', 'unitType', 'email', 'phone']
  );
});

test('validator: unit name and code cover format and length uses', () => {
  assert.match(errorsFor({ unitName: 'Tên\nđơn vị' }, 'unitName')[0].message, /định dạng/);
  assert.match(errorsFor({ unitName: 'A'.repeat(101) }, 'unitName')[0].message, /100/);
  assert.match(errorsFor({ unitCode: 'A'.repeat(21) }, 'unitCode')[0].message, /20/);
  assert.match(errorsFor({ unitCode: 'P.TOCHUC' }, 'unitCode')[0].message, /định dạng/);
  assert.deepEqual(errorsFor({ unitCode: 'P_TOCHUC-01' }, 'unitCode'), []);
});

test('validator: unit type, email, and phone distinguish valid and invalid inputs', () => {
  assert.match(errorsFor({ unitType: 'Trung tâm' }, 'unitType')[0].message, /định dạng/);
  assert.deepEqual(errorsFor({ unitType: 'Phòng' }, 'unitType'), []);

  assert.match(errorsFor({ email: 'a'.repeat(90) + '@example.com' }, 'email')[0].message, /100/);
  assert.match(errorsFor({ email: 'to chuc@example.com' }, 'email')[0].message, /định dạng/);
  assert.match(errorsFor({ email: 'not-an-email' }, 'email')[0].message, /định dạng/);
  assert.deepEqual(errorsFor({ email: 'tochuc@example.com' }, 'email'), []);

  assert.match(errorsFor({ phone: '091234567' }, 'phone')[0].message, /định dạng/);
  assert.deepEqual(errorsFor({ phone: '0912345678' }, 'phone'), []);
});

test('validator: optional website and address are skipped when omitted or empty', () => {
  assert.deepEqual(validateOrganizationUnit(validUnit()), []);
  assert.deepEqual(
    validateOrganizationUnit(validUnit({ website: undefined, address: undefined })),
    []
  );
});

test('validator: website covers invalid type, whitespace, length, URL parsing, and protocols', () => {
  assert.match(errorsFor({ website: 42 }, 'website')[0].message, /định dạng/);
  assert.match(errorsFor({ website: 'https://example.com/a b' }, 'website')[0].message, /định dạng/);
  assert.match(errorsFor({ website: 'https://' + 'a'.repeat(2042) }, 'website')[0].message, /2048/);
  assert.match(errorsFor({ website: 'not-a-url' }, 'website')[0].message, /định dạng/);
  assert.match(errorsFor({ website: 'ftp://example.com' }, 'website')[0].message, /định dạng/);
  assert.deepEqual(errorsFor({ website: 'http://example.com' }, 'website'), []);
  assert.deepEqual(errorsFor({ website: 'https://example.com' }, 'website'), []);
});

test('validator: address and parent ID cover optional, length, and validity paths', () => {
  assert.match(errorsFor({ address: 12 }, 'address')[0].message, /định dạng/);
  assert.match(errorsFor({ address: ' ' }, 'address')[0].message, /định dạng/);
  assert.match(errorsFor({ address: 'A'.repeat(201) }, 'address')[0].message, /200/);
  assert.deepEqual(errorsFor({ address: '123 Main St' }, 'address'), []);

  assert.deepEqual(errorsFor({ parentUnitId: null }, 'parentUnitId'), []);
  assert.deepEqual(errorsFor({ parentUnitId: '12' }, 'parentUnitId'), []);
  assert.match(errorsFor({ parentUnitId: 'abc' }, 'parentUnitId')[0].message, /không hợp lệ/);
  assert.match(errorsFor({ parentUnitId: 1.5 }, 'parentUnitId')[0].message, /không hợp lệ/);
  assert.match(errorsFor({ parentUnitId: 0 }, 'parentUnitId')[0].message, /không hợp lệ/);
});

test('router: rejects malformed request bodies without accessing the database', async () => {
  for (const body of [null, 'text', []]) {
    const database = createDatabase();
    const { response, error } = await postToRouter(body, database);

    assert.equal(error, undefined);
    assert.equal(response.statusCode, 400);
    assert.equal(response.body.message, 'Dữ liệu đơn vị không hợp lệ');
    assert.deepEqual(database.calls, []);
  }
});

test('router: validation errors return 400 without database access', async () => {
  const database = createDatabase();
  const { response, error } = await postToRouter(validUnit({ email: 'bad' }), database);

  assert.equal(error, undefined);
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.errors[0].field, 'email');
  assert.deepEqual(database.calls, []);
});

test('router: creates a unit without a parent and maps optional empty fields to null', async () => {
  const createdUnit = { id: 11, unitName: 'Phòng Tổ chức', unitCode: 'P_TOCHUC_UNIT' };
  const database = createDatabase({ createdUnit });
  const { response, error } = await postToRouter(
    validUnit({ unitName: ' Phòng Tổ chức ', website: '', address: '' }),
    database
  );

  assert.equal(error, undefined);
  assert.equal(response.statusCode, 201);
  assert.equal(response.body.unit, createdUnit);
  assert.equal(database.calls.length, 2);
  assert.equal(database.calls[0].operation, 'run');
  assert.deepEqual(database.calls[0].values, [
    null,
    'Phòng Tổ chức',
    'P_TOCHUC_UNIT',
    'Phòng',
    'tochuc@example.com',
    '0912345678',
    null,
    null
  ]);
  assert.equal(database.calls[1].operation, 'get');
  assert.equal(database.calls[1].value, 11);
});

test('router: checks an existing parent and normalizes its ID before querying and inserting', async () => {
  const database = createDatabase({ parent: { id: 7 } });
  const { response, error } = await postToRouter(
    validUnit({ parentUnitId: '7' }),
    database
  );

  assert.equal(error, undefined);
  assert.equal(response.statusCode, 201);
  assert.equal(database.calls[0].value, 7);
  assert.equal(database.calls[1].values[0], 7);
});

test('router: rejects a parent that does not exist without inserting', async () => {
  const database = createDatabase({ parent: undefined });
  const { response, error } = await postToRouter(
    validUnit({ parentUnitId: 99 }),
    database
  );

  assert.equal(error, undefined);
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, 'Đơn vị cha không tồn tại');
  assert.equal(database.calls.length, 1);
  assert.equal(database.calls[0].operation, 'get');
});

test('router: maps UNIQUE constraint errors to conflict responses', async () => {
  const database = createDatabase({
    insertError: Object.assign(new Error('duplicate'), {
      code: 'SQLITE_CONSTRAINT_UNIQUE'
    })
  });
  const { response, error } = await postToRouter(validUnit(), database);

  assert.equal(error, undefined);
  assert.equal(response.statusCode, 409);
  assert.equal(response.body.message, 'Mã đơn vị đã tồn tại');
});

test('router: forwards non-UNIQUE database errors to Express', async () => {
  const databaseError = Object.assign(new Error('database unavailable'), {
    code: 'SQLITE_BUSY'
  });
  const database = createDatabase({ insertError: databaseError });
  const { response, error } = await postToRouter(validUnit(), database);

  assert.equal(response.statusCode, undefined);
  assert.equal(error, databaseError);
});
