import { resolveApiUrls } from '../config';
import apiClient from './apiClient';
import type { ApiResponse } from '../types/api.types';
import type {
  VariableDTO,
  VariableHistoryResponseDTO,
  GetVariablesResponseDTO,
  GetVariableFunctionsResponseDTO,
  GetMboVariablesResponseDTO
} from '../types/variable.types';
import { getGlobalStore } from '../../app/store/storeAccessor';

/**
 * Resolve API endpoints dynamically.
 */
const getApiConfig = () => {
  const store = getGlobalStore();
  const state = store?.getState();
  const runtimeConfig = state?.appConfig as Record<string, string> | undefined;
  return resolveApiUrls(runtimeConfig);
};

/**
 * Parse enveloped variable response into a list of VariableDTOs
 */
const parseVariableResponse = (response: ApiResponse<GetVariablesResponseDTO>): ApiResponse<GetVariablesResponseDTO> => {
  const data = response.data;
  const variables = Array.isArray(data) ? data : (data as unknown as Record<string, unknown>)?.variables;

  if (!response?.success || !Array.isArray(variables)) {
    return response;
  }

  const sanitizedVariables = (variables as Array<Record<string, unknown>>).map((item) => {
    let val = item.value;
    if (val === null || val === undefined) {
      val = 0;
    } else {
      const num = Number(val);
      val = isNaN(num) ? 0 : num;
    }
    return { ...item, value: val };
  });

  return {
    ...response,
    data: {
      variables: sanitizedVariables
    } as GetVariablesResponseDTO
  };
};

/**
 * Fetch read variables from read server
 */
export async function fetchReadVariables(): Promise<ApiResponse<GetVariablesResponseDTO>> {
  try {
    const { readVariables } = getApiConfig();
    const response = await apiClient.get<ApiResponse<GetVariablesResponseDTO>>(readVariables);
    return parseVariableResponse(response.data);
  } catch (error) {
    console.warn('[variableApi]', error);
    return { success: false, message: 'Failed to fetch read variables', data: { variables: [] } };
  }
}

/**
 * Fetch historical data for a set of reading variables
 */
export async function fetchReadVariablesHistory(
  variableIds: string[],
  startDate: string,
  endDate: string
): Promise<ApiResponse<VariableHistoryResponseDTO>> {
  try {
    const { readVariables } = getApiConfig();
    const url = new URL(readVariables, window.location.origin);
    if (!url.pathname.endsWith('/history')) {
      url.pathname = url.pathname.replace(/\/$/, '') + '/history';
    }

    url.searchParams.append('startDate', startDate);
    url.searchParams.append('endDate', endDate);
    url.searchParams.append('variableIds', variableIds.join(','));

    const response = await apiClient.get<ApiResponse<VariableHistoryResponseDTO>>(url.toString());
    return response.data;
  } catch (error) {
    console.warn('[variableApi]', error);
    return { success: false, message: 'Failed to fetch historical variables', data: {} as VariableHistoryResponseDTO };
  }
}

/**
 * Fetch consumption data
 */
export async function fetchConsumptionData(
  variableId: number | string,
  type: 'day' | 'week' | 'month',
  count: number | string
): Promise<ApiResponse<unknown>> {
  try {
    const { readVariables } = getApiConfig();
    const url = new URL(readVariables, window.location.origin);
    url.pathname = url.pathname.replace(/\/$/, '') + '/consumption';

    url.searchParams.append('variableId', String(variableId));
    url.searchParams.append('type', type);
    url.searchParams.append('count', String(count));

    const response = await apiClient.get<ApiResponse<unknown>>(url.toString());
    return response.data;
  } catch (error) {
    console.warn('[variableApi]', error);
    return { success: false, message: 'Failed to fetch consumption data', data: null };
  }
}


/**
 * Export historical data for a set of reading variables
 */
export async function exportHistoricalData(
  variableIds: string[],
  startDate: string,
  endDate: string
): Promise<{ success: boolean; message?: string; blob?: Blob }> {
  try {
    const { readVariables } = getApiConfig();
    const url = new URL(readVariables, window.location.origin);
    url.pathname = url.pathname.replace(/\/$/, '');
    if (!url.pathname.endsWith('/history')) {
      url.pathname += '/history';
    }
    url.pathname += '/export';

    url.searchParams.append('startDate', startDate);
    url.searchParams.append('endDate', endDate);
    url.searchParams.append('variableIds', variableIds.join(','));

    const response = await apiClient.get(url.toString(), { responseType: 'blob' });
    return { success: true, blob: response.data };
  } catch (error) {
    console.warn('[variableApi]', error);
    return { success: false, message: 'Failed to export historical data' };
  }
}

/**
 * Export consumption data for a set of reading variables
 */
export async function exportConsumptionData(
  variableIds: string[],
  startDate: string,
  endDate: string
): Promise<{ success: boolean; message?: string; blob?: Blob }> {
  try {
    const { readVariables } = getApiConfig();
    const url = new URL(readVariables, window.location.origin);
    url.pathname = url.pathname.replace(/\/$/, '') + '/consumption/export';

    url.searchParams.append('startDate', startDate);
    url.searchParams.append('endDate', endDate);
    url.searchParams.append('variableIds', variableIds.join(','));

    const response = await apiClient.get(url.toString(), { responseType: 'blob' });
    return { success: true, blob: response.data };
  } catch (error) {
    console.warn('[variableApi]', error);
    return { success: false, message: 'Failed to export consumption data' };
  }
}

/**
 * Create or Update a reading variable
 */
