
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AppState } from "../types";

// This simulates an AI analysis of the current "Spreadsheet" state
export const analyzeBusinessData = async (data: AppState): Promise<string> => {
  /* Fix: Use process.env.API_KEY directly as per GenAI guidelines and remove explicit type casting */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Calculate expiration metrics for the AI
  const today = new Date();
  const expiredContracts = data.contracts.filter(c => {
      const expiry = new Date(c.ExpiryDate);
      return c.ContractStatus === 'Active' && expiry < today;
  });
  
  const expiringSoon = data.contracts.filter(c => {
      const expiry = new Date(c.ExpiryDate);
      const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return c.ContractStatus === 'Active' && diffDays > 0 && diffDays <= 30;
  });

  // Minimize data payload for the prompt to avoid token limits in this demo
  const summaryData = {
    totalClients: data.clients.length,
    activeContracts: data.contracts.filter(c => c.ContractStatus === 'Active').length,
    expiredContractsCount: expiredContracts.length,
    expiringSoonCount: expiringSoon.length,
    overdueInvoicesAmount: data.invoices
      .filter(i => i.Status === 'Overdue')
      .reduce((acc, curr) => acc + curr.BalanceDue, 0),
    recentTickets: data.tickets.slice(0, 5),
    revenueTrend: data.invoices.slice(0, 10).map(i => ({ date: i.InvoiceDate, amount: i.TotalAmount }))
  };

  const prompt = `
    You are a Business Intelligence Analyst for a subscription-based service company (GPS, Dashcams, SaaS).
    Analyze the following JSON data summary from our internal system:
    
    ${JSON.stringify(summaryData, null, 2)}
    
    Please provide:
    1. A brief executive summary of health (Revenue, Client Activity).
    2. Proactive renewal strategy focusing on the ${summaryData.expiringSoonCount} contracts expiring soon.
    3. Actionable recommendation to reduce ${summaryData.expiredContractsCount} expired active contracts.
    4. Flag any critical issues (like high overdue balances).
    
    Format the output as a clean HTML snippet (no markdown code blocks, just <div>, <h3>, <p>, <ul>, <li> tags with Tailwind CSS classes).
    Use classes like 'text-lg font-bold text-slate-800' for headers, 'text-slate-600' for body.
    Keep it concise.
  `;

  try {
    // Correct method: use ai.models.generateContent with appropriate model and prompt.
    // Upgraded to 'gemini-3-pro-preview' as this is a complex reasoning/business analysis task.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    // Extract text output using the .text property (not a method) as per @google/genai guidelines
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "<div class='text-red-500'>Failed to generate analysis. Please try again later.</div>";
  }
};
