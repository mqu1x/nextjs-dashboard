'use server'

import { signIn } from '@/auth'
import { sql } from '@vercel/postgres'
import { AuthError } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export type State = {
	errors?: {
		customerId?: string[]
		amount?: string[]
		status?: string[]
	}
	message?: string | null
}

const FormSchema = z.object({
	id: z.string(),
	customerId: z.string({
		required_error: 'Customer ID is required.',
	}),
	amount: z.coerce.number().gt(0, {
		message: 'Amount must be greater than 0.',
	}),
	status: z.enum(['pending', 'paid'], {
		required_error: 'Status must be either "pending" or "paid".',
	}),
	data: z.string(),
})

const CreateInvoice = FormSchema.omit({ id: true, data: true })

export const createInvoice = async (prevState: State, formData: FormData) => {
	const validatedFields = CreateInvoice.safeParse(
		Object.fromEntries(formData.entries())
	)

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Missing required fields.',
		}
	}

	const { customerId, amount, status } = validatedFields.data
	const amountInCents = amount * 100
	const date = new Date().toISOString().split('T')[0]

	try {
		await sql`
		INSERT INTO invoices (customer_id, amount, status, date)
		VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
	`
	} catch (err) {
		return {
			message: 'Database Error: Failed to create invoice.',
		}
	}

	revalidatePath('/dashboard/invoices')
	redirect('/dashboard/invoices')
}

const UpdateInvoice = FormSchema.omit({ id: true, data: true })
export const updateInvoice = async (
	id: string,
	prevState: State,
	formData: FormData
) => {
	const validatedFields = UpdateInvoice.safeParse(
		Object.fromEntries(formData.entries())
	)

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			message: 'Missing required fields.',
		}
	}

	const { customerId, amount, status } = validatedFields.data
	const amountInCents = amount * 100

	try {
		await sql`
		UPDATE invoices
		SET customer_id = ${customerId}, amount =  ${amountInCents}, status = ${status}
		WHERE id = ${id}
	`
	} catch (err) {
		return { message: 'Database Error: Failed to update invoice.' }
	}

	revalidatePath('/dashboard/invoices')
	redirect('/dashboard/invoices')
}

export const deleteInvoice = async (id: string) => {
	try {
		await sql`
		DELETE FROM invoices WHERE id = ${id}
	`
		revalidatePath('/dashboard/invoices')
		return { message: 'Invoice deleted successfully.' }
	} catch (err) {
		return {
			message: 'Database Error: Failed to delete invoice.',
		}
	}
}

export const authenticate = async (
	prevState: string | undefined,
	formData: FormData
) => {
	try {
		await signIn('credentials', formData)
	} catch (err) {
		if (err instanceof AuthError) {
			switch (err.type) {
				case 'CredentialsSignin':
					return 'Invalid credentials.'
				default:
					return 'Failed to sign in. Something went wrong.'
			}
		}
		throw err
	}
}
