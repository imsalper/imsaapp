// Ortak yardımcı: her /api/*.js dosyası bunu kullanıp Claude'a istek atar.
// ANTHROPIC_API_KEY, Vercel projesinin Environment Variables ayarına
// eklenmeli (Settings > Environment Variables > ANTHROPIC_API_KEY = sk-ant-...).
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

async function callClaude(messages, systemPrompt, maxTokens) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY ortam değişkeni ayarlanmamış. Vercel Settings > Environment Variables'a ekle.");
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: maxTokens || 1200,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  const textBlock = (data.content || []).find((c) => c.type === "text");
  return textBlock ? textBlock.text : "";
}

module.exports = { callClaude };
