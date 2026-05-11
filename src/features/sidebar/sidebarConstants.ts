import React from 'react';

import {
    BasicsIcon,
    EquipmentsIcon,
    ChartsIcon,
    UserIcon,
    SettingsIcon,
    LogoutIcon,
    NewFileIcon,
    SaveIcon,
    FolderIcon,
    UploadIcon,
    DownloadIcon,
    BuildIcon,
    SearchIcon,
    ButtonIcon,
    TextIcon,
    InputIcon,
    CardIcon,
    FrameIcon,
    ImageIcon,
    LineChartIcon,
    BarChartIcon,
    PieChartIcon,
    HistoricalChartIcon,
    PanelCollapseIcon,
    PanelExpandIcon,
    KeyboardIcon,
} from '../../shared/icons';

export const SPACING = {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '16px',
    xl: '24px',
} as const;

export const COLORS = {
    border: '#e5e7eb',
    borderLight: '#cbd5e1',
    hover: '#f9fafb',
    hoverDark: '#f1f5f9',
    text: '#1e293b',
    textMuted: '#475569',
    textLight: '#64748b',
    textExtraLight: '#94a3b8',
    bgSubGroup: '#fafafa',
} as const;

export const FONT_SIZES = {
    xs: '9px',
    sm: '10px',
    md: '12px',
    base: '13px',
    lg: '16px',
    xl: '18px',
} as const;

export const SVG_ICONS = {
    basics: React.createElement(BasicsIcon),
    equipments: React.createElement(EquipmentsIcon),
    charts: React.createElement(ChartsIcon),
    user: React.createElement(UserIcon),
    settings: React.createElement(SettingsIcon),
    logout: React.createElement(LogoutIcon),
    newFile: React.createElement(NewFileIcon),
    save: React.createElement(SaveIcon),
    folder: React.createElement(FolderIcon),
    upload: React.createElement(UploadIcon),
    download: React.createElement(DownloadIcon),
    build: React.createElement(BuildIcon),
    search: React.createElement(SearchIcon),
    button: React.createElement(ButtonIcon),
    text: React.createElement(TextIcon),
    input: React.createElement(InputIcon),
    card: React.createElement(CardIcon),
    frame: React.createElement(FrameIcon),
    image: React.createElement(ImageIcon),
    lineChart: React.createElement(LineChartIcon),
    barChart: React.createElement(BarChartIcon),
    pieChart: React.createElement(PieChartIcon),
    historicalChart: React.createElement(HistoricalChartIcon),
    panelCollapse: React.createElement(PanelCollapseIcon),
    panelExpand: React.createElement(PanelExpandIcon),
    keyboard: React.createElement(KeyboardIcon),
} as const;

export const ICON_MAP: Record<string, React.ReactElement> = {
    'button': SVG_ICONS.button,
    'text': SVG_ICONS.text,
    'input': SVG_ICONS.input,
    'card': SVG_ICONS.card,
    'frame': SVG_ICONS.frame,
    'image': SVG_ICONS.image,
    'line_chart': SVG_ICONS.lineChart,
    'bar_chart': SVG_ICONS.barChart,
    'pie_chart': SVG_ICONS.pieChart,
    'historical_line_chart': SVG_ICONS.historicalChart,
};

export const TREE_LINE_STYLE: React.CSSProperties = {
    position: 'absolute',
    left: '12px',
    width: '1px',
    backgroundColor: COLORS.borderLight,
} as const;
