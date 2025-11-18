import Link from 'next/link';
import type { AppConfig } from '@/app/api/config/route';

interface FooterProps {
    appName?: string;
    appDesc?: string;
    footerLinks?: AppConfig['footerLinks'];
}

export const Footer = ({ appName = 'Wayclip', appDesc = '', footerLinks = {} }: FooterProps) => {
    return (
        <footer className='border-t py-12 px-4'>
            <div className='container mx-auto max-w-6xl'>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
                    <div className='md:col-span-2'>
                        <span className='font-bold text-xl mb-4 block'>{appName}</span>
                        <p className='text-muted-foreground max-w-md'>{appDesc}</p>
                    </div>
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className='font-semibold mb-4'>{category}</h4>
                            <ul className='space-y-2 text-sm text-muted-foreground'>
                                {links.map((link) => (
                                    <li key={link.text}>
                                        <Link
                                            href={link.href}
                                            target={link.external ? '_blank' : undefined}
                                            rel={link.external ? 'noopener noreferrer' : undefined}
                                            className='hover:text-foreground transition-colors'
                                        >
                                            {link.text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className='border-t pt-8 text-center'>
                    <p className='text-sm text-muted-foreground'>
                        &copy; {new Date().getFullYear()} {appName}. Open source software licensed under MIT.
                    </p>
                </div>
            </div>
        </footer>
    );
};
