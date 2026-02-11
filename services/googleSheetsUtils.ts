
/**
 * Global System Log for In-App Debugging
 */
export const internalLog: Array<{time: string, sheet: string, action: string, status: string, details: string, payload?: any}> = [];

export const addToLog = (sheet: string, action: string, status: string, details: string, payload?: any) => {
  internalLog.unshift({
    time: new Date().toLocaleTimeString(),
    sheet, action, status, details, payload
  });
  if (internalLog.length > 30) internalLog.pop();
};

/**
 * Robust value retriever that is case-insensitive and handles multiple variations.
 */
export const getValue = (row: any, keys: string[]): string => {
  if (!row || typeof row !== 'object') return '';
  const rowKeys = Object.keys(row);
  for (const key of keys) {
    const rawVal = row[key];
    if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
      return String(rawVal).trim();
    }
    
    const normalizedTarget = key.toLowerCase().replace(/\s+/g, '');
    const foundKey = rowKeys.find(k => k.toLowerCase().replace(/\s+/g, '') === normalizedTarget);
    if (foundKey) {
      const rawValFound = row[foundKey];
      if (rawValFound !== undefined && rawValFound !== null && rawValFound !== '') {
        return String(rawValFound).trim();
      }
    }
  }
  return '';
};

/**
 * Transforms a 2D array (Raw Sheets Data) into Objects.
 */
export const arrayToObjects = (sheetData: any): any[] => {
  if (!Array.isArray(sheetData) || sheetData.length < 1) return [];
  
  const headers = sheetData[0].map((h: any) => String(h || '').trim());
  if (sheetData.length < 2) return [];

  return sheetData.slice(1).map(row => {
    const obj: any = {};
    if (Array.isArray(row)) {
      headers.forEach((header, index) => {
        if (header) {
          obj[header] = row[index] !== undefined ? row[index] : "";
        }
      });
    }
    return obj;
  });
};

export const parseNumber = (val: any): number => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  const cleanStr = String(val).replace(/[^0-9.-]+/g, '');
  const num = Number(cleanStr);
  return isNaN(num) ? 0 : num;
};

export const parseBoolean = (val: any): boolean => {
  if (val === undefined || val === null) return false;
  const s = String(val).toUpperCase().trim();
  return s === 'TRUE' || s === 'YES' || val === true || val === 1 || s === 'ACTIVE' || s === 'ENABLED';
};

export const sanitizeUrl = (url: string) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://script.google.com')) return '';
  return trimmed;
};
