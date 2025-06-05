import { Express } from "express";
import { createCarController, getCarController, getCarByIdController,getCarWithBookingsController, updateCarController, deleteCarController } from "./car.controller";
//import { isAuthenticated } from "../middleware/bearerAuth";
import { adminRoleAuth, bothRoleAuth, userRoleAuth, } from '../middleware/bearerAuth';

const car = (app: Express) => {
  app.route("/car/register").post(
      adminRoleAuth,  //if this verification is passed. Next() called in bearerAuth.ts allows us to proceed to the next part
    async (req, res, next) => {
      try {
        await createCarController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );

  app.route("/cars").get(
    //   isAuthenticated, // without specifying roles
    bothRoleAuth,
    async (req, res, next) => {
      try {
        await getCarController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );

  app.route("/car/:id").get(
      adminRoleAuth,
    async (req, res, next) => {
      try {
        await getCarByIdController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );

  app.route("/car-bookings/:id").get(
      adminRoleAuth,
    async (req, res, next) => {
      try {
        await getCarWithBookingsController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );

  app.route("/car/:id").put(
      adminRoleAuth,
    async (req, res, next) => {
      try {
        await updateCarController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );

  app.route("/car/:id").delete(
      adminRoleAuth,
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
