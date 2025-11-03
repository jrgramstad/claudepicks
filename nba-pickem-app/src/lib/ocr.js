import { supabase } from './supabase';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Missing OpenAI API key');
  console.error('Please add VITE_OPENAI_API_KEY to .env.local');
}

export const extractSlipData = async (imageFile) => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please add your Supabase credentials to .env.local');
  }

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to .env.local');
  }

  try {
    // Upload image to Supabase Storage
    const fileName = `${Date.now()}_${imageFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('slip-photos')
      .upload(`slips/${fileName}`, imageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('slip-photos')
      .getPublicUrl(uploadData.path);

    console.log('Image uploaded:', publicUrl);

    // Extract data with GPT-4 Vision
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are analyzing an Underdog Fantasy sports betting slip. Extract ALL information and return ONLY valid JSON (no markdown, no code blocks, no explanations):

{
  "entry_type": "string (e.g., '2-pick', '3-pick', '4-pick', 'flex')",
  "stake": number (dollar amount wagered, e.g., 25.00),
  "potential_return": number (potential payout if win),
  "multiplier": number (e.g., 3.0 for 3x, 6.0 for 6x),
  "promo_type": "string or null (e.g., 'profit_boost', 'deposit_match', 'free_entry')",
  "promo_value": "string or null (e.g., '50%', '100%', '$10')",
  "legs": [
    {
      "player": "string (full player name)",
      "market": "string (e.g., 'PTS+REB+AST', 'Points', 'Rebounds')",
      "direction": "over" or "under" (lowercase),
      "line": number (e.g., 25.5)
    }
  ]
}

CRITICAL: Return ONLY the JSON object. No markdown formatting. No code blocks. No extra text.
Be precise with numbers. Extract exact values from the slip.
If you cannot determine a value, use null.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: publicUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;

    console.log('GPT-4 Vision response:', content);

    // Parse JSON (handle potential markdown wrapper)
    let extractedData;
    try {
      // Try direct parse first
      extractedData = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON from markdown code block
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[1]);
      } else {
        console.error('Failed to parse OCR response:', content);
        throw new Error('Could not parse OCR response as JSON');
      }
    }

    // Validate extracted data
    if (!extractedData.legs || !Array.isArray(extractedData.legs)) {
      throw new Error('Invalid OCR response: missing legs array');
    }

    return {
      photoUrl: publicUrl,
      extractedData
    };

  } catch (error) {
    console.error('OCR extraction error:', error);
    throw error;
  }
};
