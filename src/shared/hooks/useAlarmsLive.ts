import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { io } from "socket.io-client";
import { setAlarms, upsertAlarm, removeAlarm, type ActiveAlarm } from '../../app/store/alarmsSlice';
import { fetchActiveAlarms } from '../api/alarmConfigApi';

interface AlarmSocketPayload {
    id: string;
    alarmId?: string;
    variableId?: string;
    readingVariableId?: number;
    name?: string;
    type?: string;
    status?: string;
    date?: string;
    time?: string;
    startTime?: string;
    alarm?: { name?: string };
}

function parseAlarmPayloads(data: unknown): ActiveAlarm[] {
    const raw = data as Record<string, unknown>;
    const alarmsArray: AlarmSocketPayload[] = Array.isArray(data)
        ? data as AlarmSocketPayload[]
        : (Array.isArray(raw.alarms) ? raw.alarms as AlarmSocketPayload[] : []);

    return alarmsArray
        .filter((a) => a.type !== 'IOA' && a.type !== 'IAO' && a.status !== 'CLEARED')
        .map((a) => ({
            id: a.alarmId || a.id,
            variableId: a.variableId || a.readingVariableId?.toString(),
            name: a.name || a.alarm?.name || 'Unknown',
            type: a.type || (a.status === 'ACTIVE' ? 'I' : a.status === 'ACKNOWLEDGED' ? 'IA' : 'I'),
            date: a.date || (a.startTime ? new Date(a.startTime).toLocaleDateString() : new Date().toLocaleDateString()),
            time: a.time || (a.startTime ? new Date(a.startTime).toLocaleTimeString() : new Date().toLocaleTimeString())
        }));
}

export function useAlarmsLive(wsUrl?: string) {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!wsUrl) return;

        fetchActiveAlarms().then(response => {
            if (!response.success || !response.data) return;
            dispatch(setAlarms(parseAlarmPayloads(response.data)));
        }).catch(() => { /* initial alarm fetch failed */ });

        const token = localStorage.getItem('accessToken');

        let connectionUrl = wsUrl;
        if (connectionUrl.startsWith('ws://')) {
            connectionUrl = connectionUrl.replace('ws://', 'http://');
        } else if (connectionUrl.startsWith('wss://')) {
            connectionUrl = connectionUrl.replace('wss://', 'https://');
        }

        const alarmSocketUrl = connectionUrl.endsWith('/') ? `${connectionUrl}alarms` : `${connectionUrl}/alarms`;

        const socket = io(alarmSocketUrl, {
            auth: {
                token: token
            },
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 30000,
        });

        socket.on('connect', () => {
            fetchActiveAlarms().then(response => {
                if (!response.success || !response.data) return;
                dispatch(setAlarms(parseAlarmPayloads(response.data)));
            }).catch(() => { /* reconnect alarm fetch failed */ });
        });

        socket.on('connect_error', () => {
            // alarm socket connection error
        });

        socket.on('alarm_triggered', (data: AlarmSocketPayload) => {
            dispatch(upsertAlarm({
                id: data.alarmId || data.id,
                variableId: data.variableId,
                name: data.name || 'Unknown',
                type: data.type || 'I',
                date: data.date || new Date().toLocaleDateString(),
                time: data.time || new Date().toLocaleTimeString()
            }));
        });

        socket.on('alarm_acknowledged', (data: AlarmSocketPayload) => {
            const type = data.type || 'IA';
            const id = data.alarmId || data.id;
            if (type === 'IOA') {
                dispatch(removeAlarm(id));
            } else {
                dispatch(upsertAlarm({
                    id,
                    variableId: data.variableId,
                    name: data.name || 'Unknown',
                    type,
                    date: data.date || new Date().toLocaleDateString(),
                    time: data.time || new Date().toLocaleTimeString()
                }));
            }
        });

        socket.on('alarm_cleared', (data: AlarmSocketPayload) => {
            const type = data.type || 'IO';
            const id = data.alarmId || data.id;
            if (type === 'IAO') {
                dispatch(removeAlarm(id));
            } else {
                dispatch(upsertAlarm({
                    id,
                    variableId: data.variableId,
                    name: data.name || 'Unknown',
                    type,
                    date: data.date || new Date().toLocaleDateString(),
                    time: data.time || new Date().toLocaleTimeString()
                }));
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [dispatch, wsUrl]);
}
