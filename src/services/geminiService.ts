import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  async getBusinessAdvice(query: string, category: string, language: string = 'English') {
    return this.withRetry(async () => {
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
    });
  },

  async analyzeMarket(product: string, country: string, language: string = 'English') {
    return this.withRetry(async () => {
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
    });
  },

  async getJurisdictionRiskAssessment(country: string, language: string = 'English') {
    return this.withRetry(async () => {
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
    });
  },

  async translateText(text: string, targetLanguage: string = 'English') {
    return this.withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate the following text into ${targetLanguage}. 
        Only return the translated text without any preamble or explanation.
        
        Text to translate:
        "${text}"`,
      });
      return response.text;
    });
  },

  async translateBatch(texts: {id: string, text: string}[], targetLanguage: string = 'English') {
    if (texts.length === 0) return [];
    
    return this.withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate the following ${texts.length} short business posts into ${targetLanguage}. 
        Return the result as a JSON array of objects with the schema:
        { "id": string, "translatedText": string }
        
        Match the "id" provided in the input.
        
        Input:
        ${JSON.stringify(texts)}`,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      try {
        const results = JSON.parse(response.text);
        return Array.isArray(results) ? results : [];
      } catch (e) {
        console.error("Batch translation parse error:", e);
        return [];
      }
    });
  },

  async withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error?.status === 'RESOURCE_EXHAUSTED' || error?.code === 429 || error?.message?.includes('quota');
      
      if (isRateLimit && retries > 0) {
        console.warn(`Rate limit hit. Retrying in ${delay}ms... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  },

  async generateStrategicPosts(count: number = 3, language: string = 'English') {
    return this.withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate ${count} strategic business updates in ${language} for a global business hub called GLOBAXYS. These updates are from high-level companies (nodes) in the network.
        
        Return the response as a JSON array of objects with the following schema:
        {
          "companyName": string,
          "content": string,
          "tags": string[],
          "mediaType": "image" | "video" | "none"
        }
        
        The content should be professional, data-driven, and involve topics like trade routes, logistics, AI scaling, or regulatory breakthroughs.
        Example company names: "Aether Dynamics", "Ironstone Ventures", "NexaFlow Systems".
        Make the tags relevant like #LOGISTICS, #AIR_CARGO, #AI_CORE.
        Media type can be "image", "video" or "none".
        
        IMPORTANT: The content must be in ${language}.`,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      try {
        return JSON.parse(response.text);
      } catch (e) {
        console.error("Failed to parse AI generated posts", e);
        return [];
      }
    });
  },

  async analyzeFeedForConnections(posts: any[], language: string = 'English') {
    const postsData = posts.map(p => ({
      company: p.companyName,
      content: p.content,
      tags: p.tags
    }));

    return this.withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are the GLOBAXYS AI Co-pilot. Analyze the following feed of strategic business updates and identify the 3 most critical "Synergy Connections" for optimal growth and operational efficiency.
        
        Feed Data: ${JSON.stringify(postsData)}
        
        For each suggestion:
        1. Identify the Target Company/Node.
        2. Explain the STRATEGIC WHY (Why connect now?).
        3. Suggest a concrete Action (e.g., "Request Logistics API sync").
        
        Format the response as a structured markdown with icons in ${language}. Keep it concise, high-impact, and futuristic.`,
      });
      return response.text;
    });
  }
};

