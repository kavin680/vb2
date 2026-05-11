import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../app/store/store';
import { defineElement } from '../helpers/defineElement';
import { propertySets } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';
import { fetchAlarmHistory, exportAlarmHistory } from '../../shared/api/alarmConfigApi';
import { sortTable } from '../helpers/sortTable';

interface AlarmHistoryRow {
    id: string;
    name: string;
    type: string;
    date: string;
    time: string;
    variableId?: string;
}

let sortColumn: string | null = null;
let sortDirection: 'asc' | 'desc' = 'asc';

function handleSort(column: string) {


    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
}

export const element = defineElement({
    type: 'history_alarm',
    label: 'History Alarm',
    kind: 'html',
    category: 'Media',

    defaults: {
        width: 800,
        height: 500,
        rowCount: 0,
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        borderRadius: 8,
        headerBackgroundColor: '#041525ff',
        headerFontColor: '#ffffffff',
        colorI: '#22c55e',
        colorIA: '#3b82f6',
        colorIO: '#ef4444',
        colorIOA: '#9333ea',
        colorIAO: '#f97316',
    },

    properties: propertySets.historyAlarm(),

    Render: (props: RenderProps) => {
        const {
            width,
            height,
            rowCount,
            color,
            borderColor,
            borderWidth,
            borderRadius,
            isDesignMode,
            defaultTimeRange,
            headerBackgroundColor,
            headerFontColor,
            colorI,
            colorIA,
            colorIO,
            colorIOA,
            colorIAO,
        } = props;

        const readingVariables = useSelector((state: RootState) => state.variables.reading.byId);

        const effectiveRowCount = rowCount || 0;
        const pageSize = effectiveRowCount || 10;
        const [data, setData] = useState<AlarmHistoryRow[]>([]);
        const [page, setPage] = useState(1);
        const [_total, setTotal] = useState(0);
        const [totalPages, setTotalPages] = useState(1);
        const [loading, setLoading] = useState(false);
        const [_error, setError] = useState<string | null>(null);
        const [isExporting, setIsExporting] = useState(false);
        const [alarmFilter, setAlarmFilter] = useState('');

        const handleExport = async () => {
            setIsExporting(true);
            const startIso = new Date(dates.start).toISOString();
            const endIso = new Date(dates.end).toISOString();
            try {
                const res = await exportAlarmHistory({
                    startDate: startIso,
                    endDate: endIso,
                    alarmName: alarmFilter || undefined
                });
                if (res.success && res.blob) {
                    const url = window.URL.createObjectURL(res.blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `alarm_history_export_${startIso.split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode?.removeChild(link);
                    window.URL.revokeObjectURL(url);
                } else {
                    console.error('[HistoryAlarm] Failed to export data:', res.message);
                }
            } catch (error) {
                console.error('[HistoryAlarm] Error exporting data:', error);
            } finally {
                setIsExporting(false);
            }
        };

        // Format to YYYY-MM-DDTHH:mm for datetime-local
        const toLocalISO = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

        // Date range state - defaults to today if no defaultTimeRange or calculation fails
        const [dates, setDates] = useState(() => {
            const now = new Date();
            let start: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

            if (defaultTimeRange && defaultTimeRange !== 'custom') {
                switch (defaultTimeRange) {
                    case 'today':
                        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                        break;
                    case 'this_week':
                        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay(), 0, 0, 0);
                        break;
                    case 'this_month':
                        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
                        break;
                    case 'this_year':
                        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
                        break;
                    case 'recent_hour':
                    default:
                        start = new Date(now.getTime() - 3600 * 1000);
                        end = now;
                        break;
                }
            }
            return {
                start: toLocalISO(start),
                end: toLocalISO(end)
            };
        });

        const loadHistory = async (p: number) => {
            setLoading(true);
            setError(null);
            try {
                // Backend expects ISO-8601. Convert local datetime-local string to UTC ISO.
                const startIso = new Date(dates.start).toISOString();
                const endIso = new Date(dates.end).toISOString();

                const res = await fetchAlarmHistory({
                    startDate: startIso,
                    endDate: endIso,
                    alarmName: alarmFilter || undefined,
                    page: p,
                    limit: pageSize
                });

                if (res.success && res.data) {
                    setData((res.data.records || []) as unknown as AlarmHistoryRow[]);
                    setTotal(res.data.total || 0);
                    setTotalPages(res.data.totalPages || 1);
                } else {
                    setData([]);
                    setTotal(0);
                    setTotalPages(1);
                    setError(res.message || 'Failed to load history');
                }

                setPage(p);
            } catch (err) {
                setError('Failed to load history');
                console.error(err);

                // Fallback to mock data if API fails and we are in design mode
                if (isDesignMode && data.length === 0) {
                    setData(Array.from({ length: Math.min(5, pageSize) }).map((_, i) => ({
                        id: String(100 - i),
                        name: `Mock_Sensor_${i + 1}`,
                        type: i % 3 === 0 ? 'I' : i % 3 === 1 ? 'IA' : 'IO',
                        date: dates.start,
                        time: `11:22:3${i}`
                    })));
                }
            } finally {
                setLoading(false);
            }
        };

        // Sync dates with defaultTimeRange property
        useEffect(() => {
            if (defaultTimeRange && defaultTimeRange !== 'custom') {
                const now = new Date();
                let start: Date;
                let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

                switch (defaultTimeRange) {
                    case 'today':
                        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                        break;
                    case 'this_week':
                        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay(), 0, 0, 0);
                        break;
                    case 'this_month':
                        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
                        break;
                    case 'this_year':
                        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
                        break;
                    case 'recent_hour':
                    default:
                        start = new Date(now.getTime() - 3600 * 1000);
                        end = now;
                        break;
                }

                const newStart = toLocalISO(start);
                const newEnd = toLocalISO(end);

                // Only update if actually different to avoid redundant re-renders and API calls
                if (newStart !== dates.start || newEnd !== dates.end) {
                    setDates({
                        start: newStart,
                        end: newEnd
                    });
                }
            }
        }, [defaultTimeRange]);

        useEffect(() => {
            loadHistory(1);
        }, [dates, pageSize, isDesignMode, alarmFilter]);

        const getStatusStyles = (type: string) => {
            switch (type) {
                case 'I': return { bg: `${colorI ?? '#22c55e'}20`, text: colorI ?? '#22c55e', dot: colorI ?? '#22c55e', rowBg: `${colorI ?? '#22c55e'}10` };
                case 'IA': return { bg: `${colorIA ?? '#3b82f6'}20`, text: colorIA ?? '#3b82f6', dot: colorIA ?? '#3b82f6', rowBg: `${colorIA ?? '#3b82f6'}10` };
                case 'IO': return { bg: `${colorIO ?? '#ef4444'}20`, text: colorIO ?? '#ef4444', dot: colorIO ?? '#ef4444', rowBg: `${colorIO ?? '#ef4444'}10` };
                case 'IOA': return { bg: `${colorIOA ?? '#9333ea'}20`, text: colorIOA ?? '#9333ea', dot: colorIOA ?? '#9333ea', rowBg: `${colorIOA ?? '#9333ea'}10` };
                case 'IAO': return { bg: `${colorIAO ?? '#f97316'}20`, text: colorIAO ?? '#f97316', dot: colorIAO ?? '#f97316', rowBg: `${colorIAO ?? '#f97316'}10` };
                default: return { bg: '#f3f4f6', text: '#1f2937', dot: '#6b7280', rowBg: 'transparent' };
            }
        };

        const sortedData = sortColumn
            ? sortTable(data, sortColumn as keyof AlarmHistoryRow, sortDirection)
            : data;

        const rows: (AlarmHistoryRow | null)[] = [...sortedData];
        if (effectiveRowCount === 0 && rows.length === 0) {
            rows.push(null);
        } else {
            while (rows.length < effectiveRowCount) {
                rows.push(null);
            }
        }


        return (
            <div style={{
                // ... (omitted for brevity, will use specific lines below)
                width: width ?? 800,
                height: height ?? 500,
                backgroundColor: color ?? '#ffffff',
                border: `${borderWidth ?? 1}px solid ${borderColor ?? '#e5e7eb'}`,
                borderRadius: borderRadius ?? 8,
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'Inter, system-ui, sans-serif',
                overflow: 'hidden'
            }}>
                {/* Controls */}
                <div style={{
                    padding: '12px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: headerBackgroundColor ?? '#041525ff',
                    fontSize: '13px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: headerFontColor ?? '#6b7280', fontWeight: 500 }}>From:</span>
                        <input
                            type="datetime-local"
                            value={dates.start}
                            onChange={(e) => setDates(d => ({ ...d, start: e.target.value }))}
                            style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: headerFontColor ?? '#6b7280', fontWeight: 500 }}>To:</span>
                        <input
                            type="datetime-local"
                            value={dates.end}
                            onChange={(e) => setDates(d => ({ ...d, end: e.target.value }))}
                            style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: headerFontColor ?? '#6b7280', fontWeight: 500 }}>Alarm Text:</span>
                        <input
                            type="text"
                            placeholder="Filter by text..."
                            value={alarmFilter}
                            onChange={(e) => setAlarmFilter(e.target.value)}
                            style={{
                                padding: '4px 8px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                width: '150px'
                            }}
                        />
                    </div>
                    {loading && <div style={{ color: '#6b7280', marginLeft: 'auto' }}>Loading...</div>}

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleExport();
                        }}
                        disabled={isExporting}
                        style={{
                            marginLeft: loading ? '10px' : 'auto',
                            padding: '4px 12px',
                            background: isExporting ? '#94a3b8' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isExporting ? 'not-allowed' : 'pointer',
                            fontWeight: 500
                        }}
                    >
                        {isExporting ? 'Exporting...' : 'Export'}
                    </button>
                </div>

                {/* Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 160px 1fr 120px 160px',
                    background: headerBackgroundColor ?? '#041525ff',
                    borderBottom: '1px solid #e5e7eb',
                    padding: '10px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: headerFontColor ?? '#ffffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}>
                    <div style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => handleSort('id')}>
                        ID {sortColumn === 'id' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </div>

                    <div style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => handleSort('name')}>
                        Variable {sortColumn === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </div>

                    <div style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => handleSort('name')}>
                        Alarm Text {sortColumn === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </div>

                    <div style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => handleSort('type')}>
                        Alarm Type {sortColumn === 'type' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </div>

                    <div style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => handleSort('time')}>
                        Time {sortColumn === 'time' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </div>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {rows.map((item, i) => {
                        const safeStr = (val: any) => {
                            if (val === null || val === undefined) return '';
                            if (typeof val === 'object') {
                                if (val.s !== undefined && val.e !== undefined && val.d !== undefined) {
                                    const sign = val.s === -1 ? '-' : '';
                                    const digits = Array.isArray(val.d) ? val.d.join('') : String(val.d);
                                    const exp = val.e;
                                    if (exp >= 0) {
                                        const integerPart = digits.slice(0, exp + 1).padEnd(exp + 1, '0');
                                        const fractionalPart = digits.slice(exp + 1);
                                        return fractionalPart ? `${sign}${integerPart}.${fractionalPart}` : `${sign}${integerPart}`;
                                    } else {
                                        const leadingZeros = '0'.repeat(Math.abs(exp) - 1);
                                        return `${sign}0.${leadingZeros}${digits}`;
                                    }
                                }
                                return JSON.stringify(val);
                            }
                            return String(val);
                        };
                        return (
                            <div key={item?.id || i} style={{
                                display: 'grid',
                                gridTemplateColumns: '60px 160px 1fr 120px 160px',
                                borderBottom: '1px solid #f3f4f6',
                                padding: '10px 12px',
                                minHeight: '15px',
                                fontSize: '13px',
                                color: '#1f2937',
                                backgroundColor: item ? getStatusStyles(item.type).rowBg : 'transparent'
                            }}>
                                <div style={{ color: '#6b7280', textAlign: 'left' }}>{item ? safeStr(item.id) : ''}</div>
                                <div style={{ color: '#6b7280', textAlign: 'left' }}>
                                    {item ? (readingVariables[item.variableId || '']?.name || safeStr(item.variableId)) : ''}
                                </div>
                                <div style={{ fontWeight: 500, textAlign: 'left' }}>{item ? safeStr(item.name) : ''}</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    {item && (
                                        <>
                                            <span style={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                background: getStatusStyles(item.type).dot
                                            }} />
                                            <span style={{
                                                padding: '2px 8px', borderRadius: '12px',
                                                background: getStatusStyles(item.type).bg,
                                                color: getStatusStyles(item.type).text,
                                                fontSize: '11px', fontWeight: 600
                                            }}>
                                                {item.type}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div style={{ color: '#6b7280', textAlign: 'left' }}>{item ? `${safeStr(item.date)} ${safeStr(item.time)}` : ''}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer / Pagination */}
                <div style={{
                    padding: '8px 12px',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f9fafb',
                    fontSize: '13px'
                }}>
                    <span style={{ color: '#6b7280' }}>
                        Page {page} / {totalPages}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            disabled={page === 1 || loading}
                            onClick={() => loadHistory(page - 1)}
                            style={{
                                padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: '4px',
                                background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer',
                                opacity: page === 1 ? 0.5 : 1
                            }}
                        >
                            Prev
                        </button>
                        <button
                            disabled={data.length < pageSize || loading}
                            onClick={() => loadHistory(page + 1)}
                            style={{
                                padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: '4px',
                                background: '#fff', cursor: data.length < pageSize ? 'not-allowed' : 'pointer',
                                opacity: data.length < pageSize ? 0.5 : 1
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        );
    }
});

export const HistoryAlarmElement = element;
