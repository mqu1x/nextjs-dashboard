import { inter } from '@/app/ui/fonts'
import '@/app/ui/global.css'
import { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang='ru'>
			<body className={`${inter.className} antialiased`}>{children}</body>
		</html>
	)
}
