import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../app/store/store';
import { defineElement } from '../helpers/defineElement';
import { propertySets } from '../helpers/propertyPresets';
import type { RenderProps } from '../ElementManager';
import type { ActiveAlarm } from '../../app/store/alarmsSlice';
import { sortTable } from '../helpers/sortTable';
import { acknowledgeAlarmsBatch } from '../../shared/api/alarmConfigApi';

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
    type: 'live_alarm',
    label: 'Live Alarm',
    kind: 'html',
    category: 'Media', // Categorized as Media to appear alongside other visual components

    defaults: {
        width: 600,
        height: 300,
        rowCount: 5,
        enableAcknowledge: false,
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        borderRadius: 8,
        headerBackgroundColor: '#041525ff',
        headerFontColor: '#ffffff',
        colorI: '#22c55e',
        colorIA: '#3b82f6',
        colorIO: '#ef4444',
        colorIOA: '#9333ea',
        colorIAO: '#f97316',
    },

    properties: propertySets.liveAlarm(),


    Render: (props: RenderProps) => {
        const {
            width,
            height,
            rowCount,
            color,
            borderColor,
            borderWidth,
            borderRadius,
            alarms,
            enableAcknowledge,
            headerBackgroundColor,
            headerFontColor,
            colorI,
            colorIA,
            colorIO,
            colorIOA,
            colorIAO,
        } = props;

        const isAckEnabled = enableAcknowledge === true || Number(enableAcknowledge) === 1;

        const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
        const readingVariables = useSelector((state: RootState) => state.variables.reading.byId);

        const effectiveRowCount = rowCount ?? 5;

        // Filter out IOA and IAO types for Live Alarm display
        const filteredAlarms = (alarms || []).filter(a => a.type !== 'IOA' && a.type !== 'IAO');

        const sortedAlarms = sortTable(
            filteredAlarms,
            sortColumn as keyof typeof filteredAlarms[0] | null,
            sortDirection
        );

        const displayAlarms = sortedAlarms.slice(0, effectiveRowCount);
        const validAlarmIds = displayAlarms.map(a => a.id);

        const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.checked) {
                setSelectedIds(new Set(validAlarmIds));
            } else {
                setSelectedIds(new Set());
            }
        };

        const handleSelectRow = (id: string) => {
            const next = new Set(selectedIds);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            setSelectedIds(next);
        };

        // Fill the rest with nulls if we need more rows to satisfy rowCount
        const rows: (ActiveAlarm | null)[] = [...displayAlarms];
        if (effectiveRowCount === 0 && rows.length === 0) {
            rows.push(null);
        } else {
            while (rows.length < effectiveRowCount) {
                rows.push(null);
            }
        }


        return (
            <div
                style={{
                    width: width ?? 600,
                    height: height ?? 300,
                    backgroundColor: color ?? '#ffffff',
                    border: `${borderWidth ?? 1}px solid ${borderColor ?? '#e5e7eb'}`,
                    borderRadius: borderRadius ?? 8,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    fontFamily: 'Inter, system-ui, sans-serif',
                }}
            >
                {/* Acknowledge Button Toolbar */}
                {isAckEnabled && (
                    <div style={{
                        padding: '8px 12px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        background: '#f9fafb',
                        borderBottom: '1px solid #e5e7eb'
                    }}>
                        <button
                            onClick={async () => {
                                const ids = Array.from(selectedIds);
                                try {
                                    const response = await acknowledgeAlarmsBatch(ids);
                                    if (response.success) {

                                        setSelectedIds(new Set());
                                    } else {
                                        console.error('Batch Acknowledgment Failed:', response.message);
                                    }
                                } catch (err) {
                                    console.error('Batch Acknowledgment Error:', err);
                                }
                            }}
                            disabled={selectedIds.size === 0}
                            style={{
                                padding: '6px 16px',
                                backgroundColor: selectedIds.size > 0 ? '#3b82f6' : '#9ca3af',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: selectedIds.size > 0 ? 'pointer' : 'not-allowed',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                if (selectedIds.size > 0) e.currentTarget.style.backgroundColor = '#2563eb';
                            }}
                            onMouseLeave={(e) => {
                                if (selectedIds.size > 0) e.currentTarget.style.backgroundColor = '#3b82f6';
                            }}
                        >
                            Acknowledge ({selectedIds.size})
                        </button>
                    </div>
                )}

                {/* Table Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isAckEnabled ? '40px 60px 160px 1fr 120px 160px' : '60px 160px 1fr 120px 160px',
                    background: headerBackgroundColor ?? '#041525ff',
                    borderBottom: '1px solid #e5e7eb',
                    padding: '4px 4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: headerFontColor ?? '#ffffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    alignItems: 'center',
                    height: '15px'
                }}>
                    {isAckEnabled && (
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <input
                                type="checkbox"
                                checked={displayAlarms.length > 0 && selectedIds.size === displayAlarms.length}
                                onChange={handleSelectAll}
                                style={{ cursor: 'pointer' }}
                            />
                        </div>
                    )}

                    <div style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => handleSort('id')}>
                        ID {sortColumn === 'id' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </div>

                    <div style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => handleSort('variableName')}>
                        Variable {sortColumn === 'variableName' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
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

                {/* Table Body */}
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
                            <div key={i} style={{
                                display: 'grid',
                                gridTemplateColumns: isAckEnabled ? '40px 60px 160px 1fr 120px 160px' : '60px 160px 1fr 120px 160px',
                                borderBottom: '1px solid #f3f4f6',
                                padding: '4px 4px',
                                minHeight: '15px',
                                fontSize: '13px',
                                color: '#1f2937',
                                alignItems: 'center',
                                backgroundColor: !item ? 'transparent' :
                                    item.type === 'I' ? `${colorI ?? '#22c55e'}10` :
                                        item.type === 'IA' ? `${colorIA ?? '#3b82f6'}10` :
                                            item.type === 'IO' ? `${colorIO ?? '#ef4444'}10` :
                                                item.type === 'IOA' ? `${colorIOA ?? '#9333ea'}10` :
                                                    item.type === 'IAO' ? `${colorIAO ?? '#f97316'}10` : `${colorIO ?? '#ef4444'}10`
                            }}>
                                {isAckEnabled && (
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        {item && (
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(item.id)}
                                                onChange={() => handleSelectRow(item.id)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        )}
                                    </div>
                                )}
                                <div style={{ color: '#6b7280', textAlign: 'left' }}>{item ? safeStr(item.id) : ''}</div>
                                <div style={{ color: '#6b7280', textAlign: 'left' }}>
                                    {item ? (readingVariables[item.variableId || '']?.name || safeStr(item.variableId)) : ''}
                                </div>
                                <div style={{ fontWeight: 500, textAlign: 'left' }}>{item ? safeStr(item.name) : ''}</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    {item ? (
                                        <>
                                            <span style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background:
                                                    item.type === 'I' ? (colorI ?? '#22c55e') :
                                                        item.type === 'IA' ? (colorIA ?? '#3b82f6') :
                                                            item.type === 'IO' ? (colorIO ?? '#ef4444') :
                                                                item.type === 'IOA' ? (colorIOA ?? '#9333ea') :
                                                                    item.type === 'IAO' ? (colorIAO ?? '#f97316') : (colorIO ?? '#ef4444')
                                            }} />
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                paddingBottom: '3px',
                                                background:
                                                    item.type === 'I' ? `${colorI ?? '#22c55e'}20` :
                                                        item.type === 'IA' ? `${colorIA ?? '#3b82f6'}20` :
                                                            item.type === 'IO' ? `${colorIO ?? '#ef4444'}20` :
                                                                item.type === 'IOA' ? `${colorIOA ?? '#9333ea'}20` :
                                                                    item.type === 'IAO' ? `${colorIAO ?? '#f97316'}20` : `${colorIO ?? '#ef4444'}20`,
                                                color:
                                                    item.type === 'I' ? (colorI ?? '#22c55e') :
                                                        item.type === 'IA' ? (colorIA ?? '#3b82f6') :
                                                            item.type === 'IO' ? (colorIO ?? '#ef4444') :
                                                                item.type === 'IOA' ? (colorIOA ?? '#9333ea') :
                                                                    item.type === 'IAO' ? (colorIAO ?? '#f97316') : (colorIO ?? '#ef4444'),
                                                fontSize: '11px',
                                                fontWeight: 600
                                            }}>
                                                {item.type}
                                            </span>
                                        </>
                                    ) : ''}
                                </div>
                                <div style={{ color: '#6b7280', textAlign: 'left' }}>{item ? `${safeStr(item.date)} ${safeStr(item.time)}` : ''}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    },
});

export const LiveAlarmElement = element;
