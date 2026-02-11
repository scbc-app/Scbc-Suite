
export const SENDER_NAME = "Sally Chanza Support Desk";
export const SUPPORT_EMAIL = "support@sallychanza.com";
export const MASTER_BCC = "lengwetembo@gmail.com"; 

/**
 * Normalizes an ID for resilient matching (Removes all whitespace and forces lowercase)
 */
export const normalizeID = (id: any): string => String(id || '').trim().toLowerCase().replace(/\s+/g, '');

/**
 * Resolves the appropriate email for an agent or falls back to support
 */
export const getAgentEmail = (agents: any[], agentId?: string) => {
  const normId = normalizeID(agentId);
  if (!normId || normId === '0') return SUPPORT_EMAIL;
  
  const agent = agents.find(a => normalizeID(a.AgentID) === normId);
  if (agent?.Email && agent.Email.includes('@')) return agent.Email.trim();
  return SUPPORT_EMAIL;
};
