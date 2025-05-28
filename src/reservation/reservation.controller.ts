import { Request, Response } from "express";
import {createReservationService,getReservationService,getReservationByIdService,getReservationsByCustomerIdService,updateReservationService,deleteReservationService,} from "./reservation.service";

export const createReservationController = async (req: Request, res: Response) => {
  try {
    const reservation = req.body;
    const created = await createReservationService(reservation);
    if (!created) return res.json({ message: "Reservation not created" });
    return res.status(201).json({ message: created });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getReservationController = async (req: Request, res: Response) => {
  try {
    const reservations = await getReservationService();
    if (!reservations || reservations.length === 0) {
      return res.status(404).json({ message: "No reservations found" });
    }
    return res.status(200).json({ data: reservations });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getReservationByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const reservation = await getReservationByIdService(id);
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });
    return res.status(200).json({ data: reservation });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getReservationsByCustomerIdController = async (req: Request, res: Response) => {
  try {
    const customerID = parseInt(req.params.customerID); 
    if (isNaN(customerID)) return res.status(400).json({ message: "Invalid ID" });

    const reservations = await getReservationsByCustomerIdService(customerID);
    if (!reservations) return res.status(404).json({ message: "Reservation not found" });
    return res.status(200).json({ data: reservations });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateReservationController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const reservation = req.body;
    const existing = await getReservationByIdService(id);
    if (!existing) return res.status(404).json({ message: "Reservation not found" });

    const updated = await updateReservationService(id, reservation);
    if (!updated) return res.status(400).json({ message: "Reservation not updated" });

    return res.status(200).json({ message: "Reservation updated successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteReservationController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const existing = await getReservationByIdService(id);
    if (!existing) return res.status(404).json({ message: "Reservation not found" });

    const deleted = await deleteReservationService(id);
    if (!deleted) return res.status(400).json({ message: "Reservation not deleted" });

    return res.status(204).json({ message: "Reservation deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
