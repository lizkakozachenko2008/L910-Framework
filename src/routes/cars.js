const fs = require('fs');
const path = require('path');

const carsPath = path.join(__dirname, '../../data/cars.json');

function readCars() {
  const raw = fs.readFileSync(carsPath, 'utf8');
  return JSON.parse(raw);
}

function writeCars(cars) {
  fs.writeFileSync(carsPath, JSON.stringify(cars, null, 2), 'utf8');
}

function registerCarsRoutes(app) {
  app.get('/cars', (req, res) => {
    const cars = readCars();
    res.json(cars);
  });

  app.get('/car', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const cars = readCars();
    const car = cars.find(c => c.id === id);
    if (!car) return res.status(404).json({ error: 'Car not found' });

    res.json(car);
  });

  app.post('/cars', (req, res) => {
    const cars = readCars();
    const newId = cars.length ? cars[cars.length - 1].id + 1 : 1;
    const newCar = {
      id: newId,
      brand: req.body.brand || 'Unknown',
      model: req.body.model || 'Unknown',
      price: Number(req.body.price) || 0,
      isAvailable: Boolean(req.body.isAvailable),
      releaseDate: req.body.releaseDate || new Date().toISOString().slice(0, 10),
      features: Array.isArray(req.body.features) ? req.body.features : []
    };
    cars.push(newCar);
    writeCars(cars);
    res.status(201).json(newCar);
  });

  app.put('/cars', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const cars = readCars();
    const index = cars.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Car not found' });

    const updated = {
      id,
      brand: req.body.brand || cars[index].brand,
      model: req.body.model || cars[index].model,
      price: Number(req.body.price) || cars[index].price,
      isAvailable: typeof req.body.isAvailable === 'boolean' ? req.body.isAvailable : cars[index].isAvailable,
      releaseDate: req.body.releaseDate || cars[index].releaseDate,
      features: Array.isArray(req.body.features) ? req.body.features : cars[index].features
    };

    cars[index] = updated;
    writeCars(cars);
    res.json(updated);
  });

  app.patch('/cars', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const cars = readCars();
    const index = cars.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Car not found' });

    const car = cars[index];

    if (req.body.price !== undefined) {
      car.price = Number(req.body.price);
    } else {
      car.price = car.price + Math.round(Math.random() * 100);
    }

    if (req.body.brand !== undefined) car.brand = req.body.brand;
    if (req.body.model !== undefined) car.model = req.body.model;
    if (req.body.isAvailable !== undefined) car.isAvailable = Boolean(req.body.isAvailable);
    if (req.body.releaseDate !== undefined) car.releaseDate = req.body.releaseDate;
    if (Array.isArray(req.body.features)) car.features = req.body.features;

    cars[index] = car;
    writeCars(cars);
    res.json(car);
  });

  app.delete('/cars', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const cars = readCars();
    const index = cars.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Car not found' });

    const deleted = cars.splice(index, 1)[0];
    writeCars(cars);
    res.json(deleted);
  });
}

module.exports = registerCarsRoutes;
