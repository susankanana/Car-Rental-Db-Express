import { Express } from "express";
import { registerCustomerController,verifyCustomerController,loginCustomerController,getCustomerBookingsAndPaymentsController,getAllCustomersBookingsAndPaymentsController, getCustomerController, getCustomerByIdController, updateCustomerController, deleteCustomerController } from "./auth.controller";

const customer = (app: Express) => {
    // register user route
    app.route("/auth/register").post(
        async (req, res, next) => {
            try {
                await registerCustomerController(req, res);
            } catch (error: any) {
                next(error); //means that if an error occurs, it will be passed to the next middleware, which in this case is the error handler
            }
        }
    )
   // verify customer route
    app.route("/auth/verify").post(
        async (req, res, next) => {
            try {
                await verifyCustomerController(req, res)
            } catch (error) {
                next(error)
            }
        }
    )
    // login user route
    app.route("/auth/login").post(
        async (req, res, next) => {
            try {
                await loginCustomerController(req, res);
            } catch (error: any) {
                next(error); 
            }
        }
    )
    app.route('/customer/bookings-payments/:id').get(
        async (req, res, next) => {
            try {
                await getCustomerBookingsAndPaymentsController(req, res);
            } catch (error: any) {
                next(error);
            }
        }
    )

    app.route('/customers/bookings-payments').get(
        async (req, res, next) => {
            try {
                await getAllCustomersBookingsAndPaymentsController(req, res);
            } catch (error: any) {
                next(error);
            }
        }
    )
    // get all customers route
    app.route('/customers').get(
        async (req, res, next) => {
            try {
                await getCustomerController(req, res);
            } catch (error: any) {
                next(error); // Passes the error to the next middleware
            }
        }
    )

    // get customer by id route
    app.route('/customer/:id').get(
        async (req, res, next) => {
            try {
                await getCustomerByIdController(req, res);
            } catch (error: any) {
                next(error); // Passes the error to the next middleware
            }
        }
    )

    // update customer by id route
    app.route('/customer/:id').put(
        async (req, res, next) => {
            try {
                await updateCustomerController(req, res);
            } catch (error: any) {
                next(error); // Passes the error to the next middleware
            }
        }
    )

    // delete customer by id route
    app.route('/customer/:id').delete(
        async (req, res, next) => {
            try {
                await deleteCustomerController(req, res);
            } catch (error: any) {
                next(error); // Passes the error to the next middleware
            }
        }
    )
}

export default customer;