import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

/**
 * Custom hook to initialize and manage an ECharts instance.
 * Automatically handles window resizing and container resizing via ResizeObserver.
 */
export function useECharts() {
    const ref = useRef<HTMLDivElement>(null);
    const chartRef = useRef<echarts.EChartsType | null>(null);
    const roRef = useRef<ResizeObserver | null>(null);

    useEffect(() => {
        if (!ref.current) return;

        // Initialize the ECharts instance
        const chart = echarts.init(ref.current);
        chartRef.current = chart;

        // Resize handler
        const handleResize = () => {
            chart.resize();
        };

        // Listen for window resize
        window.addEventListener('resize', handleResize);

        // Listen for container resize
        if (ref.current && 'ResizeObserver' in window) {
            roRef.current = new ResizeObserver(() => {
                chart.resize();
            });
            roRef.current.observe(ref.current);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (roRef.current && ref.current) {
                try {
                    roRef.current.unobserve(ref.current);
                } catch { /* ignore */ }
            }
            chart.dispose();
            chartRef.current = null;
        };
    }, []);

    const setOption = (option: echarts.EChartsOption, notMerge: boolean = false) => {
        if (chartRef.current) {
            chartRef.current.setOption(option, notMerge);
        }
    };

    const resize = () => {
        if (chartRef.current) {
            chartRef.current.resize();
        }
    };

    return { ref, chartRef, setOption, resize };
}