export async function createReadingVariable(variable: Partial<VariableDTO>): Promise<ApiResponse<void>> {
  try {
    const { readVariables } = getApiConfig();
    const response = await apiClient.post<ApiResponse<void>>(readVariables, variable);
    return response.data;
  } catch (error) {
    console.warn('[variableApi]', error);
    return { success: false, message: 'Network error or server unavailable', data: undefined as unknown as void };
  }
}

/**
 * Create or Update a writing variable
 */
export async function createWritingVariable(variable: Partial<VariableDTO>): Promise<ApiResponse<void>> {
  try {
    const { writeVariables } = getApiConfig();
    const response = await apiClient.post<ApiResponse<void>>(writeVariables, variable);
    return response.data;
  } catch (error) {
    console.warn('[variableApi]', error);
    return { success: false, message: 'Network error or server unavailable', data: undefined as unknown as void };
  }
}

/**
 * Fetch write variables from write server
 */
export async function fetchWriteVariables(): Promise<ApiResponse<GetVariablesResponseDTO>> {
  try {
    const { writeVariables } = getApiConfig();
    const response = await apiClient.get<ApiResponse<GetVariablesResponseDTO>>(writeVariables);
    return parseVariableResponse(response.data);
  } catch (error) {
    console.warn('[variableApi]', error);
    return { success: false, message: 'Failed to fetch write variables', data: { variables: [] } };
  }
}

/**
 * Update a writing variable value by ID via PATCH request
 */
export async function updateWritingVariableValue(id: string, value: number, index?: number): Promise<ApiResponse<void>> {
  try {
    if (!id || id === 'null' || id === 'undefined') {
      console.warn('[variableApi] updateWritingVariableValue: Refusing to call API with invalid ID:', id);
      return { success: false, message: 'Invalid variable ID', data: undefined as any };
    }

    const stringId = String(id);
    if (stringId.startsWith('mbo:')) {
      return updateMboVariableValue(stringId.replace('mbo:', ''), value);
    }

    const numericId = Number(id);
    if (isNaN(numericId)) {
      console.warn('[variableApi] updateWritingVariableValue: ID is not a number:', id);
      return { success: false, message: 'Invalid variable ID (not a number)', data: undefined as any };
    }

    const { writeVariables } = getApiConfig();
    const response = await apiClient.patch<ApiResponse<void>>(writeVariables, { id: numericId, value, index });
    return response.data;
  } catch (e) {
    void e;
    return { success: false, message: 'Failed to update writing variable', data: undefined as unknown as void };
  }
}

/**
 * Update an MBO variable value by ID via PATCH request
 */
export async function updateMboVariableValue(id: string, value: number): Promise<ApiResponse<void>> {
  try {
    const { machineBasedOperations: mboUrl } = getApiConfig();
    const response = await apiClient.patch<ApiResponse<void>>(mboUrl, { id: Number(id), value });
    return response.data;
  } catch (e) {
    void e;
    return { success: false, message: 'Failed to update MBO variable', data: undefined as unknown as void };
  }
}

/**
 * Fetch available functions from API
 */
export async function fetchVariableFunctions(): Promise<ApiResponse<GetVariableFunctionsResponseDTO>> {
  try {
    const { functions: functionsUrl } = getApiConfig();
    const response = await apiClient.get<ApiResponse<GetVariableFunctionsResponseDTO>>(functionsUrl);
    return response.data;
  } catch (e) {
    void e;
    return { success: false, message: 'Failed to fetch variable functions', data: {} as GetVariableFunctionsResponseDTO };
  }
}

/**
 * Fetch available reading functions from API
 */
export async function fetchReadingFunctions(): Promise<ApiResponse<GetVariableFunctionsResponseDTO>> {
  try {
    const { readingFunctions: functionsUrl } = getApiConfig();
    const response = await apiClient.get<ApiResponse<GetVariableFunctionsResponseDTO>>(functionsUrl);
    return response.data;
  } catch (e) {
    void e;
    return { success: false, message: 'Failed to fetch reading functions', data: {} as GetVariableFunctionsResponseDTO };
  }
}

/**
 * Fetch available writing functions from API
 */
export async function fetchWritingFunctions(): Promise<ApiResponse<GetVariableFunctionsResponseDTO>> {
  try {
    const { writingFunctions: functionsUrl } = getApiConfig();
    const response = await apiClient.get<ApiResponse<GetVariableFunctionsResponseDTO>>(functionsUrl);
    return response.data;
  } catch (e) {
    void e;
    return { success: false, message: 'Failed to fetch writing functions', data: {} as GetVariableFunctionsResponseDTO };
  }
}

/**
 * Fetch MBO variables for a given writing variable ID
 */
export async function fetchMboVariables(writingVariableId: string): Promise<ApiResponse<GetMboVariablesResponseDTO>> {
  try {
    const { machineBasedOperations: mboUrl } = getApiConfig();
    const response = await apiClient.get<ApiResponse<GetMboVariablesResponseDTO>>(`${mboUrl}/${writingVariableId}`);
    const resData = response.data;

    // Normalize response if data is an array
    if (resData.success && Array.isArray(resData.data)) {
      return {
        ...resData,
        data: { mbos: resData.data }
      };
    }

    return resData;
  } catch (e) {
    void e;
    return { success: false, message: 'Failed to fetch MBO variables', data: { mbos: [] } };
  }
}

/**
 * Update an MBO variable name
 */
export async function updateMboVariable(id: string, name: string): Promise<ApiResponse<void>> {
  try {
    const { machineBasedOperations: mboUrl } = getApiConfig();
    const response = await apiClient.patch<ApiResponse<void>>(mboUrl, { id: Number(id), name });
    return response.data;
  } catch (e) {
    void e;
    return { success: false, message: 'Failed to update MBO variable name', data: undefined as unknown as void };
  }
}
