export async function generateImage(
  prompt: string,
  apiKey: string,
  size: "1024x1024" | "1024x1792" | "1792x1024" = "1024x1024"
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: `Clean, minimal vector illustration: ${prompt}. White background, no text, professional style.`,
      n: 1,
      size,
      quality: "hd",
      style: "natural",
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as Record<string, Record<string, string>>)?.error?.message ||
        `DALL-E API error: ${response.status}`
    );
  }

  const data = await response.json();
  const url = data.data?.[0]?.url;

  if (!url) {
    throw new Error("No image URL returned from DALL-E");
  }

  return url;
}
