import { Express } from "express";
import { createReservationController,getReservationController,getReservationByIdController,getReservationsByCustomerIdController,updateReservationController,deleteReservationController,} from "./reservation.controller";
import { adminRoleAuth, bothRoleAuth, userRoleAuth, } from '../middleware/bearerAuth';


const reservation = (app: Express) => {
  app.route("/reservation/register").post(
    userRoleAuth,
    async (req, res, next) => {
      try {
        await createReservationController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );

  app.route("/reservations").get(
    adminRoleAuth,
    async (req, res, next) => {
      try {
        await getReservationController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );

  //customerID must be spelled in exact same way as in controller while being referenced in params
  app.route("/reservations/customer/:customerID").get(
    userRoleAuth,
    async (req, res, next) => {
      try {
        await getReservationsByCustomerIdController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );

  app.route("/reservation/:id").get(
    adminRoleAuth,
    async (req, res, next) => {
      try {
        await getReservationByIdController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );

  app.route("/reservation/:id").put(
    bothRoleAuth,
    async (req, res, next) => {
      try {
        await updateReservationController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );

  app.route("/reservation/:id").delete(
    adminRoleAuth,
    async (req, res, next) => {
      try {
        await deleteReservationController(req, res);
      } catch (error: any) {
        next(error);
      }
    }
  );
};

export default reservation;
