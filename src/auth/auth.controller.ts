import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { createCustomerService,customerLoginService,getCustomerService, getCustomerByIdService, updateCustomerService, deleteCustomerService } from './auth.service';
import jwt from 'jsonwebtoken';


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

export const loginCustomerController = async (req: Request, res: Response) => {
    try {
        const customer= req.body;
        //const customer = req.body

        // check if customer exists
        const customerExist = await customerLoginService(customer);
        if (!customerExist) {
            return res.status(404).json({ message: "Customer not found" });
        }
        // verify password
        if (typeof customer.password !== 'string' || customer.password.length === 0) {
        return res.status(400).json({ message: "Password is required." });
        }
        
        const userMatch = await bcrypt.compareSync(customer.password, customerExist.password as string)
        if (!userMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // create a payload for the JWT
        const payload = {
            sub: customerExist.customerID, //sub means subject, which is the customer ID - it helps identify the user
            user_id: customerExist.customerID,
            first_name: customerExist.firstName,
            last_name: customerExist.lastName,
            role: customerExist.role, // role of the user
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 3 // 3 days expiration

            // /1000 converts milliseconds to seconds
            // +60 - adds 60 seconds - this is for 1 minute
            // * 60 - adds 60 minutes- this is for 1 hour
            // * 24 - adds 24 hours - this is for 1 day
            // * 3 - adds 3 days - this is for 3 days

            // if i was to add it for 1hr, Date.now() / 1000 + 60 * 60
            // if i was to add it for 1 week, Date.now() / 1000 + 60 * 60 * 24 * 7
            // // if i was to add it for 1 month, Date.now() / 1000 + 60 * 60 * 24 * 30
            // adding it for a minute, Date.now() / 1000 + 60
            // adding for 30 seconds, Date.now() / 1000 + 30
        }

        // Generate JWT token
        const secret = process.env.JWT_SECRET as string;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined in the environment variables");
        }
        const token = jwt.sign(payload, secret);

        // Return the token and user information
        return res.status(200).json({
            message: "Login Successfull",
            token,
            user: {
                user_id: customerExist.customerID,
                first_name: customerExist.firstName,
                last_name: customerExist.lastName,
                email: customerExist.email,
                role: customerExist.role
            }
        })

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