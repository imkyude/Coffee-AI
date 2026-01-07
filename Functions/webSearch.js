/**
 * Web search functionality using various search APIs
 */

export default async function webSearch(params = {}, context = {}) {
  const { query } = params;

  if (!query || typeof query !== 'string') {
    return {
      success: false,
      error: 'Missing required parameter: query',
    };
  }

  try {
    const llm = context?.base44?.integrations?.Core?.InvokeLLM;
    if (typeof llm !== 'function') {
      return {
        success: false,
        error: 'InvokeLLM integration is not available in this environment.',
      };
    }

    const result = await llm({
      prompt: `Answer this question accurately and concisely using up-to-date web context.\n\nQuestion: ${query}`,
      add_context_from_internet: true,
    });

    return {
      success: true,
      response: result,
      source: 'web_search',
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || 'Unknown error',
    };
  }
}

export const metadata = {
  name: 'webSearch',
  description: 'Search the web for factual, up-to-date information',
  parameters: {
    query: {
      type: 'string',
      description: 'The search query',
      required: true,
    },
  },
};