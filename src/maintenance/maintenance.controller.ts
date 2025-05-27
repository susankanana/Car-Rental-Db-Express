import { Request, Response } from 'express';
import {createMaintenanceService,getMaintenanceService,getMaintenanceByIdService,updateMaintenanceService,deleteMaintenanceService} from './maintenance.service';

export const registerMaintenanceController = async (req: Request, res: Response) => {
  try {
    const createMaintenance = await createMaintenanceService(req.body);
    if (!createMaintenance) return res.json({ message: "Maintenance not created" });
    return res.status(201).json({ message: createMaintenance });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export const getMaintenanceController = async (req: Request, res: Response) => {
  try {
    const maintenances = await getMaintenanceService();
    if (!maintenances || maintenances.length === 0) {
      return res.status(404).json({ message: "No maintenances found" });
    }
    return res.status(200).json({ data: maintenances });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export const getMaintenanceByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const maintenance = await getMaintenanceByIdService(id);
    if (!maintenance) return res.status(404).json({ message: "Maintenance not found" });

    return res.status(200).json({ data: maintenance });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export const updateMaintenanceController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const updated = await updateMaintenanceService(id, req.body);
    if (!updated) return res.status(400).json({ message: "Maintenance not updated" });

    return res.status(200).json({ message: "Maintenance updated successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export const deleteMaintenanceController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const existing = await getMaintenanceByIdService(id);
    if (!existing) return res.status(404).json({ message: "Maintenance not found" });

    const deleted = await deleteMaintenanceService(id);
    if (!deleted) return res.status(400).json({ message: "Maintenance not deleted" });

    return res.status(204).json({ message: "Maintenance deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
