import { Express } from "express";
import {registerMaintenanceController,getMaintenanceController,getMaintenanceByIdController,updateMaintenanceController,deleteMaintenanceController} from "./maintenance.controller";

const maintenance = (app: Express) => {
  app.route("/maintenance/register").post(async (req, res, next) => {
    try {
      await registerMaintenanceController(req, res);
    } catch (error: any) {
      next(error);
    }
  });

  app.route("/maintenances").get(async (req, res, next) => {
    try {
      await getMaintenanceController(req, res);
    } catch (error: any) {
      next(error);
    }
  });

  app.route("/maintenance/:id").get(async (req, res, next) => {
    try {
      await getMaintenanceByIdController(req, res);
    } catch (error: any) {
      next(error);
    }
  });

  app.route("/maintenance/:id").put(async (req, res, next) => {
    try {
      await updateMaintenanceController(req, res);
    } catch (error: any) {
      next(error);
    }
  });

  app.route("/maintenance/:id").delete(async (req, res, next) => {
    try {
      await deleteMaintenanceController(req, res);
    } catch (error: any) {
      next(error);
    }
  });
};

export default maintenance;
