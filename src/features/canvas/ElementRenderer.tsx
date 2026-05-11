import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../app/store/store';
import { ElementManager, type Item, type RenderProps } from '../../elements';
import { selectOpenModalTitle } from '../../app/store/appConfigSlice';
import { APP_CONFIG } from '../../shared/config';

interface ElementRendererProps {
  item: Item;
  dispW: number;
  dispH: number;
  scaleX: number;
  effectiveColor?: string;
  draggable: boolean;
  prefix?: string;
  onUpdate?: (id: string, updates: Partial<Item>) => void;
}

const ElementRendererInner = ({
  item,
  dispW,
  dispH,
  scaleX,
  effectiveColor,
  draggable,
  prefix,
  onUpdate
}: ElementRendererProps) => {
  const openModalTitle = useSelector(selectOpenModalTitle);
  const alarms = useSelector((state: RootState) => 
    item.type === 'live_alarm' ? state.alarms.activeAlarms : undefined
  );

  const def = ElementManager.get(item.type);
  if (!def || typeof def.Render !== 'function') return null;

  const props: RenderProps = {
    access_id: item.access_id,
    type: item.type,
    width: dispW * scaleX,
    height: dispH * scaleX, // Use scaleX for height too if uniform scaling is intended, or scaleY? Canvas.tsx suggests scaleX=1, scaleY=1 but code uses scaleX.
    color: effectiveColor,
    renderer: item.renderer ?? 'html',
    onChangeActionName: item.onChangeActionName,
    onChangeActionArgs: item.onChangeActionArgs,
    onBlurActionName: item.onBlurActionName,
    onBlurActionArgs: item.onBlurActionArgs,
    designWidth: APP_CONFIG.DEFAULTS.DESIGN_RESOLUTION.WIDTH,
    designHeight: APP_CONFIG.DEFAULTS.DESIGN_RESOLUTION.HEIGHT,
    isDesignMode: draggable,
    prefix: prefix,
    item_id: item.id,
    onUpdate: onUpdate,
    openModalTitle: openModalTitle ?? undefined,
  };

  // Collect all properties to pass through
  const passThroughKeys = new Set<string>();

  // Add keys from element definition
  if (def.properties) {
    def.properties.forEach(field => passThroughKeys.add(field.key as string));
  }

  // Add other core keys that might not be in definition but are used in Item
  [
    'seriesColors', 'seriesVarNames', 'timeWindowSeconds', 'startTime', 'endTime',
    'text', 'valueVarName', 'fontColor', 'placeholder', 'src',
    'borderColor', 'borderWidth', 'borderStyle', 'borderRadius',
    'textVarName', 'dynamicBgColors', 'dynamicTextColors', 'dynamicTexts', 'rowCount'
  ].forEach(key => {
    if (key in item) passThroughKeys.add(key);
  });

  passThroughKeys.forEach(key => {
    if (key in item && (key !== 'color')) {
      let val = item[key];
      // Handle properties that need scaling
      if (key === 'fontSize' || key === 'borderWidth' || key === 'borderRadius') {
        const base = key === 'fontSize' ? (item.fontSize ?? 14) : (item[key] ?? 0);
        val = (typeof base === 'number') ? base * scaleX : base;
      }
      props[key] = val;
    }
  });

  if (item.type === 'live_alarm') props.alarms = alarms;

  const { Render } = def;
  return <Render {...props} />;
};

export const ElementRenderer = memo(ElementRendererInner, (prev, next) => {
    // Custom comparison to minimize re-renders
    // Only re-render if the core item properties change or rendering dimensions change
    return (
        prev.item === next.item &&
        prev.dispW === next.dispW &&
        prev.dispH === next.dispH &&
        prev.scaleX === next.scaleX &&
        prev.effectiveColor === next.effectiveColor &&
        prev.draggable === next.draggable &&
        prev.prefix === next.prefix
    );
});
