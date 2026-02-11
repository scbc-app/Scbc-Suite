
import { AppState } from '../types';
import { addToLog, sanitizeUrl, internalLog } from './googleSheetsUtils';
import { mapRawDataToState } from './googleSheetsMappers';

export { internalLog };

/**
 * VillageVault CRUD Action Types
 */
export type CrudAction = 'create' | 'update' | 'delete';

/**
 * Options for synchronization, including automated email triggers and PDF attachments
 */
export interface SyncOptions {
  sendEmail?: boolean;
  recipientEmail?: string;    
  emailSubject?: string;
  emailHtml?: string;
  emailCc?: string;           
  emailBcc?: string;          
  replyTo?: string;           
  senderName?: string;        
  senderEmail?: string;       
  pdfAttachmentHtml?: string; 
  pdfFileName?: string;       
}

export const fetchSpreadsheetData = async (scriptUrl: string): Promise<Partial<AppState>> => {
  const sanitizedUrl = sanitizeUrl(scriptUrl);
  if (!sanitizedUrl) {
    throw new Error("Invalid or empty Database URL configured. Please check your settings.");
  }

  try {
    const response = await fetch(sanitizedUrl, { 
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow',
      referrerPolicy: 'no-referrer'
    });

    if (!response.ok) {
      throw new Error(`Database Error (${response.status}): ${response.statusText || 'Connection refused'}`);
    }

    const rawData = await response.json();
    return mapRawDataToState(rawData);
  } catch (error: any) {
    let msg = error.message || "Unknown Network Error";
    console.error("VillageVault Sync Failure:", msg);
    addToLog('System', 'FetchData', 'ERROR', msg);
    throw new Error(msg);
  }
};

export const syncRow = async (scriptUrl: string, sheetName: string, action: CrudAction, data: any, idKey: string, options?: SyncOptions) => {
    const sanitizedUrl = sanitizeUrl(scriptUrl);
    if (!sanitizedUrl) {
      throw new Error("Invalid or empty Database URL configured. Operation cancelled.");
    }

    const finalData = { ...data };
    if (options?.recipientEmail && !finalData.Email) {
        finalData.Email = options.recipientEmail;
    }

    const payload: any = {
        sheet: sheetName,
        action: action,
        idKey: idKey,
        id: data[idKey]
    };

    if (action === 'create' || action === 'update') {
        payload.data = finalData; 
    }

    if (options?.sendEmail) {
        payload.triggerEmail = true;
        payload.emailSubject = options.emailSubject;
        payload.emailHtml = options.emailHtml;
        payload.emailCc = options.emailCc;       
        payload.replyTo = options.replyTo;       
        payload.senderName = options.senderName; 
        payload.senderEmail = options.senderEmail; 
        
        if (options.pdfAttachmentHtml) {
          payload.pdfAttachmentHtml = options.pdfAttachmentHtml;
          payload.pdfFileName = options.pdfFileName || 'Document.pdf';
        }
    }

    try {
        const response = await fetch(sanitizedUrl, { 
            method: 'POST', 
            body: JSON.stringify(payload), 
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            mode: 'cors',
            redirect: 'follow',
            referrerPolicy: 'no-referrer'
        });
        
        if (!response.ok) {
          throw new Error(`Sync Server Error (${response.status}): ${response.statusText || 'Operation failed'}`);
        }

        const textResponse = await response.text();
        let result;
        try {
          result = JSON.parse(textResponse);
          addToLog(sheetName, action, 'SUCCESS', `Row synchronized successfully`, payload);
        } catch (e) {
          addToLog(sheetName, action, 'CRITICAL', 'Server returned invalid response format.', payload);
          throw new Error(`Server Response Error: Data received was not in valid JSON format.`);
        }

        if (result.status === 'error') {
          addToLog(sheetName, action, 'ERROR', result.message || 'Operation failed on server', payload);
          throw new Error(result.message);
        }
        return result;
    } catch (e: any) {
        let msg = e.message || "Network Failure";
        console.error("VillageVault POST Failure:", msg);
        addToLog(sheetName, action, 'FATAL', msg, payload);
        throw new Error(msg);
    }
};
