export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const API_KEY = process.env.OPENAI_API_KEY;

  if (!API_KEY) {
    console.error("Missing OpenRouter API key");
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const { prompt, type } = req.body;

    let systemPrompt = "You are a helpful study assistant for students.";
    let userPrompt = prompt;

    // 🎯 Feature logic
    if (type === "quiz") {
      systemPrompt =
        "You are a quiz generator. Generate 3 multiple choice questions. Return ONLY valid JSON array.";
      userPrompt = `Generate 3 multiple choice questions about "${prompt}". Format: [{"question":"...","options":["A","B","C","D"],"correct":0}]`;
    } else if (type === "sentiment") {
      systemPrompt =
        "You are a student mental health assistant. Analyze sentiment and return JSON only.";

      let parsed;
      try {
        parsed = JSON.parse(prompt);
      } catch {
        return res.status(400).json({ error: "Invalid JSON input" });
      }

      userPrompt = `Analyze this student's message: "${parsed.text}". Workload: ${parsed.workload}. Return JSON: {"sentiment":"positive/neutral/negative/stressed","stressLevel":1-10,"advice":"short helpful tip","encouragement":"motivational quote"}`;
    }

    // 🚀 OpenRouter API call
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://your-site.vercel.app", // optional but recommended
          "X-Title": "Focus Well App"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini", // ✅ FIXED MODEL
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      }
    );

    const data = await response.json();

    // ❗ Better error logging
    if (!response.ok) {
      console.error("OpenRouter FULL ERROR:", data);
      return res.status(500).json({ error: data });
    }

    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      console.error("Invalid response format:", data);
      return res.status(500).json({ error: "Invalid AI response" });
    }

    return res.status(200).json({ result });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
