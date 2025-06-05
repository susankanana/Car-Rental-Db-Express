import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { createLocationService,getLocationService, getLocationByIdService,getLocationWithCarsService, updateLocationService, deleteLocationService } from './location.service';

// Create location controller
export const registerLocationController = async (req: Request, res: Response) => {
  try {
    const location = req.body;

    const createdLocation = await createLocationService(location);
    if (!createdLocation) return res.status(400).json({ message: "Location not created" });

    return res.status(201).json({ message: createdLocation });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all locations controller
export const getLocationController = async (_req: Request, res: Response) => {
  try {
    const locations = await getLocationService();
    if (!locations || locations.length === 0) {
      return res.status(404).json({ message: "No locations found" });
    }
    return res.status(200).json({ data: locations });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get location by ID controller
export const getLocationByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const location = await getLocationByIdService(id);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    return res.status(200).json({ data: location });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getLocationWithCarsController = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid location ID" });
        }

        const location = await getLocationWithCarsService(id);

        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }

        res.status(200).json(location);
    } catch (error) {
        console.error("Error fetching location with cars:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
// Update location by ID controller
export const updateLocationController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const location = req.body;

    const existingLocation = await getLocationByIdService(id);
    if (!existingLocation) {
      return res.status(404).json({ message: "Location not found" });
    }

    const updatedLocation = await updateLocationService(id, location);
    if (!updatedLocation) {
      return res.status(400).json({ message: "Location not updated" });
    }
    return res.status(200).json({ message: "Location updated successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete location by ID controller
export const deleteLocationController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const existingLocation = await getLocationByIdService(id);
    if (!existingLocation) {
      return res.status(404).json({ message: "Location not found" });
    }

    const deleted = await deleteLocationService(id);
    if (!deleted) {
      return res.status(400).json({ message: "Location not deleted" });
    }

    return res.status(204).json({ message: "Location deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
