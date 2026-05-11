export function sortTable<T>(
    data: T[],
    column: keyof T | null,
    direction: 'asc' | 'desc'
): T[] {

    if (!column) return data;

    return [...data].sort((a, b) => {

        const aValue = a[column];
        const bValue = b[column];

        if (aValue === bValue) return 0;

        if (direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        }

        return aValue < bValue ? 1 : -1;
    });

}