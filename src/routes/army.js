const fs = require('fs');
const path = require('path');

const soldiersPath = path.join(__dirname, '../../data/soldiers.json');
const unitsPath = path.join(__dirname, '../../data/units.json');

function readSoldiers() {
  const raw = fs.readFileSync(soldiersPath, 'utf8');
  return JSON.parse(raw);
}

function writeSoldiers(soldiers) {
  fs.writeFileSync(soldiersPath, JSON.stringify(soldiers, null, 2), 'utf8');
}

function readUnits() {
  const raw = fs.readFileSync(unitsPath, 'utf8');
  return JSON.parse(raw);
}

function writeUnits(units) {
  fs.writeFileSync(unitsPath, JSON.stringify(units, null, 2), 'utf8');
}

function registerArmyRoutes(app) {
  // ===== SOLDIERS =====

  // GET /soldiers
  app.get('/soldiers', (req, res) => {
    const soldiers = readSoldiers();
    res.json(soldiers);
  });

  // GET /soldier?id=1
  app.get('/soldier', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const soldiers = readSoldiers();
    const soldier = soldiers.find(s => s.id === id);
    if (!soldier) return res.status(404).json({ error: 'Soldier not found' });

    res.json(soldier);
  });

  // POST /soldiers
  app.post('/soldiers', (req, res) => {
    const soldiers = readSoldiers();
    const newId = soldiers.length ? soldiers[soldiers.length - 1].id + 1 : 1;

    const newSoldier = {
      id: newId,
      name: req.body.name || 'Unknown',
      rank: req.body.rank || 'Private',
      age: req.body.age !== undefined ? Number(req.body.age) : 18,
      onDuty: req.body.onDuty !== undefined ? Boolean(req.body.onDuty) : true,
      enlistmentDate: req.body.enlistmentDate || new Date().toISOString().slice(0, 10),
      skills: Array.isArray(req.body.skills) ? req.body.skills : []
    };

    soldiers.push(newSoldier);
    writeSoldiers(soldiers);
    res.status(201).json(newSoldier);
  });

  // PUT /soldiers?id=1
  app.put('/soldiers', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const soldiers = readSoldiers();
    const index = soldiers.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: 'Soldier not found' });

    const updated = {
      id,
      name: req.body.name || soldiers[index].name,
      rank: req.body.rank || soldiers[index].rank,
      age: req.body.age !== undefined
        ? Number(req.body.age)
        : soldiers[index].age,
      onDuty: req.body.onDuty !== undefined
        ? Boolean(req.body.onDuty)
        : soldiers[index].onDuty,
      enlistmentDate: req.body.enlistmentDate || soldiers[index].enlistmentDate,
      skills: Array.isArray(req.body.skills)
        ? req.body.skills
        : soldiers[index].skills
    };

    soldiers[index] = updated;
    writeSoldiers(soldiers);
    res.json(updated);
  });

  // PATCH /soldiers?id=1 (не идемпотентно)
  app.patch('/soldiers', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const soldiers = readSoldiers();
    const index = soldiers.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: 'Soldier not found' });

    const soldier = soldiers[index];

    if (req.body.name !== undefined) soldier.name = req.body.name;
    if (req.body.rank !== undefined) soldier.rank = req.body.rank;
    if (req.body.age !== undefined) {
      soldier.age = Number(req.body.age);
    } else {
      soldier.age = soldier.age + 1;
    }
    if (req.body.onDuty !== undefined) soldier.onDuty = Boolean(req.body.onDuty);
    if (req.body.enlistmentDate !== undefined) {
      soldier.enlistmentDate = req.body.enlistmentDate;
    }
    if (Array.isArray(req.body.skills)) soldier.skills = req.body.skills;

    soldiers[index] = soldier;
    writeSoldiers(soldiers);
    res.json(soldier);
  });

  // DELETE /soldiers?id=1
  app.delete('/soldiers', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const soldiers = readSoldiers();
    const index = soldiers.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: 'Soldier not found' });

    const deleted = soldiers.splice(index, 1)[0];
    writeSoldiers(soldiers);
    res.json(deleted);
  });

  // ===== UNITS =====

  // GET /units
  app.get('/units', (req, res) => {
    const units = readUnits();
    res.json(units);
  });

  // GET /unit?id=1
  app.get('/unit', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const units = readUnits();
    const unit = units.find(u => u.id === id);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });

    res.json(unit);
  });

  // POST /units
  app.post('/units', (req, res) => {
    const units = readUnits();
    const newId = units.length ? units[units.length - 1].id + 1 : 1;

    const newUnit = {
      id: newId,
      name: req.body.name || 'New Unit',
      soldiersCount: req.body.soldiersCount !== undefined
        ? Number(req.body.soldiersCount)
        : 0,
      isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
      formedAt: req.body.formedAt || new Date().toISOString().slice(0, 10),
      specializations: Array.isArray(req.body.specializations)
        ? req.body.specializations
        : []
    };

    units.push(newUnit);
    writeUnits(units);
    res.status(201).json(newUnit);
  });

  // PUT /units?id=1
  app.put('/units', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const units = readUnits();
    const index = units.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ error: 'Unit not found' });

    const updated = {
      id,
      name: req.body.name || units[index].name,
      soldiersCount: req.body.soldiersCount !== undefined
        ? Number(req.body.soldiersCount)
        : units[index].soldiersCount,
      isActive: req.body.isActive !== undefined
        ? Boolean(req.body.isActive)
        : units[index].isActive,
      formedAt: req.body.formedAt || units[index].formedAt,
      specializations: Array.isArray(req.body.specializations)
        ? req.body.specializations
        : units[index].specializations
    };

    units[index] = updated;
    writeUnits(units);
    res.json(updated);
  });

  // PATCH /units?id=1
  app.patch('/units', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const units = readUnits();
    const index = units.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ error: 'Unit not found' });

    const unit = units[index];

    if (req.body.name !== undefined) unit.name = req.body.name;
    if (req.body.soldiersCount !== undefined) {
      unit.soldiersCount = Number(req.body.soldiersCount);
    } else {
      unit.soldiersCount = unit.soldiersCount + Math.round(Math.random() * 5);
    }
    if (req.body.isActive !== undefined) unit.isActive = Boolean(req.body.isActive);
    if (req.body.formedAt !== undefined) unit.formedAt = req.body.formedAt;
    if (Array.isArray(req.body.specializations)) {
      unit.specializations = req.body.specializations;
    }

    units[index] = unit;
    writeUnits(units);
    res.json(unit);
  });

  // DELETE /units?id=1
  app.delete('/units', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const units = readUnits();
    const index = units.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ error: 'Unit not found' });

    const deleted = units.splice(index, 1)[0];
    writeUnits(units);
    res.json(deleted);
  });
}

module.exports = registerArmyRoutes;
