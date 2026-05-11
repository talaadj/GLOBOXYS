import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  async getBusinessAdvice(query: string, category: string, language: string = 'English') {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a high-level business consultant specializing in international trade, global economics, and cross-border law. 
      Category: ${category}
      Query: ${query}
      Language: ${language}
      
      Provide a professional, actionable response in ${language}. If the query is about law, mention that this is AI-generated advice and should be verified with local legal counsel. 
      Focus on helping the company solve its problems regarding partners, expansion, or regulations.`,
    });
    return response.text;
  },

  async analyzeMarket(product: string, country: string, language: string = 'English') {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the market potential for "${product}" in "${country}". 
      Include:
      1. Market Size & Demand (estimate)
      2. Regulatory Hurdles
      3. Potential Local Partners/Distributors
      4. Economic Climate
      5. Cultural Considerations for Success
      Provide the response in structured markdown in ${language}.`,
    });
    return response.text;
  },

  async getJurisdictionRiskAssessment(country: string, language: string = 'English') {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a high-level jurisdiction risk assessment for "${country}". 
      Focus on:
      1. Legal Stability (Contract enforcement, IP protection)
      2. Economic Risk (Inflation, Currency stability, Fiscal health)
      3. Regulatory Compliance Burden (Ease of doing business)
      4. Political Stability
      5. Overall Risk Rating (Low, Medium, High)
      
      Format with clear headings, use bullet points, and provide a short executive summary at the start in ${language}. Mention that this is AI-generated for informational purposes.`,
    });
    return response.text;
  },

  async translateText(text: string, targetLanguage: string = 'English') {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following text into ${targetLanguage}. 
      Only return the translated text without any preamble or explanation.
      
      Text to translate:
      "${text}"`,
    });
    return response.text;
  }
};

