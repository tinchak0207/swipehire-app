import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { resumeText } = req.body;

  const prompt = `
    Analyze the following resume and provide suggestions for improvement.
    For each suggestion, provide the following information in JSON format:
    - id: a unique identifier for the suggestion
    - type: the type of suggestion (e.g., 'format', 'keyword', 'action-verb')
    - priority: the priority of the suggestion ('high', 'critical', or 'medium')
    - title: a brief title for the suggestion
    - description: a detailed description of the suggestion
    - section: the section of the resume where the suggestion applies
    - impact: a numerical score representing the impact of the suggestion
    - autoApplicable: a boolean indicating whether the suggestion can be automatically applied

    Resume text:
    ${resumeText}
  `;

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-tiny',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1024,
        n: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.statusText}`);
    }

    const data = await response.json();
    const suggestions = JSON.parse(data.choices[0].message.content);
    res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error fetching Mistral suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
}
