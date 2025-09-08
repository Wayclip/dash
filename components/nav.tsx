import { Github, Menu } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { ThemeToggle } from './toggle';

export const Navbar = () => {
    return (
        <header
            className='fixed top-0 left-0 z-40 w-full h-14 backdrop-blur-lg border-b bg-secondary/20 transition-colors'
            aria-label='Main Navigation'
        >
            <nav className='flex items-center w-full h-full px-4 mx-auto max-w-7xl'>
                <Link href='/' className='inline-flex items-center gap-2.5 font-semibold mr-4'>
                    Wayclip
                </Link>

                <ul className='items-center hidden gap-2 sm:flex'>
                    <li>
                        <Link
                            href='/dash'
                            aria-label='Dashboard'
                            className='p-2 text-sm text-muted-foreground transition-colors hover:text-accent-foreground'
                        >
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <a
                            href='https://wayclip.com/docs'
                            target='_blank'
                            rel='noopener noreferrer'
                            aria-label='Docs'
                            className='p-2 text-sm text-muted-foreground transition-colors hover:text-accent-foreground'
                        >
                            Docs
                        </a>
                    </li>
                </ul>

                <div className='items-center hidden flex-1 justify-end gap-1.5 lg:flex'>
                    <ThemeToggle />

                    <Button size='icon' variant='ghost' asChild>
                        <a
                            href='https://github.com/konyogony/wayclip'
                            target='_blank'
                            rel='noopener noreferrer'
                            aria-label='GitHub'
                        >
                            <Github className='size-5' />
                        </a>
                    </Button>
                </div>

                <div className='flex items-center ml-auto lg:hidden'>
                    <Button size='icon' variant='ghost' aria-label='Toggle Menu'>
                        <Menu className='size-5' />
                    </Button>
                </div>
            </nav>
        </header>
    );
};
