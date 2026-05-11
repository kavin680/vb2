import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store/store";
import type { ChartsState } from "../../../app/store/chartsSlice";
import type { Item, ShapeConfig } from "../../../elements/ElementManager";
import type { VariableDTO } from "../../../shared/types/variable.types";
import { actionsMeta } from "../../../shared/actions";
import { ElementManager } from "../../../elements";
import { APP_CONFIG } from "../../../shared/config";

const SHAPE_SELECTOR = 'circle, rect, path, line, polyline, polygon, ellipse, g';

interface UsePropertyStateArgs {
  selectedItem: Item | null;
  selectedItems?: Item[];
  onUpdate: (id: string, newProps: Partial<Item>) => void;
}

const resizeArray = (arr: string[], n: number) => {
  const next = arr.slice(0, n);
  while (next.length < n) next.push("");
  return next;
};

const deriveSeriesCount = (item: Item | null | undefined, entry: ChartsState['byId'][string] | undefined) => {
  const itemSeriesVarLen = Array.isArray(item?.seriesVarNames)
    ? (item.seriesVarNames as string[]).length
    : 0;
  const itemSeriesColorLen = Array.isArray(item?.seriesColors)
    ? (item.seriesColors as string[]).length
    : 0;
  const storeLen = Array.isArray(entry?.series) ? entry.series.length : 0;
  return Math.max(1, itemSeriesVarLen || itemSeriesColorLen || storeLen || 1);
};

