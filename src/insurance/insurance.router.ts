import { Express } from "express";
import {registerInsuranceController,getInsuranceController,getInsuranceByIdController,updateInsuranceController,deleteInsuranceController} from "./insurance.controller";

const insurance = (app: Express) => {
  app.route("/insurance/register").post(async (req, res, next) => {
    try {
      await registerInsuranceController(req, res);
    } catch (error: any) {
      next(error);
    }
  });

  app.route("/insurances").get(async (req, res, next) => {
    try {
      await getInsuranceController(req, res);
    } catch (error: any) {
      next(error);
    }
  });

  app.route("/insurance/:id").get(async (req, res, next) => {
    try {
      await getInsuranceByIdController(req, res);
    } catch (error: any) {
      next(error);
    }
  });

  app.route("/insurance/:id").put(async (req, res, next) => {
    try {
      await updateInsuranceController(req, res);
    } catch (error: any) {
      next(error);
    }
  });

  app.route("/insurance/:id").delete(async (req, res, next) => {
    try {
      await deleteInsuranceController(req, res);
    } catch (error: any) {
      next(error);
    }
  });
};

export default insurance;
