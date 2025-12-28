const createApp = require('./framework/app');
const registerCarsRoutes = require('./routes/cars');
const registerOwnersRoutes = require('./routes/owners');
const registerGymRoutes = require('./routes/gym');
const registerFoodRoutes = require('./routes/food');
const registerArmyRoutes = require('./routes/army');

const app = createApp();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

registerCarsRoutes(app);
registerOwnersRoutes(app);
registerGymRoutes(app);
registerFoodRoutes(app);
registerArmyRoutes(app);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
