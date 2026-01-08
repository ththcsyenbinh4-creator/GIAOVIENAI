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
        safetySettings: [
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
            },
        ],
    });
};
