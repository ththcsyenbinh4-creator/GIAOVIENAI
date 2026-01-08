import { GoogleGenerativeAI } from '@google/generative-ai';

const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY is not defined');
    }
    return new GoogleGenerativeAI(apiKey);
};

export const getGeminiModel = (
    modelName: string = 'gemini-1.5-flash',
    config: {
        responseMimeType?: string;
        temperature?: number;
        maxOutputTokens?: number;
    } = {}
) => {
    const genAI = getGeminiClient();
    return genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
            temperature: config.temperature ?? 0.7,
            maxOutputTokens: config.maxOutputTokens,
            responseMimeType: config.responseMimeType,
        },
    });
};
