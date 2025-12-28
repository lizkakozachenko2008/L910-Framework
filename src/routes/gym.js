const fs = require('fs');
const path = require('path');

const membersPath = path.join(__dirname, '../../data/members.json');
const workoutsPath = path.join(__dirname, '../../data/workouts.json');

function readMembers() {
  const raw = fs.readFileSync(membersPath, 'utf8');
  return JSON.parse(raw);
}

function writeMembers(members) {
  fs.writeFileSync(membersPath, JSON.stringify(members, null, 2), 'utf8');
}

function readWorkouts() {
  const raw = fs.readFileSync(workoutsPath, 'utf8');
  return JSON.parse(raw);
}

function writeWorkouts(workouts) {
  fs.writeFileSync(workoutsPath, JSON.stringify(workouts, null, 2), 'utf8');
}

function registerGymRoutes(app) {
  // ===== MEMBERS =====

  // GET /members - все клиенты
  app.get('/members', (req, res) => {
    const members = readMembers();
    res.json(members);
  });

  // GET /member?id=1 - один клиент
  app.get('/member', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const members = readMembers();
    const member = members.find(m => m.id === id);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    res.json(member);
  });

  // POST /members - создать клиента
  app.post('/members', (req, res) => {
    const members = readMembers();
    const newId = members.length ? members[members.length - 1].id + 1 : 1;

    const newMember = {
      id: newId,
      fullName: req.body.fullName || 'Unknown',
      age: req.body.age !== undefined ? Number(req.body.age) : 18,
      isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
      registrationDate: req.body.registrationDate || new Date().toISOString().slice(0, 10),
      subscriptions: Array.isArray(req.body.subscriptions) ? req.body.subscriptions : []
    };

    members.push(newMember);
    writeMembers(members);
    res.status(201).json(newMember);
  });

  // PUT /members?id=1 - полное обновление
  app.put('/members', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const members = readMembers();
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return res.status(404).json({ error: 'Member not found' });

    const updated = {
      id,
      fullName: req.body.fullName || members[index].fullName,
      age: req.body.age !== undefined ? Number(req.body.age) : members[index].age,
      isActive: req.body.isActive !== undefined
        ? Boolean(req.body.isActive)
        : members[index].isActive,
      registrationDate: req.body.registrationDate || members[index].registrationDate,
      subscriptions: Array.isArray(req.body.subscriptions)
        ? req.body.subscriptions
        : members[index].subscriptions
    };

    members[index] = updated;
    writeMembers(members);
    res.json(updated);
  });

  // PATCH /members?id=1 - частичное обновление (не идемпотентно)
  app.patch('/members', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const members = readMembers();
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return res.status(404).json({ error: 'Member not found' });

    const member = members[index];

    if (req.body.fullName !== undefined) member.fullName = req.body.fullName;
    if (req.body.age !== undefined) member.age = Number(req.body.age);
    if (req.body.isActive !== undefined) member.isActive = Boolean(req.body.isActive);
    if (req.body.registrationDate !== undefined) {
      member.registrationDate = req.body.registrationDate;
    }
    if (Array.isArray(req.body.subscriptions)) {
      member.subscriptions = req.body.subscriptions;
    }

    // неидемпотентность: если возраст не передан, увеличиваем его на 1
    if (req.body.age === undefined) {
      member.age = member.age + 1;
    }

    members[index] = member;
    writeMembers(members);
    res.json(member);
  });

  // DELETE /members?id=1 - удалить клиента
  app.delete('/members', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const members = readMembers();
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return res.status(404).json({ error: 'Member not found' });

    const deleted = members.splice(index, 1)[0];
    writeMembers(members);
    res.json(deleted);
  });

  // ===== WORKOUTS =====

  // GET /workouts
  app.get('/workouts', (req, res) => {
    const workouts = readWorkouts();
    res.json(workouts);
  });

  // GET /workout?id=1
  app.get('/workout', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const workouts = readWorkouts();
    const workout = workouts.find(w => w.id === id);
    if (!workout) return res.status(404).json({ error: 'Workout not found' });

    res.json(workout);
  });

  // POST /workouts
  app.post('/workouts', (req, res) => {
    const workouts = readWorkouts();
    const newId = workouts.length ? workouts[workouts.length - 1].id + 1 : 1;

    const newWorkout = {
      id: newId,
      title: req.body.title || 'Training',
      durationMinutes: req.body.durationMinutes !== undefined
        ? Number(req.body.durationMinutes)
        : 60,
      isGroup: req.body.isGroup !== undefined ? Boolean(req.body.isGroup) : true,
      startTime: req.body.startTime || new Date().toISOString(),
      trainers: Array.isArray(req.body.trainers) ? req.body.trainers : []
    };

    workouts.push(newWorkout);
    writeWorkouts(workouts);
    res.status(201).json(newWorkout);
  });

  // PUT /workouts?id=1
  app.put('/workouts', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const workouts = readWorkouts();
    const index = workouts.findIndex(w => w.id === id);
    if (index === -1) return res.status(404).json({ error: 'Workout not found' });

    const updated = {
      id,
      title: req.body.title || workouts[index].title,
      durationMinutes: req.body.durationMinutes !== undefined
        ? Number(req.body.durationMinutes)
        : workouts[index].durationMinutes,
      isGroup: req.body.isGroup !== undefined
        ? Boolean(req.body.isGroup)
        : workouts[index].isGroup,
      startTime: req.body.startTime || workouts[index].startTime,
      trainers: Array.isArray(req.body.trainers)
        ? req.body.trainers
        : workouts[index].trainers
    };

    workouts[index] = updated;
    writeWorkouts(workouts);
    res.json(updated);
  });

  // PATCH /workouts?id=1
  app.patch('/workouts', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const workouts = readWorkouts();
    const index = workouts.findIndex(w => w.id === id);
    if (index === -1) return res.status(404).json({ error: 'Workout not found' });

    const workout = workouts[index];

    if (req.body.title !== undefined) workout.title = req.body.title;
    if (req.body.durationMinutes !== undefined) {
      workout.durationMinutes = Number(req.body.durationMinutes);
    } else {
      // неидемпотентность: если время не передали, случайно меняем длительность
      workout.durationMinutes = workout.durationMinutes + Math.round(Math.random() * 10);
    }
    if (req.body.isGroup !== undefined) workout.isGroup = Boolean(req.body.isGroup);
    if (req.body.startTime !== undefined) workout.startTime = req.body.startTime;
    if (Array.isArray(req.body.trainers)) workout.trainers = req.body.trainers;

    workouts[index] = workout;
    writeWorkouts(workouts);
    res.json(workout);
  });

  // DELETE /workouts?id=1
  app.delete('/workouts', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const workouts = readWorkouts();
    const index = workouts.findIndex(w => w.id === id);
    if (index === -1) return res.status(404).json({ error: 'Workout not found' });

    const deleted = workouts.splice(index, 1)[0];
    writeWorkouts(workouts);
    res.json(deleted);
  });
}

module.exports = registerGymRoutes;
