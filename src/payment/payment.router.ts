import { Express } from "express";
import {registerPaymentController,getPaymentController,getPaymentByIdController,updatePaymentController,deletePaymentController} from "./payment.controller";

const payment = (app: Express) => {
  app.route("/payment/register").post(async (req, res, next) => {
    try {
      await registerPaymentController(req, res);
    } catch (error: any) {
      next(error);
    }
  });

  app.route("/payments").get(async (req, res, next) => {
    try {
      await getPaymentController(req, res);
    } catch (error: any) {
      next(error);
    }
  });

  app.route("/payment/:id").get(async (req, res, next) => {
    try {
      await getPaymentByIdController(req, res);
    } catch (error: any) {
      next(error);
    }
  });

  app.route("/payment/:id").put(async (req, res, next) => {
    try {
      await updatePaymentController(req, res);
    } catch (error: any) {
      next(error);
    }
  });

  app.route("/payment/:id").delete(async (req, res, next) => {
    try {
      await deletePaymentController(req, res);
    } catch (error: any) {
      next(error);
    }
  });
};

export default payment;
