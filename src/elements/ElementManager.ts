import type { CSSProperties, ReactNode } from 'react';
import { LiveAlarmElement } from './html/LiveAlarm.element';
import { HistoryAlarmElement } from './html/HistoryAlarm.element';
import type { ActiveAlarm } from '../app/store/alarmsSlice';

export type ElementKind = 'html' | 'svg' | 'canvas';

export type ShapeConfig = {
  index: number;
  color?: string;
  valueVarName?: string;
  valueThreshold?: number;
  color0?: string;
  color1?: string;
  colors?: string[];
  colorsBlink?: boolean[];
  visibleVarName?: string;
  visibilityThreshold?: number;
  reverseVisibility?: boolean;
  onClickActionName?: string;
  onClickActionArgs?: Record<string, unknown>;
  onDoubleClickActionName?: string;
  onDoubleClickActionArgs?: Record<string, unknown>;
};

export interface BaseItem {
  id: string;
  label: string;
  x: number;
  y: number;
  width?: number; // defaulted in logic usually
  height?: number;
  zIndex?: number;
  access_id?: string;
  renderer?: ElementKind;

  // Transform
  flipH?: boolean;
  flipV?: boolean;
  rotation?: number; // degrees

  // Logic (Common)
  visibleVarName?: string;
  visibleVar?: number;
  visibilityThreshold?: number;
  reverseVisibility?: boolean;
  animateVisibility?: boolean;

  // Actions (Common)
  onClickActionName?: string;
  onClickActionArgs?: Record<string, unknown>;
  onDoubleClickActionName?: string;
  onDoubleClickActionArgs?: Record<string, unknown>;
  onBlurActionName?: string;
  onBlurActionArgs?: Record<string, unknown>;
  onChangeActionName?: string;
  onChangeActionArgs?: Record<string, unknown>;
  rowCount?: number;

  // Global Element
  isGlobal?: boolean;
  parentPageName?: string;
}

export interface StylingProps {
  color?: string;
  color0?: string;
  color1?: string;
  valueColors?: string[];
  valueColorBlinks?: boolean[];
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderRadius?: number;
}

export interface TextProps {
  text?: string;
  fontSize?: number;
  fontColor?: string;
  placeholder?: string;
}

export interface ValueProps {
  valueVar?: number;
  valueVarName?: string;
  valueThreshold?: number;
  animateValue?: boolean;
  valueRange?: { min: number; max: number };
}

// ===================================================================
// Element Interfaces (Improved for Decentralization)
// ===================================================================

/**
 * The core data structure for any element in the system.
 * All element-specific properties are declared explicitly here.
 */
export interface Item extends BaseItem, StylingProps, TextProps, ValueProps {
  type: string;

  // Chart properties
  seriesColors?: string[];
  seriesVarNames?: string[];
  timeWindowSeconds?: number;
  startTime?: number;
  endTime?: number;
  defaultTimeRange?: 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom' | 'recent_hour';

  // SVG properties
  shapeConfigs?: ShapeConfig[];

  // Media properties
  src?: string;

  // Dynamic badge properties
  dynamicBgColors?: string[];
  dynamicTextColors?: string[];
  dynamicTexts?: string[];

  // Variable binding
  textVarName?: string;
  writingVarName?: string;
  writingVarId?: string;

  // Modal properties
  modalName?: string;
  modalPostfix?: string;

  // Alarm element properties
  enableAcknowledge?: boolean;
  headerBackgroundColor?: string;
  headerFontColor?: string;
  bodyBackgroundColor?: string;
  colorI?: string;
  colorIO?: string;
  colorIA?: string;
  colorIOA?: string;
  colorIAO?: string;

  // Chart display properties
  showLabel?: boolean;
  maxValue?: number;
  minValue?: number;
  innerRadius?: number;
  chartAngle?: number;
  barThickness?: number;
  maxPoints?: number;
  pieLabelFields?: string[];

  // Internal/runtime markers
  _missingVariableWarning?: string;

  // Extensible element-specific properties
  [key: string]: unknown;
}

