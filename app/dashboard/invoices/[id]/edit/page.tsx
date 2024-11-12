import { fetchCustomers, fetchInvoiceById } from '@/app/lib/data'
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs'
import Form from '@/app/ui/invoices/edit-form'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Edit Invoice',
}

const Page = async (props: { params: Promise<{ id: string }> }) => {
	const { id } = await props.params
	const [invoice, customers] = await Promise.all([
		fetchInvoiceById(id),
		fetchCustomers(),
	])

	!invoice && notFound()

	return (
		<main>
			<Breadcrumbs
				breadcrumbs={[
					{ label: 'Invoices', href: '/dashboard/invoices' },
					{
						label: 'Edit Invoice',
						href: `/dashboard/invoices/${id}/edit`,
						active: true,
					},
				]}
			/>
			<Form invoice={invoice} customers={customers} />
		</main>
	)
}

export default Page
