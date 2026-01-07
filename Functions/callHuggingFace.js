/**
 * Call Hugging Face Inference API with custom token
 * Uses Qwen/Qwen2.5-Coder-32B-Instruct - one of the best open-source coding models
 */

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';
const DEFAULT_MODEL = 'Qwen/Qwen2.5-Coder-32B-Instruct';

function getHfToken(context, params) {
  return (
    params?.hf_token ||
    context?.secrets?.HF_TOKEN ||
    context?.env?.HF_TOKEN ||
    process.env.HF_TOKEN
  );
}

export default async function callHuggingFace(params = {}, context = {}) {
  const { messages, max_tokens = 2048, temperature = 0.7, model = DEFAULT_MODEL } = params;

  const hfToken = getHfToken(context, params);
  if (!hfToken) {
    return {
      success: false,
      error: 'Missing HF_TOKEN. Configure it in server secrets/environment.',
      retry: false,
    };
  }

  try {
    const response = await fetch(`${HUGGINGFACE_API_URL}/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: messages,
        parameters: {
          max_new_tokens: max_tokens,
          temperature,
          top_p: 0.9,
          repetition_penalty: 1.1,
          return_full_text: false,
        },
        options: {
          wait_for_model: true,
          use_cache: false,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 503) {
        return {
          success: false,
          error: 'Model is loading. Please try again shortly.',
          retry: true,
        };
      }

      return {
        success: false,
        error: `HF API error: ${response.status} - ${errorText}`,
        retry: false,
      };
    }

    const data = await response.json();

    let generatedText = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      generatedText = data[0].generated_text;
    } else if (data?.generated_text) {
      generatedText = data.generated_text;
    } else if (typeof data === 'string') {
      generatedText = data;
    } else {
      generatedText = JSON.stringify(data);
    }

    return {
      success: true,
      response: String(generatedText || '').trim(),
      model,
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || 'Unknown error',
      retry: false,
    };
  }
}

export const metadata = {
  name: 'callHuggingFace',
  description: 'Call Hugging Face Inference API with Qwen2.5-Coder for advanced code generation',
  parameters: {
    messages: {
      type: 'string',
      description: 'The full conversation context formatted as a prompt',
      required: true,
    },
    max_tokens: {
      type: 'number',
      description: 'Maximum tokens to generate (default: 2048)',
      required: false,
    },
    temperature: {
      type: 'number',
      description: 'Temperature for generation (0-1, default: 0.7)',
      required: false,
    },
    model: {
      type: 'string',
      description: 'Hugging Face model id (default: Qwen/Qwen2.5-Coder-32B-Instruct)',
      required: false,
    },
  },
};