// Keep the specific interfaces for documentation and legacy usage if needed,
// but they are now considered subsets of the generic Item.
export interface GeometryItem extends Item { type: "frame" | "button" | "card" | "input" | "text" | "image" | "modal_window"; }
export interface MediaItem extends Item { type: "image"; src?: string; }
export interface FormItem extends Item { type: "input" | "button" | "text"; }
export interface ShapeItem extends Item { type: "star" | "circle" | "square" | "spinner" | "line" | "arrow" | "polygon"; shapeConfigs?: ShapeConfig[]; }
export interface ChartItem extends Item {
  type: "line_chart" | "bar_chart" | "pie_chart" | "stacked_bar_demo" | "historical_line_chart" | "consumption_bar_chart";
  seriesColors?: string[];
  seriesVarNames?: string[];
  timeWindowSeconds?: number;
  startTime?: number;
  endTime?: number;
  defaultTimeRange?: 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom' | 'recent_hour';
}


/**
 * Props passed to the render function of an element.
 * Generalizes properties so that new elements can receive their specific data
 * without having to add it to this file.
 */
export interface RenderProps extends StylingProps, TextProps, ValueProps {
  type: string;
  renderer?: ElementKind;
  access_id?: string;
  width?: number;
  height?: number;
  style?: CSSProperties;

  // Action Handlers
  onClickActionName?: string;
  onClickActionArgs?: Record<string, unknown>;
  onChangeActionName?: string;
  onChangeActionArgs?: Record<string, unknown>;
  onBlurActionName?: string;
  onBlurActionArgs?: Record<string, unknown>;

  // Layout
  rowCount?: number;
  designWidth?: number;
  designHeight?: number;

  // Studio Context
  isDesignMode?: boolean;
  prefix?: string;
  item_id?: string;
  onUpdate?: (id: string, updates: Partial<Item>) => void;
  openModalTitle?: string;

  // Alarms / Global State
  alarms?: ActiveAlarm[];

  // Chart properties
  seriesColors?: string[];
  seriesVarNames?: string[];
  timeWindowSeconds?: number;
  startTime?: number;
  endTime?: number;
  defaultTimeRange?: 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom' | 'recent_hour';
  showLabel?: boolean;
  maxValue?: number;
  minValue?: number;
  innerRadius?: number;
  chartAngle?: number;
  barThickness?: number;
  maxPoints?: number;
  pieLabelFields?: string[];

  // Dynamic badge properties
  dynamicBgColors?: string[];
  dynamicTextColors?: string[];
  dynamicTexts?: string[];

  // Variable binding
  textVarName?: string;
  writingVarName?: string;
  writingVarId?: string;

  // Alarm element properties
  enableAcknowledge?: boolean;
  headerBackgroundColor?: string;
  headerFontColor?: string;
  bodyBackgroundColor?: string;
  colorI?: string;
  colorIO?: string;
  colorIA?: string;
  colorIOA?: string;
  colorIAO?: string;

  // Modal properties
  modalName?: string;

  // SVG properties
  shapeConfigs?: ShapeConfig[];

  // Media properties
  src?: string;

  // Extensible element-specific properties
  [key: string]: unknown;
}

export interface ManagedElementDef {
  type: Item['type'];
  label: string;
  kind: ElementKind;
  iconType?: string;
  defaults: Partial<Item>;
  properties: Array<{ key: keyof Item | string; label: string; type: 'text' | 'number' | 'color' | 'image-src' | 'select' | 'boolean'; options?: (string | { label: string; value: string | number | boolean })[] }>;
  group?: string;
  Render: (props: RenderProps) => ReactNode;
}

class Manager {
  private map = new Map<Item['type'], ManagedElementDef>();

  register(def: ManagedElementDef) {
    this.map.set(def.type, def);
  }

  get(type: Item['type']) {
    return this.map.get(type);
  }

  listByKind(kind: ElementKind) {
    return Array.from(this.map.values()).filter((d) => d.kind === kind);
  }
}

export const ElementManager = new Manager();

// Register built-in elements
ElementManager.register(LiveAlarmElement);
ElementManager.register(HistoryAlarmElement);
