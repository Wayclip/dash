'use client';

import { cva } from 'class-variance-authority';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { type HTMLAttributes, useLayoutEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const itemVariants = cva(
    'inline-flex items-center justify-center rounded-full size-7 p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    {
        variants: {
            active: {
                true: 'bg-accent text-accent-foreground',
                false: 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
            },
        },
    },
);

const themeOptions = [
    { name: 'light', icon: Sun },
    { name: 'dark', icon: Moon },
] as const;

export function ThemeToggle({ className, ...props }: HTMLAttributes<HTMLElement>) {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useLayoutEffect(() => {
        setMounted(true);
    }, []);

    const activeTheme = mounted ? theme : null;

    return (
        <div
            className={cn('inline-flex items-center rounded-full border bg-background p-1', className)}
            aria-label='Theme toggle'
            {...props}
        >
            {themeOptions.map(({ name, icon: Icon }) => (
                <button
                    key={name}
                    type='button'
                    aria-label={`Switch to ${name} mode`}
                    className={cn(itemVariants({ active: activeTheme === name }))}
                    onClick={() => setTheme(name)}
                >
                    <Icon className='size-full' />
                </button>
            ))}
        </div>
    );
}
