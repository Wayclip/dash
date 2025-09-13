import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/authContext';
import { Toaster } from 'sonner';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/nav';

const inter = Inter({
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Wayclip Dashboard',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en' className={inter.className} suppressHydrationWarning>
            <body className='flex flex-col min-h-screen'>
                <AuthProvider>
                    <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
                        <Navbar />
                        {children}

                        <footer className='border-t py-12 px-4'>
                            <div className='container mx-auto max-w-6xl'>
                                <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
                                    <div className='md:col-span-2'>
                                        <div className='flex items-center space-x-2 mb-4'>
                                            <span className='font-bold text-xl'>Wayclip</span>
                                        </div>
                                        <p className='text-muted-foreground mb-4 max-w-md'>
                                            An open-source instant replay tool for modern Linux desktops. Built with ❤️
                                            for the Linux community.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className='font-semibold mb-4'>Product</h4>
                                        <ul className='space-y-2 text-sm text-muted-foreground'>
                                            <li>
                                                <a
                                                    href='https://wayclip.com#Features'
                                                    className='hover:text-foreground transition-colors'
                                                >
                                                    Features
                                                </a>
                                            </li>
                                            <li>
                                                <a
                                                    href='https://wayclip.com#Pricing'
                                                    className='hover:text-foreground transition-colors'
                                                >
                                                    Pricing
                                                </a>
                                            </li>
                                            <li>
                                                <a
                                                    href='https://wayclip.com/privacy'
                                                    className='hover:text-foreground transition-colors'
                                                >
                                                    Privacy Policy
                                                </a>
                                            </li>
                                            <li>
                                                <a
                                                    href='https://wayclip.com/terms'
                                                    className='hover:text-foreground transition-colors'
                                                >
                                                    Terms Of Service
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className='font-semibold mb-4'>Community</h4>
                                        <ul className='space-y-2 text-sm text-muted-foreground'>
                                            <li>
                                                <a
                                                    href='https://github.com/wayclip'
                                                    target='_blank'
                                                    rel='noopener norefferer'
                                                    className='hover:text-foreground transition-colors'
                                                >
                                                    GitHub
                                                </a>
                                            </li>
                                            <li>
                                                <Link
                                                    href='https://wayclip.com/docs/contributing'
                                                    className='hover:text-foreground transition-colors'
                                                >
                                                    Contributing
                                                </Link>
                                            </li>
                                            <li>
                                                <a
                                                    href='https://discord.gg/BrXAHknFE6'
                                                    target='_blank'
                                                    rel='noopener norefferer'
                                                    className='hover:text-foreground transition-colors'
                                                >
                                                    Discord
                                                </a>
                                            </li>
                                            <li>
                                                <a
                                                    href='https://status.wayclip.com'
                                                    target='_blank'
                                                    rel='noopener norefferer'
                                                    className='hover:text-foreground transition-colors'
                                                >
                                                    Status
                                                </a>
                                            </li>
                                            <li>
                                                <Link
                                                    href='https://wayclip.com/docs'
                                                    className='hover:text-foreground transition-colors'
                                                >
                                                    Documentation
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className='border-t pt-8 text-center'>
                                    <p className='text-sm text-muted-foreground'>
                                        &copy; {new Date().getFullYear()} Wayclip. Open source software licensed under
                                        MIT.
                                    </p>
                                </div>
                            </div>
                        </footer>
                        <Toaster richColors theme='system' />
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
