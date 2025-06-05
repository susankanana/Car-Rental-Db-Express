import { Request, Response } from "express";
import { createCarService, getCarService, getCarByIdService,getCarWithBookingsService, updateCarService, deleteCarService } from "./car.service";

// create car controller
export const createCarController = async (req: Request, res: Response) => {
  try {
    const car = req.body;
    const created = await createCarService(car);
    if (!created) return res.json({ message: "Car not created" });
    return res.status(201).json({ message: created });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// get all cars controller
export const getCarController = async (req: Request, res: Response) => {
  try {
    const cars = await getCarService();
    if (!cars || cars.length === 0) {
      return res.status(404).json({ message: "No cars found" });
    }
    return res.status(200).json({ data: cars });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

//get car with all bookings made on it
export const getCarWithBookingsController = async (req: Request, res: Response) => {
    try {
        const carID = Number(req.params.id);

        if (isNaN(carID)) {
            return res.status(400).json({ message: "Invalid car ID" });
        }

        const car = await getCarWithBookingsService(carID);

        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }

        res.status(200).json(car);
    } catch (error) {
        console.error("Error fetching car with bookings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// get car by id controller
export const getCarByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const car = await getCarByIdService(id);
    if (!car) return res.status(404).json({ message: "Car not found" });
    return res.status(200).json({ data: car });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// update car by id controller
export const updateCarController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const car = req.body;
    const existingCar = await getCarByIdService(id);
    if (!existingCar) return res.status(404).json({ message: "Car not found" });

    const updated = await updateCarService(id, car);
    if (!updated) return res.status(400).json({ message: "Car not updated" });
    return res.status(200).json({ message: "Car updated successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// delete car by id controller
export const deleteCarController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const existingCar = await getCarByIdService(id);
    if (!existingCar) return res.status(404).json({ message: "Car not found" });

    const deleted = await deleteCarService(id);
    if (!deleted) return res.status(400).json({ message: "Car not deleted" });

    return res.status(204).json({ message: "Car deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
