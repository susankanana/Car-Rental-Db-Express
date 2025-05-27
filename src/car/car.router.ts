import { Express } from "express";
import { createCarController, getCarController, getCarByIdController, updateCarController, deleteCarController } from "./car.controller";

const car = (app: Express) => {
  app.route("/car/register").post(
    async (req, res, next) => {
      try {
        await createCarController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );

  app.route("/cars").get(
    async (req, res, next) => {
      try {
        await getCarController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );

  app.route("/car/:id").get(
    async (req, res, next) => {
      try {
        await getCarByIdController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );

  app.route("/car/:id").put(
    async (req, res, next) => {
      try {
        await updateCarController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );

  app.route("/car/:id").delete(
    async (req, res, next) => {
      try {
        await deleteCarController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );
};

export default car;
