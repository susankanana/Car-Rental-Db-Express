import { Request, Response } from "express";
import {createBookingService,getBookingService,getBookingByIdService,updateBookingService,deleteBookingService,} from "./booking.service";

export const createBookingController = async (req: Request, res: Response) => {
  try {
    const booking = req.body;
    const created = await createBookingService(booking);
    if (!created) return res.json({ message: "Booking not created" });
    return res.status(201).json({ message: created });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getBookingController = async (req: Request, res: Response) => {
  try {
    const bookings = await getBookingService();
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }
    return res.status(200).json({ data: bookings });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getBookingByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const booking = await getBookingByIdService(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    return res.status(200).json({ data: booking });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateBookingController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const booking = req.body;
    const existing = await getBookingByIdService(id);
    if (!existing) return res.status(404).json({ message: "Booking not found" });

    const updated = await updateBookingService(id, booking);
    if (!updated) return res.status(400).json({ message: "Booking not updated" });

    return res.status(200).json({ message: "Booking updated successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteBookingController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const existing = await getBookingByIdService(id);
    if (!existing) return res.status(404).json({ message: "Booking not found" });

    const deleted = await deleteBookingService(id);
    if (!deleted) return res.status(400).json({ message: "Booking not deleted" });

    return res.status(204).json({ message: "Booking deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
