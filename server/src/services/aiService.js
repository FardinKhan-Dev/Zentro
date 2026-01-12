import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

/**
 * AI Service using Google Gemini
 * Provides AI-powered features for product descriptions, content generation, etc.
 */



/**
 * Initialize Gemini AI
 */

const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not found. AI features are disabled.');
    }
    return new GoogleGenAI(apiKey);
};

/**
 * Generate product description using AI
 * @param {Object} productData - Product information
 * @returns {Promise<string>} Generated description
 */
export const generateProductDescription = async (productData) => {
    const { name, category, brand, features, specifications } = productData;

    const prompt = `You are a professional e-commerce copywriter. Generate a compelling, SEO-optimized product description for the following product:

Product Name: ${name}
Category: ${category || 'General'}
Brand: ${brand || 'N/A'}
Key Features: ${features?.join(', ') || 'N/A'}
Specifications: ${specifications ? JSON.stringify(specifications) : 'N/A'}

Requirements:
1. Write 2-3 engaging paragraphs (150-200 words total)
2. Highlight key benefits and features
3. Use persuasive language without being overly salesy
4. Include relevant keywords for SEO
5. Focus on how it solves customer problems
6. End with a subtle call-to-action

Generate only the description text, no additional formatting or headers.`;

    try {
        const genAI = getGenAI();
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        return response.text().trim();
    } catch (error) {
        console.error('Gemini AI generation error:', error);
        throw new Error(`AI generation failed: ${error.message}`);
    }
};

/**
 * Generate product tags/keywords using AI
 * @param {Object} productData - Product information
 * @returns {Promise<string[]>} Array of relevant tags
 */
export const generateProductTags = async (productData) => {
    const { name, category, description } = productData;

    const prompt = `Generate 5-8 relevant product tags/keywords for SEO optimization.

Product Name: ${name}
Category: ${category}
Description: ${description?.substring(0, 200) || 'N/A'}

Return ONLY a comma-separated list of tags, no explanations. Example: smartphone, android, 5g, budget phone, camera`;

    try {
        const genAI = getGenAI();
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        const tagsText = response.text().trim();

        // Parse tags
        const tags = tagsText
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0)
            .slice(0, 8); // Limit to 8 tags

        return tags;
    } catch (error) {
        console.error('Tag generation error:', error);
        throw new Error(`Tag generation failed: ${error.message}`);
    }
};

/**
 * Enhance product title for SEO
 * @param {string} originalTitle - Original product title
 * @param {string} category - Product category
 * @returns {Promise<string>} Enhanced title
 */
export const enhanceProductTitle = async (originalTitle, category) => {
    const prompt = `Enhance this product title for better SEO and customer appeal:

Original Title: ${originalTitle}
Category: ${category}

Requirements:
1. Keep it under 60 characters
2. Include relevant keywords
3. Make it more descriptive and appealing
4. Maintain the core product identity
5. Return ONLY the enhanced title, nothing else`;

    try {
        const genAI = getGenAI();
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        const enhancedTitle = response.text().trim();

        // Ensure it's not too long
        return enhancedTitle.substring(0, 60);
    } catch (error) {
        console.error('Title enhancement error:', error);
        throw new Error(`Title enhancement failed: ${error.message}`);
    }
};

/**
 * Generate FAQ for a product
 * @param {Object} productData - Product information
 * @returns {Promise<Array>} Array of FAQ objects {question, answer}
 */
export const generateProductFAQ = async (productData) => {
    const { name, category, description, specifications } = productData;

    const prompt = `Generate 5 frequently asked questions and answers for this product:

Product: ${name}
Category: ${category}
Description: ${description?.substring(0, 300)}
Specs: ${specifications ? JSON.stringify(specifications).substring(0, 200) : 'N/A'}

Return in this exact JSON format:
[
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."}
]

Keep answers concise (2-3 sentences each). Return ONLY valid JSON, no additional text.`;

    try {
        const genAI = getGenAI();
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        let faqText = response.text().trim();

        // Remove markdown code blocks if present
        faqText = faqText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        const faqs = JSON.parse(faqText);
        return faqs.slice(0, 5); // Ensure max 5 FAQs
    } catch (error) {
        console.error('FAQ generation error:', error);
        throw new Error(`FAQ generation failed: ${error.message}`);
    }
};

/**
 * Check if AI service is available
 * @returns {boolean}
 */
export const isAIAvailable = () => {
    return !!process.env.GEMINI_API_KEY;
};

export default {
    generateProductDescription,
    generateProductTags,
    enhanceProductTitle,
    generateProductFAQ,
    isAIAvailable,
};
