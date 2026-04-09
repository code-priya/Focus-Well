// This file runs on Vercel server (not exposed to browser)
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, type } = req.body;
    
    // Your API key is SAFE here - never sent to the browser
    const API_KEY = process.env.OPENAI_API_KEY;
    
    if (!API_KEY) {
        console.error('OPENAI_API_KEY not set in environment variables');
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        let systemPrompt = "You are a helpful study assistant for students.";
        let userPrompt = prompt;
        
        // Customize based on request type
        if (type === 'quiz') {
            systemPrompt = "You are a quiz generator. Generate 3 multiple choice questions. Return ONLY valid JSON array.";
            userPrompt = `Generate 3 multiple choice questions about "${prompt}". Format: [{"question":"...","options":["A","B","C","D"],"correct":0}]`;
        } else if (type === 'sentiment') {
            systemPrompt = "You are a student mental health assistant. Analyze sentiment and return JSON only.";
            const data = JSON.parse(prompt);
            userPrompt = `Analyze this student's message: "${data.text}". Workload: ${data.workload}. Return JSON: {"sentiment":"positive/neutral/negative/stressed","stressLevel":1-10,"advice":"short helpful tip","encouragement":"motivational quote"}`;
        }
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 800
            })
        });
        
        if (!response.ok) {
            const error = await response.text();
            console.error('OpenAI API error:', error);
            return res.status(500).json({ error: 'AI service error' });
        }
        
        const data = await response.json();
        const result = data.choices[0].message.content;
        
        res.status(200).json({ result });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
