const fs = require('fs');
const path = require('path');

const restaurantsPath = path.join(__dirname, '../../data/restaurants.json');
const ordersPath = path.join(__dirname, '../../data/orders.json');

function readRestaurants() {
  const raw = fs.readFileSync(restaurantsPath, 'utf8');
  return JSON.parse(raw);
}

function writeRestaurants(restaurants) {
  fs.writeFileSync(restaurantsPath, JSON.stringify(restaurants, null, 2), 'utf8');
}

function readOrders() {
  const raw = fs.readFileSync(ordersPath, 'utf8');
  return JSON.parse(raw);
}

function writeOrders(orders) {
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2), 'utf8');
}

function registerFoodRoutes(app) {
  // ===== RESTAURANTS =====

  // GET /restaurants
  app.get('/restaurants', (req, res) => {
    const restaurants = readRestaurants();
    res.json(restaurants);
  });

  // GET /restaurant?id=1
  app.get('/restaurant', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const restaurants = readRestaurants();
    const restaurant = restaurants.find(r => r.id === id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    res.json(restaurant);
  });

  // POST /restaurants
  app.post('/restaurants', (req, res) => {
    const restaurants = readRestaurants();
    const newId = restaurants.length ? restaurants[restaurants.length - 1].id + 1 : 1;

    const newRestaurant = {
      id: newId,
      name: req.body.name || 'New Restaurant',
      rating: req.body.rating !== undefined ? Number(req.body.rating) : 0,
      isOpen: req.body.isOpen !== undefined ? Boolean(req.body.isOpen) : false,
      openedAt: req.body.openedAt || new Date().toISOString().slice(0, 10),
      cuisines: Array.isArray(req.body.cuisines) ? req.body.cuisines : []
    };

    restaurants.push(newRestaurant);
    writeRestaurants(restaurants);
    res.status(201).json(newRestaurant);
  });

  // PUT /restaurants?id=1
  app.put('/restaurants', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const restaurants = readRestaurants();
    const index = restaurants.findIndex(r => r.id === id);
    if (index === -1) return res.status(404).json({ error: 'Restaurant not found' });

    const updated = {
      id,
      name: req.body.name || restaurants[index].name,
      rating: req.body.rating !== undefined
        ? Number(req.body.rating)
        : restaurants[index].rating,
      isOpen: req.body.isOpen !== undefined
        ? Boolean(req.body.isOpen)
        : restaurants[index].isOpen,
      openedAt: req.body.openedAt || restaurants[index].openedAt,
      cuisines: Array.isArray(req.body.cuisines)
        ? req.body.cuisines
        : restaurants[index].cuisines
    };

    restaurants[index] = updated;
    writeRestaurants(restaurants);
    res.json(updated);
  });

  // PATCH /restaurants?id=1 (не идемпотентно)
  app.patch('/restaurants', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const restaurants = readRestaurants();
    const index = restaurants.findIndex(r => r.id === id);
    if (index === -1) return res.status(404).json({ error: 'Restaurant not found' });

    const restaurant = restaurants[index];

    if (req.body.name !== undefined) restaurant.name = req.body.name;
    if (req.body.rating !== undefined) {
      restaurant.rating = Number(req.body.rating);
    } else {
      // не идемпотентность: если rating не передан, слегка меняем рейтинг
      restaurant.rating = restaurant.rating + (Math.random() * 0.2 - 0.1);
    }
    if (req.body.isOpen !== undefined) restaurant.isOpen = Boolean(req.body.isOpen);
    if (req.body.openedAt !== undefined) restaurant.openedAt = req.body.openedAt;
    if (Array.isArray(req.body.cuisines)) restaurant.cuisines = req.body.cuisines;

    restaurants[index] = restaurant;
    writeRestaurants(restaurants);
    res.json(restaurant);
  });

  // DELETE /restaurants?id=1
  app.delete('/restaurants', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const restaurants = readRestaurants();
    const index = restaurants.findIndex(r => r.id === id);
    if (index === -1) return res.status(404).json({ error: 'Restaurant not found' });

    const deleted = restaurants.splice(index, 1)[0];
    writeRestaurants(restaurants);
    res.json(deleted);
  });

  // ===== ORDERS =====

  // GET /orders
  app.get('/orders', (req, res) => {
    const orders = readOrders();
    res.json(orders);
  });

  // GET /order?id=1
  app.get('/order', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const orders = readOrders();
    const order = orders.find(o => o.id === id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    res.json(order);
  });

  // POST /orders
  app.post('/orders', (req, res) => {
    const orders = readOrders();
    const newId = orders.length ? orders[orders.length - 1].id + 1 : 1;

    const newOrder = {
      id: newId,
      restaurantId: Number(req.body.restaurantId) || 1,
      totalPrice: req.body.totalPrice !== undefined ? Number(req.body.totalPrice) : 0,
      isDelivered: req.body.isDelivered !== undefined
        ? Boolean(req.body.isDelivered)
        : false,
      createdAt: req.body.createdAt || new Date().toISOString(),
      items: Array.isArray(req.body.items) ? req.body.items : []
    };

    orders.push(newOrder);
    writeOrders(orders);
    res.status(201).json(newOrder);
  });

  // PUT /orders?id=1
  app.put('/orders', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const orders = readOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return res.status(404).json({ error: 'Order not found' });

    const updated = {
      id,
      restaurantId: req.body.restaurantId !== undefined
        ? Number(req.body.restaurantId)
        : orders[index].restaurantId,
      totalPrice: req.body.totalPrice !== undefined
        ? Number(req.body.totalPrice)
        : orders[index].totalPrice,
      isDelivered: req.body.isDelivered !== undefined
        ? Boolean(req.body.isDelivered)
        : orders[index].isDelivered,
      createdAt: req.body.createdAt || orders[index].createdAt,
      items: Array.isArray(req.body.items)
        ? req.body.items
        : orders[index].items
    };

    orders[index] = updated;
    writeOrders(orders);
    res.json(updated);
  });

  // PATCH /orders?id=1
  app.patch('/orders', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const orders = readOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return res.status(404).json({ error: 'Order not found' });

    const order = orders[index];

    if (req.body.restaurantId !== undefined) {
      order.restaurantId = Number(req.body.restaurantId);
    }
    if (req.body.totalPrice !== undefined) {
      order.totalPrice = Number(req.body.totalPrice);
    } else {
      // неидемпотентность: случайно меняем стоимость
      order.totalPrice = order.totalPrice + Math.round(Math.random() * 10);
    }
    if (req.body.isDelivered !== undefined) {
      order.isDelivered = Boolean(req.body.isDelivered);
    }
    if (req.body.createdAt !== undefined) {
      order.createdAt = req.body.createdAt;
    }
    if (Array.isArray(req.body.items)) {
      order.items = req.body.items;
    }

    orders[index] = order;
    writeOrders(orders);
    res.json(order);
  });

  // DELETE /orders?id=1
  app.delete('/orders', (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'id is required' });

    const orders = readOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return res.status(404).json({ error: 'Order not found' });

    const deleted = orders.splice(index, 1)[0];
    writeOrders(orders);
    res.json(deleted);
  });
}

module.exports = registerFoodRoutes;
