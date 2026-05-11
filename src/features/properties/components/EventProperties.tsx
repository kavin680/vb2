import { PropertyItem } from "./PropertyItem";
import { actionNames, actionsMeta } from "../../../shared/actions";

import { type VariableDTO } from "../../../shared/types/variable.types";
import { VariableSelect } from "../../../shared/components/VariableSelector/VariableSelect";

interface EventPropertiesProps {
    inputValues: Record<string, string>;
    variableNames: VariableDTO[];
    handleActionParamChange: (which: 'click' | 'dbl' | 'change' | 'blur', key: string, value: string) => void;
    onActionChange: (which: 'click' | 'dbl' | 'change' | 'blur', actionName: string) => void;
}

// Reusable component for a single event type
interface EventConfigProps {
    label: string;
    eventType: 'click' | 'dbl' | 'change' | 'blur';
    actionValue: string;
    params: Record<string, string>;
    variableNames: VariableDTO[];
    onActionChange: (actionName: string) => void;
    onParamChange: (key: string, value: string) => void;
}

function EventConfig({
    label,
    eventType,
    actionValue,
    params,
    variableNames: _variableNames,
    onActionChange,
    onParamChange
}: EventConfigProps) {
    const actionData = actionValue ? actionsMeta[actionValue] : null;
    const hasParams = actionData?.params?.length;

    return (
        <>
            <div className="property-field">
                <PropertyItem label={label} />
                <select value={actionValue || ''} onChange={(e) => onActionChange(e.target.value)}>
                    <option value="">None</option>
                    {actionNames.map((name) => (
                        <option key={name} value={name}>
                            {actionsMeta[name]?.label || name}
                        </option>
                    ))}
                    {actionValue === "__MIXED__" && (
                        <option value="__MIXED__" disabled>Mixed values</option>
                    )}
                </select>
            </div>

            {hasParams && (
                <div className="property-field property-params-section">
                    <PropertyItem label={`${label} Parameters`} />
                    <div className="params-container">
                        {actionData?.params?.map((p) => (
                            <div key={`${eventType}_${p.key}`} className="param-field">
                                <label className="param-label">{p.label}</label>
                                {(p.key === 'name' || p.key === 'variableId') ? (
                                    <VariableSelect
                                        value={params[p.key] === "__MIXED__" ? "" : (params[p.key] || '')}
                                        onChange={(val) => onParamChange(p.key, val)}
                                        allowedType="writing"
                                    />
                                ) : (
                                    <input
                                        type={params[p.key] === "__MIXED__" ? 'text' : (p.type === 'number' ? 'number' : 'text')}
                                        value={params[p.key] === "__MIXED__" ? "" : (params[p.key] || '')}
                                        onChange={(e) => onParamChange(p.key, e.target.value)}
                                        placeholder={params[p.key] === "__MIXED__" ? "Mixed values" : (p.type === 'number' ? '0' : 'Enter value')}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

export const EventProperties = ({
    inputValues,
    variableNames,
    handleActionParamChange,
    onActionChange,
}: EventPropertiesProps) => {
    // Helper to extract params for an event type
    const getParams = (eventType: 'click' | 'dbl' | 'change' | 'blur') => {
        const prefix = eventType === 'click' ? 'onClick_arg_'
            : eventType === 'dbl' ? 'onDbl_arg_'
                : eventType === 'change' ? 'onChange_arg_'
                    : 'onBlur_arg_';

        const params: Record<string, string> = {};
        Object.entries(inputValues).forEach(([key, value]) => {
            if (key.startsWith(prefix)) {
                const paramKey = key.replace(prefix, '');
                params[paramKey] = value;
            }
        });
        return params;
    };

    return (
        <div className="property-section property-section-events">
            <div className="property-section-header">
                <h3 className="section-title">Events</h3>
            </div>

            <EventConfig
                label="onClick"
                eventType="click"
                actionValue={inputValues.onClickActionName || ''}
                params={getParams('click')}
                variableNames={variableNames}
                onActionChange={(name) => onActionChange('click', name)}
                onParamChange={(key, value) => handleActionParamChange('click', key, value)}
            />

            <EventConfig
                label="onDoubleClick"
                eventType="dbl"
                actionValue={inputValues.onDoubleClickActionName || ''}
                params={getParams('dbl')}
                variableNames={variableNames}
                onActionChange={(name) => onActionChange('dbl', name)}
                onParamChange={(key, value) => handleActionParamChange('dbl', key, value)}
            />



            <EventConfig
                label="onBlur"
                eventType="blur"
                actionValue={inputValues.onBlurActionName || ''}
                params={getParams('blur')}
                variableNames={variableNames}
                onActionChange={(name) => onActionChange('blur', name)}
                onParamChange={(key, value) => handleActionParamChange('blur', key, value)}
            />
        </div>
    );
};
