import React, { useState, useEffect } from 'react';
import { fetchFreezeConfigurations } from '../../../shared/api/freezeConfigApi';
import type { FreezeConfigDTO, TimeWindowDTO } from '../../../shared/types/freeze.types';
import { ScheduleEditModal } from '../components/ScheduleEditModal';
import styles from '../settings.module.css';

export const SchedulesPage: React.FC = () => {
    const [configs, setConfigs] = useState<FreezeConfigDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit Modal State
    const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchFreezeConfigurations();
            if (response.success && response.data) {
                // Handle both { configs: [...] } and direct array responses
                if (Array.isArray(response.data)) {
                    setConfigs(response.data as FreezeConfigDTO[]);
                } else if (response.data.configs && Array.isArray(response.data.configs)) {
                    setConfigs(response.data.configs);
                } else {
                    setConfigs([]);
                }
            } else {
                setError(response.message || 'Failed to load schedules');
            }
        } catch (err) {
            console.error('Error fetching schedules:', err);
            setError('An error occurred while fetching schedules');
        } finally {
            setIsLoading(false);
        }
    };

    const getDayName = (day: number) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[day % 7];
    };

    const formatTimeWindows = (windows: TimeWindowDTO[]) => {
        if (!windows || windows.length === 0) return 'No time windows';
        return windows.map(w => 
            `${getDayName(w.dayOfWeek)}: ${w.startTime.substring(0, 5)} - ${w.endTime.substring(0, 5)}`
        ).join(' | ');
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerSection}>
                <div>
                    <h1 className={styles.title}>Schedules</h1>
                    <p className={styles.subtitle}>Monitor and manage automated time-based configurations across all systems.</p>
                </div>
            </div>

            <div className={styles.card}>
                {isLoading ? (
                    <div className={styles.loading}>
                        <div className="spinner"></div>
                        <p className={styles.loadingText}>Fetching schedules...</p>
                    </div>
                ) : error ? (
                    <div className={styles.error}>
                        <span className={styles.errorIcon}>&#9888;&#65039;</span>
                        <p>{error}</p>
                        <button onClick={loadConfigs} className={styles.retryBtn}>Retry</button>
                    </div>
                ) : configs.length > 0 ? (
                    <div style={{ overflowX: 'auto', width: '100%' }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Schedule Name</th>
                                    <th className={styles.th}>Config ID</th>
                                    <th className={styles.th}>Time Windows</th>
                                    <th className={styles.th}>Variables</th>
                                    <th className={styles.th}>Status</th>
                                    <th className={`${styles.th} ${styles.thRight}`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {configs.map(config => (
                                    <tr key={config.id} className={styles.tr}>
                                        <td className={styles.td}>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{config.name}</div>
                                        </td>
                                        <td className={styles.td}>
                                            <code className={styles.code}>{config.globalConfigId}</code>
                                        </td>
                                        <td className={styles.td}>
                                            <div className={styles.windowBadge}>
                                                {formatTimeWindows(config.timeWindows)}
                                            </div>
                                        </td>
                                        <td className={styles.td}>
                                            <span className={styles.varCount}>
                                                {config.variables?.length || 0} vars
                                            </span>
                                        </td>
                                        <td className={styles.td}>
                                            <span className={`${styles.badge} ${config.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                                                {config.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className={styles.td} style={{ textAlign: 'right' }}>
                                            <button 
                                                onClick={() => setEditingScheduleId(config.id)}
                                                className={styles.editBtn}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>
                            <span>&#128197;</span>
                        </div>
                        <h3 className={styles.emptyTitle}>No schedules found</h3>
                        <p className={styles.emptySubtitle}>
                            System schedules will appear here once they are configured in the Global Configuration settings.
                        </p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingScheduleId && (
                <ScheduleEditModal
                    scheduleId={editingScheduleId}
                    onClose={() => setEditingScheduleId(null)}
                    onSaveSuccess={() => {
                        setEditingScheduleId(null);
                        loadConfigs();
                    }}
                />
            )}
        </div>
    );
};

export default SchedulesPage;
