import cors from 'cors';
import express, { Router } from 'express'
import bodyParser from 'body-parser';
import { errorMiddlware } from './middlewares/error.middleware';
import AuthRoutes from './routes/auth.routes';
import TaskRoutes from './routes/task.routes';

interface Route {
    router: Router;
  }

class App {
  public app: express.Application;

  constructor (routes: Route[]) {
    this.app = express();
    this.set_config();
    this.initializeRoutes(routes);
    this.app.use(errorMiddlware);
  }

  private set_config() {
    this.app.use(cors());
    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  }

  private initializeRoutes(routes: Route[]) {
    routes.forEach((route) => {
      this.app.use('/', route.router);
    });
  }
}

export default new App([
    new AuthRoutes(),
    new TaskRoutes(),
  ]).app;
