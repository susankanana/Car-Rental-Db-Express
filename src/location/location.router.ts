import { Express } from "express";
import {registerLocationController,getLocationController,getLocationByIdController,updateLocationController,deleteLocationController} from "./location.controller";
import { adminRoleAuth, bothRoleAuth, userRoleAuth, } from '../middleware/bearerAuth';

const location = (app: Express) => {
    // register location route
    app.route("/location/register").post(
         adminRoleAuth,
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
        bothRoleAuth,
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
        adminRoleAuth,
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
        adminRoleAuth,
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
        adminRoleAuth,
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
