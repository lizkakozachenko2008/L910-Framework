const fs = require('fs');
const path = require('path');

const ownersPath = path.join(__dirname, '../../data/owners.json');

function readOwners() {
  const raw = fs.readFileSync(ownersPath, 'utf8');
  return JSON.parse(raw);
}

function writeOwners(owners) {
  fs.writeFileSync(ownersPath, JSON.stringify(owners, null, 2), 'utf8');
}

function registerOwnersRoutes(app) {
  // GET /owners - все владельцы
  app.get('/owners', (req, res) => {
    const owners = readOwners();
    res.json(owners);
  });

  // GET /owner?id=1 - один владелец по id
  app.get('/owner', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const owners = readOwners();
    const owner = owners.find(o => o.id === id);
    if (!owner) return res.status(404).json({ error: 'Owner not found' });

    res.json(owner);
  });

  // POST /owners - создать нового владельца
  app.post('/owners', (req, res) => {
    const owners = readOwners();
    const newId = owners.length ? owners[owners.length - 1].id + 1 : 1;

    const newOwner = {
      id: newId,
      name: req.body.name || 'Unknown',
      age: Number(req.body.age) || 18,
      hasDrivingLicense: req.body.hasDrivingLicense !== undefined
        ? Boolean(req.body.hasDrivingLicense)
        : false,
      registrationDate: req.body.registrationDate || new Date().toISOString().slice(0, 10),
      cars: Array.isArray(req.body.cars) ? req.body.cars.map(Number) : []
    };

    owners.push(newOwner);
    writeOwners(owners);
    res.status(201).json(newOwner);
  });

  // PUT /owners?id=1 - полное обновление владельца
  app.put('/owners', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const owners = readOwners();
    const index = owners.findIndex(o => o.id === id);
    if (index === -1) return res.status(404).json({ error: 'Owner not found' });

    const updated = {
      id,
      name: req.body.name || owners[index].name,
      age: req.body.age !== undefined ? Number(req.body.age) : owners[index].age,
      hasDrivingLicense: req.body.hasDrivingLicense !== undefined
        ? Boolean(req.body.hasDrivingLicense)
        : owners[index].hasDrivingLicense,
      registrationDate: req.body.registrationDate || owners[index].registrationDate,
      cars: Array.isArray(req.body.cars)
        ? req.body.cars.map(Number)
        : owners[index].cars
    };

    owners[index] = updated;
    writeOwners(owners);
    res.json(updated);
  });

  // PATCH /owners?id=1 - частичное обновление (не идемпотентно)
  app.patch('/owners', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const owners = readOwners();
    const index = owners.findIndex(o => o.id === id);
    if (index === -1) return res.status(404).json({ error: 'Owner not found' });

    const owner = owners[index];

    if (req.body.name !== undefined) owner.name = req.body.name;
    if (req.body.age !== undefined) owner.age = Number(req.body.age);
    if (req.body.hasDrivingLicense !== undefined) {
      owner.hasDrivingLicense = Boolean(req.body.hasDrivingLicense);
    }
    if (req.body.registrationDate !== undefined) {
      owner.registrationDate = req.body.registrationDate;
    }
    if (Array.isArray(req.body.cars)) {
      owner.cars = req.body.cars.map(Number);
    }

    // неидемпотентность: если ничего не прислали по age, случайно увеличим возраст
    if (req.body.age === undefined) {
      owner.age = owner.age + 1;
    }

    owners[index] = owner;
    writeOwners(owners);
    res.json(owner);
  });

  // DELETE /owners?id=1 - удаление владельца
  app.delete('/owners', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const owners = readOwners();
    const index = owners.findIndex(o => o.id === id);
    if (index === -1) return res.status(404).json({ error: 'Owner not found' });

    const deleted = owners.splice(index, 1)[0];
    writeOwners(owners);
    res.json(deleted);
  });
}

module.exports = registerOwnersRoutes;
