import { Express } from "express";
import {registerLocationController,getLocationController,getLocationByIdController,updateLocationController,deleteLocationController} from "./location.controller";

const location = (app: Express) => {
    // register location route
    app.route("/location/register").post(
        async (req, res, next) => {
            try {
                await registerLocationController(req, res);
            } catch (error: any) {
                next(error);
            }
        }
    );

    // get all locations route
    app.route('/locations').get(
        async (req, res, next) => {
            try {
                await getLocationController(req, res);
            } catch (error: any) {
                next(error);
            }
        }
    );

    // get location by id route
    app.route('/location/:id').get(
        async (req, res, next) => {
            try {
                await getLocationByIdController(req, res);
            } catch (error: any) {
                next(error);
            }
        }
    );

    // update location by id route
    app.route('/location/:id').put(
        async (req, res, next) => {
            try {
                await updateLocationController(req, res);
            } catch (error: any) {
                next(error);
            }
        }
    );

    // delete location by id route
    app.route('/location/:id').delete(
        async (req, res, next) => {
            try {
                await deleteLocationController(req, res);
            } catch (error: any) {
                next(error);
            }
        }
    );
};

export default location;
