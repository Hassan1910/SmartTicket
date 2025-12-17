'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

export function EventSearch() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [query, setQuery] = useState(searchParams.get('query')?.toString() || '');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (query) {
                params.set('query', query);
            } else {
                params.delete('query');
            }
            
            // Only update if the query actually changed in the URL
            if (params.get('query') !== searchParams.get('query')) {
                replace(`${pathname}?${params.toString()}`);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, pathname, replace, searchParams]);

    return (
        <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                className="pl-10 bg-background"
                placeholder="Search events..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
    );
}
