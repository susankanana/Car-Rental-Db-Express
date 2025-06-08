import { sql } from "drizzle-orm";
import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { TICustomer, CustomerTable, TSCustomer, TSCustomerLoginInput } from "../drizzle/schema";

//register a customer
export const createCustomerService = async (user: TICustomer) => {
    await db.insert(CustomerTable).values(user);
    return "Customer added successfully";
}

export const verifyCustomerService = async (email: string) => {
    await db.update(CustomerTable)
        .set({ isVerified: true, verificationCode: null })
        .where(sql`${CustomerTable.email} = ${email}`);
}

// export const customerLoginService = async (customer: TSCustomer) => {
//     const { email } = customer; //extracts email property from customer

//     return await db.query.CustomerTable.findFirst({
//         columns: {
//             customerID: true,
//             firstName: true,
//             lastName: true,
//             email: true,
//             password: true,
//             role: true
//         }, where: sql`${CustomerTable.email} = ${email}`
//     })
// }

export const customerLoginService = async (customerInput: TSCustomerLoginInput) => {
    const { email } = customerInput;

    return await db.query.CustomerTable.findFirst({
        columns: {
            customerID: true,
            firstName: true,
            lastName: true,
            email: true,
            password: true,
            role: true
        },
        where: sql`${CustomerTable.email} = ${email}`
    });
}

export const getCustomerWithBookingsAndPaymentsService = async (id: number) => {
    return await db.query.CustomerTable.findFirst({
        where: eq(CustomerTable.customerID, id),
        columns: {
            firstName: true,
            lastName: true
        },
        with: {
            bookings: {
                columns: {
                    bookingID: true,
                    rentalStartDate: true,
                    rentalEndDate: true,
                    totalAmount: true
                },
                with: {
                    payments: true 
                }
            }
        }
    });
};

// get all customers with selected booking properties and their payments
export const getAllCustomersWithBookingsAndPaymentsService = async () => {
    return await db.query.CustomerTable.findMany({
        columns: {
            firstName: true,
            lastName: true
        },
        with: {
            bookings: {
                columns: {
                    bookingID: true,
                    rentalStartDate: true,
                    rentalEndDate: true,
                    totalAmount: true
                },
                with: {
                    payments: true
                }
            }
        }
    });
};
// get all customers 
export const getCustomerService = async () => {
    const customers = await db.query.CustomerTable.findMany();
    return customers;
}

// get customer by id
export const getCustomerByIdService = async (id: number) => {
    const customer = await db.query.CustomerTable.findFirst({
        where: eq(CustomerTable.customerID, id)
    })
    return customer;
}
//get customer by email
export const getCustomerByEmailService = async (email: string) => {
    return await db.query.CustomerTable.findFirst({
        where: sql`${CustomerTable.email} = ${email}`
    });
}; 

// update customer by id
export const updateCustomerService = async (id: number, customer: TICustomer) => {
    await db.update(CustomerTable).set(customer).where(eq(CustomerTable.customerID, id)).returning();
    return "Customer updated successfully";
}

// delete customer by id
export const deleteCustomerService = async (id: number) => {
    await db.delete(CustomerTable).where(eq(CustomerTable.customerID, id)).returning();
    return "Customer deleted successfully";
}