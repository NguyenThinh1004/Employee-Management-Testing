router.post('/', (request, response) => {
1.  const unit = request.body;
2.  if (!unit || typeof unit !== 'object' || Array.isArray(unit)) {
3.    response.status(400).json(...); return;          // message: 'Dữ liệu đơn vị không hợp lệ'
    }
4.  const errors = validateOrganizationUnit(unit);
5.  if (errors.length > 0) {
6.    response.status(400).json(...); return;          // Lỗi validation
    }
7.  const parentUnitId = (unit.parentUnitId === undefined || unit.parentUnitId === null)
                         ? null : Number(unit.parentUnitId);
8.  if (parentUnitId !== null) {
9.    const parent = database.prepare('SELECT id ...').get(parentUnitId);
10.   if (!parent) {
11.     response.status(400).json(...); return;        // message: 'Đơn vị cha không tồn tại'
      }
    }
    try {
12.   const result = database.prepare('INSERT ...').run(...);
13.   const createdUnit = database.prepare('SELECT ...').get(result.lastInsertRowid);
      response.status(201).json(...);                  // message: 'Tạo đơn vị thành công'
    } catch (error) {
14.   if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
15.     response.status(409).json(...); return;        // message: 'Mã đơn vị đã tồn tại'
      }
16.   throw error;
    }
});
