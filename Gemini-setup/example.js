/**
 * Example usage of the Gemini API for data analysis
 * 
 * This file demonstrates how to use the Gemini API configuration
 * to analyze different types of data.
 */

import { analyzeData, getGeminiModel } from './config.js';

async function exampleAnalysis() {
  console.log('📊 Gemini API Data Analysis Examples\n');
  
  try {
    // Example 1: Analyze JSON data
    console.log('Example 1: Analyzing JSON data...');
    const jsonData = {
      sales: [
        { month: 'January', revenue: 5000 },
        { month: 'February', revenue: 7500 },
        { month: 'March', revenue: 6200 }
      ],
      total: 18700
    };
    
    const analysis1 = await analyzeData(
      'Analyze this sales data and provide insights about trends and recommendations.',
      jsonData
    );
    console.log(analysis1);
    console.log('\n---\n');
    
    // Example 2: Analyze text data
    console.log('Example 2: Analyzing text data...');
    const textData = `
      Customer feedback:
      - Product quality is excellent
      - Shipping is slow
      - Customer service is responsive
      - Price is competitive
    `;
    
    const analysis2 = await analyzeData(
      'Summarize the key points from this customer feedback and suggest improvements.',
      textData
    );
    console.log(analysis2);
    console.log('\n---\n');
    
    // Example 3: Direct model usage
    console.log('Example 3: Using the model directly...');
    const model = getGeminiModel();
    const result = await model.generateContent('Explain machine learning in one paragraph.');
    const response = await result.response;
    console.log(response.text());
    
  } catch (error) {
    console.error('Error during analysis:', error.message);
  }
}

// Run examples
exampleAnalysis();