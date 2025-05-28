import { Request, Response } from 'express';
import {createPaymentService,getPaymentService,getPaymentByIdService,getPaymentsByBookingIdService,updatePaymentService,deletePaymentService} from './payment.service';

export const registerPaymentController = async (req: Request, res: Response) => {
  try {
    const createPayment = await createPaymentService(req.body);
    if (!createPayment) return res.json({ message: "Payment not created" });
    return res.status(201).json({ message: createPayment });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export const getPaymentController = async (req: Request, res: Response) => {
  try {
    const payments = await getPaymentService();
    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No payments found" });
    }
    return res.status(200).json({ data: payments });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export const getPaymentByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const payment = await getPaymentByIdService(id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    return res.status(200).json({ data: payment });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export const getPaymentsByBookingIdController = async (req: Request, res: Response) => {
  try {
    const bookingID = parseInt(req.params.bookingID); 
    if (isNaN(bookingID)) return res.status(400).json({ message: "Invalid ID" });

    const payments = await getPaymentsByBookingIdService(bookingID);
    if (!payments) return res.status(404).json({ message: "Payment not found" });
    return res.status(200).json({ data: payments});
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updatePaymentController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const updated = await updatePaymentService(id, req.body);
    if (!updated) return res.status(400).json({ message: "Payment not updated" });

    return res.status(200).json({ message: "Payment updated successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export const deletePaymentController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const existing = await getPaymentByIdService(id);
    if (!existing) return res.status(404).json({ message: "Payment not found" });

    const deleted = await deletePaymentService(id);
    if (!deleted) return res.status(400).json({ message: "Payment not deleted" });

    return res.status(204).json({ message: "Payment deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
