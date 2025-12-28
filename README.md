# L910 Framework

Учебный проект: минималистичный HTTP‑фреймворк на Node.js (без Express) и несколько REST API модулей (авто, спортзал, доставка еды, армия).

## Установка и запуск

npm install
npm start

Сервер запустится на `http://localhost:3000`.

## Структура проекта

project-root/
data/
cars.json
owners.json
members.json
workouts.json
restaurants.json
orders.json
soldiers.json
units.json
src/
framework/
app.js
router.js
routes/
cars.js
owners.js
gym.js
food.js
army.js
index.js
package.json
README.md

## Маршруты API (кратко)

- /cars, /car
- /owners, /owner
- /members, /member
- /workouts, /workout
- /restaurants, /restaurant
- /orders, /order
- /soldiers, /soldier
- /units, /unit

# L910-Framework

## Вариант 19 — Автомобили

Сущности:

- `cars.json` — автомобили (string: model, number: price, boolean: inStock, Date: arrivedAt, Array: features).
- `owners.json` — владельцы (string: name, number: age, boolean: isActive, Date: registeredAt, Array: cars).

Маршруты:

- GET /cars, GET /car?id
- POST /cars, PUT /cars?id, PATCH /cars?id, DELETE /cars?id

- GET /owners, GET /owner?id
- POST /owners, PUT /owners?id, PATCH /owners?id, DELETE /owners?id

## Вариант 7 — Спортзал

Сущности:

- `members.json` — клиенты спортзала (string: fullName, number: age, boolean: isActive, Date: registrationDate, Array: subscriptions).
- `workouts.json` — тренировки (string: title, number: durationMinutes, boolean: isGroup, Date: startTime, Array: trainers).

Маршруты:

- GET /members, GET /member?id
- POST /members, PUT /members?id, PATCH /members?id, DELETE /members?id

- GET /workouts, GET /workout?id
- POST /workouts, PUT /workouts?id, PATCH /workouts?id, DELETE /workouts?id

## Вариант 8 — Доставка еды

Сущности:

- `restaurants.json` — рестораны (string: name, number: rating, boolean: isOpen, Date: openedAt, Array: cuisines).
- `orders.json` — заказы (number: restaurantId, number: totalPrice, boolean: isDelivered, Date: createdAt, Array: items).

Маршруты:

- GET /restaurants, GET /restaurant?id
- POST /restaurants, PUT /restaurants?id, PATCH /restaurants?id, DELETE /restaurants?id

- GET /orders, GET /order?id
- POST /orders, PUT /orders?id, PATCH /orders?id, DELETE /orders?id

## Вариант 1 — Армия

Сущности:

- `soldiers.json` — солдаты (string: name, number: age, boolean: onDuty, Date: enlistmentDate, Array: skills).
- `units.json` — подразделения (string: name, number: soldiersCount, boolean: isActive, Date: formedAt, Array: specializations).

Маршруты:

- GET /soldiers, GET /soldier?id
- POST /soldiers, PUT /soldiers?id, PATCH /soldiers?id, DELETE /soldiers?id

- GET /units, GET /unit?id
- POST /units, PUT /units?id, PATCH /units?id, DELETE /units?id

