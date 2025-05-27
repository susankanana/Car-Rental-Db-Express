import { Request, Response } from 'express';
import {createInsuranceService,getInsuranceService,getInsuranceByIdService,updateInsuranceService,deleteInsuranceService} from './insurance.service';

export const registerInsuranceController = async (req: Request, res: Response) => {
  try {
    const createInsurance = await createInsuranceService(req.body);
    if (!createInsurance) return res.json({ message: "Insurance not created" });
    return res.status(201).json({ message: createInsurance });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export const getInsuranceController = async (req: Request, res: Response) => {
  try {
    const insurances = await getInsuranceService();
    if (!insurances || insurances.length === 0) {
      return res.status(404).json({ message: "No insurances found" });
    }
    return res.status(200).json({ data: insurances });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export const getInsuranceByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const insurance = await getInsuranceByIdService(id);
    if (!insurance) return res.status(404).json({ message: "Insurance not found" });

    return res.status(200).json({ data: insurance });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export const updateInsuranceController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const updated = await updateInsuranceService(id, req.body);
    if (!updated) return res.status(400).json({ message: "Insurance not updated" });

    return res.status(200).json({ message: "Insurance updated successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export const deleteInsuranceController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const existing = await getInsuranceByIdService(id);
    if (!existing) return res.status(404).json({ message: "Insurance not found" });

    const deleted = await deleteInsuranceService(id);
    if (!deleted) return res.status(400).json({ message: "Insurance not deleted" });

    return res.status(204).json({ message: "Insurance deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
