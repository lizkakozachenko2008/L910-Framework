const http = require('http');
const url = require('url');

function createApp() {
  const routes = [];
  const middlewares = [];

  function register(method, path, handler) {
    routes.push({ method, path, handler });
  }

  const app = {};

  ['get', 'post', 'put', 'patch', 'delete'].forEach(method => {
    app[method] = (path, handler) => register(method.toUpperCase(), path, handler);
  });

  app.use = fn => {
    middlewares.push(fn);
  };

  app.listen = (port, callback) => {
    const server = http.createServer(async (req, res) => {
      try {
        const parsedUrl = url.parse(req.url, true);

        req.path = parsedUrl.pathname;
        req.query = parsedUrl.query || {};
        req.params = {};
        req.body = null;

        res.statusCode = 200;
        res.status = code => {
          res.statusCode = code;
          return res;
        };
        res.send = data => {
          if (typeof data === 'object') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(String(data));
          } else {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(data);
          }
        };
        res.json = obj => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(obj));
        };

        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
          let bodyData = '';
          for await (const chunk of req) {
            bodyData += chunk;
          }
          if (bodyData) {
            try {
              req.body = JSON.parse(bodyData);
            } catch {
              req.body = bodyData;
            }
          }
        }

        const route = routes.find(r => r.method === req.method && r.path === req.path);

        if (!route) {
          res.status(404).json({ error: 'Not found' });
          return;
        }

        let index = 0;
        const runMiddleware = () => {
          if (index < middlewares.length) {
            const mw = middlewares[index++];
            mw(req, res, runMiddleware);
          } else {
            route.handler(req, res);
          }
        };

        runMiddleware();
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    server.listen(port, callback);
  };

  return app;
}

module.exports = createApp;