export function usePropertyState({ selectedItem, selectedItems, onUpdate }: UsePropertyStateArgs) {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const variablesState = useSelector((s: RootState) => s.variables);
  const readVariables = variablesState.reading.ids.map(id => variablesState.reading.byId[id]);
  const writeVariables = variablesState.writing.ids.map(id => variablesState.writing.byId[id]);

  const activeView = useSelector((s: RootState) => s.appConfig.activeView);
  const activeModalIdx = useSelector((s: RootState) => s.modals.present.activeModal);
  const modal = useSelector((s: RootState) => s.modals.present.modals[activeModalIdx]);

  const pages = useSelector((s: RootState) => s.pages.present.pages || []);
  const activePage = useSelector((s: RootState) => s.pages.present.activePage || 0);
  const items = pages[activePage]?.items || [];

  const [accessIdError, setAccessIdError] = useState<string>("");

  const chartEntry = useSelector((s: RootState) => {
    const aid = selectedItem?.access_id;
    return aid ? s.charts.byId[aid] : undefined;
  });

  const [seriesCount, setSeriesCount] = useState<number>(1);
  const [seriesColors, setSeriesColors] = useState<string[]>([]);
  const [seriesVarNames, setSeriesVarNames] = useState<string[]>([]);

  const [shapeCount, setShapeCount] = useState<number>(0);
  const [shapeTags, setShapeTags] = useState<string[]>([]);
  const [shapeIds, setShapeIds] = useState<string[]>([]);
  const [selectedShapeIdx, setSelectedShapeIdx] = useState<number>(0);
  const [shapeConfigsLocal, setShapeConfigsLocal] = useState<ShapeConfig[]>([]);
  const [shapeEffectiveColor, setShapeEffectiveColor] = useState<string>("");
  const [valueColors, setValueColors] = useState<string[]>([]);
  const [valueColorBlinks, setValueColorBlinks] = useState<boolean[]>([]);

  const [dynamicBgColors, setDynamicBgColors] = useState<string[]>([]);
  const [dynamicTextColors, setDynamicTextColors] = useState<string[]>([]);

  const combinedVariableNames = activeView === 'modal' ? [] : [...readVariables];
  const combinedWriteVariableNames = activeView === 'modal' ? [] : [...writeVariables];

  if (activeView === 'modal' && modal?.internalVariables) {
    modal.internalVariables.forEach((v: string) => {
      if (v) {
        const item: VariableDTO = { id: v, name: v, value: 0, globalConfigId: '' };
        combinedVariableNames.push(item);
        combinedWriteVariableNames.push(item);
      }
    });
  }

  // initialize or update when selectedItem changes
  useEffect(() => {
    if (selectedItem) {
      const def = ElementManager.get(selectedItem.type);
      const defaults = def?.defaults || {};

      const initialValues: Record<string, string> = {
        access_id: selectedItem.access_id?.toString() || "",
        width: (selectedItem.width ?? defaults.width)?.toString() || "",
        height: (selectedItem.height ?? defaults.height)?.toString() || "",
        color: selectedItem.color || defaults.color || "",
        zIndex: selectedItem.zIndex !== undefined ? String(selectedItem.zIndex) : String(defaults.zIndex ?? APP_CONFIG.DEFAULTS.Z_INDEX),
        flipH: (selectedItem.flipH ?? defaults.flipH) ? 'true' : 'false',
        flipV: (selectedItem.flipV ?? defaults.flipV) ? 'true' : 'false',
        rotation: (selectedItem.rotation ?? defaults.rotation) !== undefined ? String(selectedItem.rotation ?? defaults.rotation) : '0',
        valueVarName: selectedItem.valueVarName || defaults.valueVarName || "",
        valueThreshold: (selectedItem.valueThreshold ?? defaults.valueThreshold) !== undefined ? String(selectedItem.valueThreshold ?? defaults.valueThreshold) : "",
        color0: selectedItem.color0 || defaults.color0 || "",
        color1: selectedItem.color1 || selectedItem.color || defaults.color1 || defaults.color || "",
        visibleVarName: selectedItem.visibleVarName || defaults.visibleVarName || "",
        visibilityThreshold: (selectedItem.visibilityThreshold ?? defaults.visibilityThreshold) !== undefined ? String(selectedItem.visibilityThreshold ?? defaults.visibilityThreshold) : "",
        reverseVisibility: (selectedItem.reverseVisibility ?? defaults.reverseVisibility) ? 'true' : 'false',
        onClickActionName: selectedItem.onClickActionName || defaults.onClickActionName || "",
        onDoubleClickActionName: selectedItem.onDoubleClickActionName || defaults.onDoubleClickActionName || "",
        onChangeActionName: selectedItem.onChangeActionName || defaults.onChangeActionName || "",
        onBlurActionName: selectedItem.onBlurActionName || defaults.onBlurActionName || "",
        textVarName: selectedItem.textVarName || defaults.textVarName || "",
        modalPostfix: selectedItem.modalPostfix || defaults.modalPostfix || "",
      };

      if (def) {
        def.properties.forEach((field) => {
          const key = field.key as string;
          if (initialValues[key] === undefined) {
            const val = selectedItem[key];
            if (val !== undefined && val !== null) {
              initialValues[key] = String(val);
            }
          }
        });
      }

      const clickArgs = (selectedItem.onClickActionArgs || {}) as Record<string, string | number | boolean>;
      Object.keys(clickArgs).forEach((k) => {
        initialValues[`onClick_arg_${k}`] = String(clickArgs[k]);
      });
      const dblArgs = (selectedItem.onDoubleClickActionArgs || {}) as Record<string, string | number | boolean>;
      Object.keys(dblArgs).forEach((k) => {
        initialValues[`onDbl_arg_${k}`] = String(dblArgs[k]);
      });
      const chgArgs = (selectedItem.onChangeActionArgs || {}) as Record<string, string | number | boolean>;
      Object.keys(chgArgs).forEach((k) => {
        initialValues[`onChange_arg_${k}`] = String(chgArgs[k]);
      });
      const blurArgs = (selectedItem.onBlurActionArgs || {}) as Record<string, string | number | boolean>;
      Object.keys(blurArgs).forEach((k) => {
        initialValues[`onBlur_arg_${k}`] = String(blurArgs[k]);
      });

      if (Array.isArray(selectedItem.dynamicTexts)) {
        (selectedItem.dynamicTexts as string[]).forEach((txt: string, idx: number) => {
          initialValues[`dynamicText_${idx}`] = txt || '';
        });
      }

      const syncWithRedux = () => {
        let nextValues = initialValues;
        if (selectedItems && selectedItems.length > 1) {
          const mixedValues: Record<string, string> = { ...initialValues };
          const keys = Object.keys(initialValues);
          keys.forEach(key => {
            const firstVal = selectedItems[0][key];
            const isMixed = selectedItems.some(item => item[key] !== firstVal);
            if (isMixed) mixedValues[key] = "__MIXED__";
          });
          nextValues = mixedValues;
        }

        const _currentlyMixed = inputValues.id === "__MIXED__";
        const hasIdChanged = selectedItem.id !== inputValues._lastSelectedItemId;
        const hasValuesDiverged = Object.keys(nextValues).some(k => nextValues[k] !== inputValues[k]);

        if (hasIdChanged || hasValuesDiverged) {
          setInputValues({
            ...nextValues,
            _lastSelectedItemId: selectedItem.id
          });
        }
      };

      syncWithRedux();

      if (Array.isArray(selectedItem.valueColors)) {
        setValueColors([...selectedItem.valueColors]);
      } else {
        setValueColors([]);
      }
      if (Array.isArray(selectedItem.valueColorBlinks)) {
        setValueColorBlinks([...selectedItem.valueColorBlinks]);
      } else {
        setValueColorBlinks([]);
      }

      if (Array.isArray(selectedItem.dynamicBgColors)) {
        setDynamicBgColors([...selectedItem.dynamicBgColors]);
      } else {
        setDynamicBgColors([]);
      }
      if (Array.isArray(selectedItem.dynamicTextColors)) {
        setDynamicTextColors([...selectedItem.dynamicTextColors]);
      } else {
        setDynamicTextColors([]);
      }

      if (Array.isArray(selectedItem.seriesColors)) {
        setSeriesColors([...selectedItem.seriesColors]);
      } else {
        setSeriesColors([]);
      }
      if (Array.isArray(selectedItem.seriesVarNames)) {
        setSeriesVarNames([...selectedItem.seriesVarNames]);
      } else {
        setSeriesVarNames([]);
      }

      const sc: ShapeConfig[] = Array.isArray(selectedItem.shapeConfigs)
        ? [...selectedItem.shapeConfigs]
        : [];
      setShapeConfigsLocal(sc);
    } else {
      setInputValues({});
      setValueColors([]);
      setValueColorBlinks([]);
      setDynamicBgColors([]);
      setDynamicTextColors([]);
    }
  }, [selectedItem]);

  useEffect(() => {
    const aid = selectedItem?.access_id;
    if (!aid) {
      const countNoAid = deriveSeriesCount(selectedItem, undefined);
      setSeriesCount(countNoAid);
      setSeriesColors((prev) => resizeArray(prev, countNoAid));
      setSeriesVarNames((prev) => resizeArray(prev, countNoAid));
      return;
    }
    const count = deriveSeriesCount(selectedItem, chartEntry);
    setSeriesCount(count);
    setSeriesColors((prev) => resizeArray(prev, count));
    setSeriesVarNames((prev) => resizeArray(prev, count));
  }, [selectedItem?.id, selectedItem?.type, selectedItem?.access_id, chartEntry]);

  // Detect shapes from canvas DOM when selection changes
  useEffect(() => {
    if (!selectedItem) { setShapeCount(0); setShapeTags([]); setShapeIds([]); return; }
    try {
      const root = document.querySelector(`.dropped-item[data-item-id="${selectedItem.id}"]`);
      const svg = root?.querySelector('svg');
      const allNodes = svg?.querySelectorAll(SHAPE_SELECTOR);

      const nodesWithIds = allNodes ? Array.from(allNodes).filter((n) => {
        const id = (n as Element).getAttribute('id');
        return id && id.trim() !== '';
      }) : [];

      const count = nodesWithIds.length;
      setShapeCount(count);
      setShapeTags(nodesWithIds.map((n) => (n as Element).tagName.toLowerCase()));
      setShapeIds(nodesWithIds.map((n) => (n as Element).getAttribute('id') || ''));
      setSelectedShapeIdx(-1);
    } catch {
      setShapeCount(0);
      setShapeTags([]);
      setShapeIds([]);
      setSelectedShapeIdx(-1);
    }
  }, [selectedItem?.id]);

  // Highlight selected shape in SVG
  useEffect(() => {
    try {
      if (!selectedItem) return;
      const def = ElementManager.get(selectedItem.type);
      if (!def || def.kind !== 'svg') return;
      if (!shapeCount) return;
      const root = document.querySelector(`.dropped-item[data-item-id="${selectedItem.id}"]`);
      const svg = root?.querySelector('svg');
      if (!svg) return;
      const nodes = svg.querySelectorAll(SHAPE_SELECTOR);
      if (!nodes || !nodes.length) return;
      nodes.forEach((node, idx) => {
        const el = node as SVGElement & { style: CSSStyleDeclaration };
        el.style.transition = 'filter 120ms ease, opacity 120ms ease';
        if (idx === selectedShapeIdx) {
          el.style.opacity = '1';
          el.style.filter = 'none';
        } else {
          el.style.opacity = '0.25';
          el.style.filter = 'blur(1.5px)';
        }
      });
      return () => {
        try {
          nodes.forEach((node) => {
            const el = node as SVGElement;
            el.style.opacity = '';
            el.style.filter = '';
            el.style.transition = '';
          });
        } catch { /* ignore */ }
      };
    } catch { /* ignore */ }
  }, [selectedItem?.id, selectedShapeIdx, shapeCount]);

  // Detect effective color for selected shape
  useEffect(() => {
    try {
      if (!selectedItem) { setShapeEffectiveColor(""); return; }
      const def = ElementManager.get(selectedItem.type);
      if (!def || def.kind !== 'svg') { setShapeEffectiveColor(""); return; }
      const root = document.querySelector(`.dropped-item[data-item-id="${selectedItem.id}"]`);
      const svg = root?.querySelector('svg');
      if (!svg) { setShapeEffectiveColor(""); return; }
      const nodes = svg.querySelectorAll(SHAPE_SELECTOR);
      const arr = Array.from(nodes);
      const node = arr[selectedShapeIdx] as SVGElement | undefined;
      if (!node) { setShapeEffectiveColor(""); return; }
      const rgbToHex = (s: string) => {
        const m = s.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
        if (!m) return null;
        const r = Math.max(0, Math.min(255, parseInt(m[1], 10)));
        const g = Math.max(0, Math.min(255, parseInt(m[2], 10)));
        const b = Math.max(0, Math.min(255, parseInt(m[3], 10)));
        const hx = (n: number) => n.toString(16).padStart(2, '0');
        return `#${hx(r)}${hx(g)}${hx(b)}`;
      };
      const toHex = (val: string | null | undefined) => {
        if (!val) return null;
        const v = String(val).trim();
        if (!v || v === 'none' || v === 'transparent') return null;
        if (v.startsWith('#')) {
          if (v.length === 7) return v;
          if (v.length === 4) {
            const r = v[1], g = v[2], b = v[3];
            return `#${r}${r}${g}${g}${b}${b}`;
          }
          return v;
        }
        if (v.startsWith('rgb')) return rgbToHex(v);
        return null;
      };
      const cs = getComputedStyle(node as Element);
      const candidates = [
        (node as SVGElement).style?.fill as string | undefined,
        node.getAttribute('fill') || undefined,
        cs.fill,
        (node as SVGElement).style?.stroke as string | undefined,
        node.getAttribute('stroke') || undefined,
        cs.stroke,
      ];
      let found: string | null = null;
      for (const c of candidates) {
        const hx = toHex(c);
        if (hx) { found = hx; break; }
      }
      if (!found) {
        const fallback = (inputValues.color || '#000000');
        setShapeEffectiveColor(fallback);
      } else {
        setShapeEffectiveColor(found);
      }
    } catch {
      setShapeEffectiveColor("");
    }
  }, [selectedItem?.id, selectedShapeIdx, shapeCount, inputValues.color, shapeConfigsLocal, variablesState]);

  const upsertShapeConfig = (idx: number, patch: Partial<ShapeConfig>) => {
    if (!selectedItem) return;
    const next = [...shapeConfigsLocal];
    const i = next.findIndex((s) => s.index === idx);
    const base: ShapeConfig = i >= 0 ? { ...next[i] } : { index: idx };
    const merged: ShapeConfig & Record<string, unknown> = { ...base, ...patch, index: idx };
    if (merged.color === '') delete merged.color;
    if (merged.valueVarName === '') delete merged.valueVarName;
    if (merged.visibleVarName === '') delete merged.visibleVarName;
    if (merged.color0 === '') delete merged.color0;
    if (merged.color1 === '') delete merged.color1;
    if (merged.onClickActionName === '') { delete merged.onClickActionName; delete merged.onClickActionArgs; }
    if (merged.onDoubleClickActionName === '') { delete merged.onDoubleClickActionName; delete merged.onDoubleClickActionArgs; }
    if (i >= 0) next[i] = merged; else next.push(merged);
    setShapeConfigsLocal(next);
    onUpdate(selectedItem.id, { shapeConfigs: next } as Partial<Item>);
  };

  const handleShapeActionParamChange = (
    which: 'click' | 'dbl',
    key: string,
    value: string,
  ) => {
    if (!selectedItem) return;
    const idx = selectedShapeIdx;
    const cfg = shapeConfigsLocal.find((c) => c.index === idx) || ({ index: idx } as ShapeConfig);
    const actionName = which === 'click' ? cfg.onClickActionName : cfg.onDoubleClickActionName;
    const meta = actionName ? actionsMeta[actionName] : undefined;
    const params = meta?.params || [];
    const rawArgs = (which === 'click' ? cfg.onClickActionArgs : cfg.onDoubleClickActionArgs) || {};
    const args: Record<string, unknown> = { ...rawArgs };
    params.forEach((p) => {
      if (p.key === key) {
        args[p.key] = p.type === 'number' ? Number(value || 0) : value;
      } else if (args[p.key] === undefined) {
        args[p.key] = p.type === 'number' ? 0 : '';
      }
    });
    upsertShapeConfig(idx, which === 'click' ? { onClickActionArgs: args } : { onDoubleClickActionArgs: args });
  };

  const handleChange = (key: string, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (selectedItem) {
      let parsedValue: string | number | boolean = value;

      const numericKeys = ["width", "height", "fontSize", "borderWidth", "borderRadius", "zIndex", "valueThreshold", "visibilityThreshold", "timeWindowSeconds", "rotation", "rowCount"];
      const isCoreNumeric = numericKeys.includes(key);

      const def = ElementManager.get(selectedItem.type);
      const fieldDef = def?.properties.find(p => p.key === key);
      const isRegisteredNumeric = fieldDef?.type === 'number';

      if (isCoreNumeric || isRegisteredNumeric) {
        parsedValue = Number(value);
      }
      const isRegisteredBoolean = fieldDef?.type === 'boolean';
      const isCoreBoolean = ["flipH", "flipV", "reverseVisibility", "isGlobal", "animateVisibility", "animateValue", "showLabel"].includes(key);

      if (isRegisteredBoolean || isCoreBoolean) {
        parsedValue = value === 'true';
      }

      if (key === "isGlobal" && value === 'true' && !selectedItem.parentPageName) {
        onUpdate(selectedItem.id, {
          isGlobal: true,
          parentPageName: ""
        });
        return;
      }

      if (key === "access_id") {
        const trimmed = value.trim();
        const duplicate = items.some((it) => it.id !== selectedItem.id && it.access_id && it.access_id === trimmed);
        if (duplicate) {
          setAccessIdError("Access Id already in use");
          return;
        } else {
          setAccessIdError("");
        }
      }

      if (key.startsWith('dynamicText_')) {
        const idx = parseInt(key.replace('dynamicText_', ''), 10);
        const currentTexts = Array.isArray(selectedItem.dynamicTexts)
          ? [...selectedItem.dynamicTexts as string[]]
          : [];
        while (currentTexts.length <= idx) currentTexts.push('');
        currentTexts[idx] = value;
        onUpdate(selectedItem.id, { dynamicTexts: currentTexts } as Partial<Item>);
        return;
      }

      const updates: Partial<Item> = { [key]: parsedValue };

      if ((key === 'textVarName' || key === 'valueVarName') && value) {
        const hasBgColors = Array.isArray(selectedItem.dynamicBgColors) && (selectedItem.dynamicBgColors as string[]).length > 0;
        const hasTextColors = Array.isArray(selectedItem.dynamicTextColors) && (selectedItem.dynamicTextColors as string[]).length > 0;
        const hasTexts = Array.isArray(selectedItem.dynamicTexts) && (selectedItem.dynamicTexts as string[]).length > 0;

        if (!hasBgColors || !hasTextColors || !hasTexts) {
          const defaultBgColors = ['#3b82f6'];
          const defaultTextColors = ['#ffffff'];
          const defaultTexts = [''];

          setDynamicBgColors(defaultBgColors);
          setDynamicTextColors(defaultTextColors);

          setInputValues((prev) => ({
            ...prev,
            dynamicText_0: ''
          }));

          updates.dynamicBgColors = defaultBgColors;
          updates.dynamicTextColors = defaultTextColors;
          updates.dynamicTexts = defaultTexts;
        }
      }

      onUpdate(selectedItem.id, updates);
    }
  };

  const handleActionParamChange = (
    which: 'click' | 'dbl' | 'change' | 'blur',
    key: string,
    value: string,
  ) => {
    const fieldKey = which === 'click' ? `onClick_arg_${key}` : which === 'dbl' ? `onDbl_arg_${key}` : which === 'change' ? `onChange_arg_${key}` : `onBlur_arg_${key}`;
    setInputValues((prev) => ({ ...prev, [fieldKey]: value }));
    if (!selectedItem) return;
    const meta = which === 'click'
      ? actionsMeta[inputValues.onClickActionName || '']
      : which === 'dbl'
        ? actionsMeta[inputValues.onDoubleClickActionName || '']
        : which === 'change'
          ? actionsMeta[inputValues.onChangeActionName || '']
          : actionsMeta[inputValues.onBlurActionName || ''];
    const params = meta?.params || [];
    const args: Record<string, string | number> = {};
    params.forEach((p) => {
      const v = (fieldKey === (which === 'click' ? `onClick_arg_${p.key}` : which === 'dbl' ? `onDbl_arg_${p.key}` : which === 'change' ? `onChange_arg_${p.key}` : `onBlur_arg_${p.key}`)) ? value : (inputValues[(which === 'click' ? `onClick_arg_${p.key}` : which === 'dbl' ? `onDbl_arg_${p.key}` : which === 'change' ? `onChange_arg_${p.key}` : `onBlur_arg_${p.key}`)] ?? '');
      args[p.key] = p.type === 'number' ? Number(v || 0) : v;
    });
    onUpdate(selectedItem.id,
      which === 'click' ? { onClickActionArgs: args }
        : which === 'dbl' ? { onDoubleClickActionArgs: args }
          : which === 'change' ? { onChangeActionArgs: args }
            : { onBlurActionArgs: args }
    );
  };

  const onActionChange = (which: 'click' | 'dbl' | 'change' | 'blur', actionName: string) => {
    handleChange(which === 'click' ? 'onClickActionName' : which === 'dbl' ? 'onDoubleClickActionName' : which === 'change' ? 'onChangeActionName' : 'onBlurActionName', actionName);
    if (selectedItem) {
      onUpdate(selectedItem.id,
        which === 'click' ? { onClickActionArgs: {} }
          : which === 'dbl' ? { onDoubleClickActionArgs: {} }
            : which === 'change' ? { onChangeActionArgs: {} }
              : { onBlurActionArgs: {} }
      );
    }
  };

  const handleValueColorsCountChange = (n: number) => {
    const next = resizeArray(valueColors, Math.max(2, n || 2));
    setValueColors(next);
    if (selectedItem) onUpdate(selectedItem.id, { valueColors: next } as Partial<Item>);
    const nextBlinks = resizeArray(valueColorBlinks.map((b) => (b ? '1' : '')), Math.max(2, n || 2)).map((s) => s === '1');
    setValueColorBlinks(nextBlinks);
    if (selectedItem) onUpdate(selectedItem.id, { valueColorBlinks: nextBlinks } as Partial<Item>);
  };

  const handleValueColorAtIndexChange = (index: number, value: string) => {
    const next = [...valueColors];
    while (next.length <= index) next.push("");
    next[index] = value;
    setValueColors(next);
    if (selectedItem) onUpdate(selectedItem.id, { valueColors: next } as Partial<Item>);
  };

  const handleValueBlinkAtIndexChange = (index: number, value: boolean) => {
    const next = [...valueColorBlinks];
    while (next.length <= index) next.push(false);
    next[index] = value;
    setValueColorBlinks(next);
    if (selectedItem) onUpdate(selectedItem.id, { valueColorBlinks: next } as Partial<Item>);
  };

  const handleDynamicColorsCountChange = (n: number) => {
    const nextBg = resizeArray(dynamicBgColors, Math.max(1, n || 1));
    const nextText = resizeArray(dynamicTextColors, Math.max(1, n || 1));

    const currentTexts: string[] = [];
    const currentCount = Math.max(dynamicBgColors.length, dynamicTextColors.length);
    for (let i = 0; i < currentCount; i++) {
      currentTexts.push(inputValues[`dynamicText_${i}`] || '');
    }
    const nextTexts = resizeArray(currentTexts, Math.max(1, n || 1));

    setDynamicBgColors(nextBg);
    setDynamicTextColors(nextText);

    const textInputs: Record<string, string> = {};
    for (let i = 0; i < nextTexts.length; i++) {
      textInputs[`dynamicText_${i}`] = nextTexts[i] || '';
    }
    setInputValues((prev) => ({ ...prev, ...textInputs }));

    if (selectedItem) onUpdate(selectedItem.id, {
      dynamicBgColors: nextBg,
      dynamicTextColors: nextText,
      dynamicTexts: nextTexts
    } as Partial<Item>);
  };

  const handleDynamicBgColorChange = (index: number, value: string) => {
    const next = [...dynamicBgColors];
    while (next.length <= index) next.push("");
    next[index] = value;
    setDynamicBgColors(next);
    if (selectedItem) onUpdate(selectedItem.id, { dynamicBgColors: next } as Partial<Item>);
  };

  const handleDynamicTextColorChange = (index: number, value: string) => {
    const next = [...dynamicTextColors];
    while (next.length <= index) next.push("");
    next[index] = value;
    setDynamicTextColors(next);
    if (selectedItem) onUpdate(selectedItem.id, { dynamicTextColors: next } as Partial<Item>);
  };

  return {
    inputValues,
    accessIdError,
    activeView,
    pages,
    combinedVariableNames,
    combinedWriteVariableNames,
    // Series / Chart
    seriesCount,
    setSeriesCount,
    seriesColors,
    setSeriesColors,
    seriesVarNames,
    setSeriesVarNames,
    resizeArray,
    // Shape
    shapeCount,
    shapeTags,
    shapeIds,
    selectedShapeIdx,
    setSelectedShapeIdx,
    shapeConfigsLocal,
    shapeEffectiveColor,
    upsertShapeConfig,
    handleShapeActionParamChange,
    // Value colors
    valueColors,
    valueColorBlinks,
    handleValueColorsCountChange,
    handleValueColorAtIndexChange,
    handleValueBlinkAtIndexChange,
    // Dynamic badge
    dynamicBgColors,
    dynamicTextColors,
    handleDynamicColorsCountChange,
    handleDynamicBgColorChange,
    handleDynamicTextColorChange,
    // Handlers
    handleChange,
    handleActionParamChange,
    onActionChange,
  };
}
