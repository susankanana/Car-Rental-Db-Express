import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { createCustomerService,getCustomerService, getCustomerByIdService, updateCustomerService, deleteCustomerService } from './auth.service';


// create user controller
export const registerCustomerController = async (req: Request, res: Response) => {
    try {
        const customer = req.body;
        const password = customer.password;
        const hashedPassword = await bcrypt.hashSync(password, 10);
        customer.password = hashedPassword;

        const createCustomer = await createCustomerService(customer);
        if (!createCustomer) return res.json({ message: "Customer not created" })
        return res.status(201).json({ message: createCustomer });

    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}

// get all customer controller
export const getCustomerController = async (req: Request, res: Response) => {
    try {
        const customers = await getCustomerService()
        if (!customers || customers.length === 0) {
            return res.status(404).json({ message: "No customers found" });
        }
        return res.status(200).json({ data: customers });

    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}

// get todo by id controller
export const getCustomerByIdController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const customer = await getCustomerByIdService(id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        return res.status(200).json({ data: customer });

    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}

// update customer by id controller
export const updateCustomerController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const customer = req.body;


        // Convert dueDate to a Date object if provided
        if (customer.dueDate) {
            customer.dueDate = new Date(customer.dueDate);
        }

        const existingCustomer = await getCustomerByIdService(id);
        if (!existingCustomer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const updatedCustomer = await updateCustomerService(id, customer);
        if (!updatedCustomer) {
            return res.status(400).json({ message: "Customer not updated" });
        }
        return res.status(200).json({ message: "Customer updated successfully" });

    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}

// delete customer by id controller

export const deleteCustomerController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const existingCustomer = await getCustomerByIdService(id);
        if (!existingCustomer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const deleted = await deleteCustomerService(id);
        if (!deleted) {
            return res.status(400).json({ message: "Customer not deleted" });
        }

        return res.status(204).json({ message: "Customer deleted successfully" });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}