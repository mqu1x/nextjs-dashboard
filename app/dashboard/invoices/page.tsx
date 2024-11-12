import { fetchInvoicesPages } from '@/app/lib/data'
import { lusitana } from '@/app/ui/fonts'
import { CreateInvoice } from '@/app/ui/invoices/buttons'
import Pagination from '@/app/ui/invoices/pagination'
import Table from '@/app/ui/invoices/table'
import Search from '@/app/ui/search'
import { InvoicesTableSkeleton } from '@/app/ui/skeletons'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
	title: 'Invoices',
}

const Page = async (props: {
	searchParams?: Promise<{ search: string; page: string }>
}) => {
	const searchParams = await props.searchParams
	const search = searchParams?.search || ''
	const currentPage = Number(searchParams?.page || 1)
	const totalPages = await fetchInvoicesPages(search)

	return (
		<div className='w-full'>
			<div className='flex w-full items-center justify-between'>
				<h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
			</div>
			<div className='mt-4 flex items-center justify-between gap-2 md:mt-8'>
				<Search placeholder='Search invoices...' />
				<CreateInvoice />
			</div>
			<Suspense fallback={<InvoicesTableSkeleton />}>
				<Table query={search} currentPage={currentPage} />
			</Suspense>
			<div className='mt-5 flex w-full justify-center'>
				<Pagination totalPages={totalPages} />
			</div>
		</div>
	)
}

export default Page
