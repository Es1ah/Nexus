import axios from "axios";

/**
 * Shared AI Calling utility with retry and fallback logic.
 * Ensures the 'AI link' is as reliable as possible.
 */
export async function callAI(
    prompt: string,
    options: {
        model?: string;
        maxTokens?: number;
        temperature?: number;
        attempt?: number;
    } = {}
): Promise<string> {
    const {
        model = "google/gemini-2.0-flash-001",
        maxTokens = 2500,
        temperature = 0.1,
        attempt = 0
    } = options;

    const MAX_RETRIES = 2;
    const openRouterApiKey = process.env.OPENROUTER_API_KEY || "";
    const zhipuApiKey = process.env.ZAI_API_KEY || "";

    try {
        console.log(`[Nexus AI] Calling OpenRouter (Attempt ${attempt + 1}, Model: ${model})...`);
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: model,
                messages: [{ role: "user", content: prompt }],
                max_tokens: maxTokens,
                temperature: temperature,
            },
            {
                headers: {
                    Authorization: `Bearer ${openRouterApiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://nexus-truth.engine",
                    "X-Title": "Nexus Truth Engine",
                },
                timeout: 45000, // 45s timeout for deep audits
            }
        );

        if (!response.data?.choices?.[0]?.message?.content) {
            throw new Error("Empty response from OpenRouter");
        }

        return response.data.choices[0].message.content as string;
    } catch (error: any) {
        console.error(`[Nexus AI] OpenRouter Error (Attempt ${attempt + 1}):`, error.message);

        // Retry before falling back
        if (attempt < MAX_RETRIES) {
            const delay = 1000 * (attempt + 1);
            console.log(`[Nexus AI] Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return callAI(prompt, { ...options, attempt: attempt + 1 });
        }

        // --- FALLBACK TO ZHIPU AI (GLM) IF OPENROUTER IS DOWN ---
        if (zhipuApiKey) {
            try {
                console.log("[Nexus AI] Falling back to Zhipu AI (GLM-4)...");
                const zResponse = await axios.post(
                    "https://open.bigmodel.cn/api/paas/v4/chat/completions",
                    {
                        model: "glm-4-plus", // Use high-performance GLM model
                        messages: [{ role: "user", content: prompt }],
                        max_tokens: maxTokens,
                        temperature: temperature,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${zhipuApiKey}`,
                            "Content-Type": "application/json",
                        },
                        timeout: 30000,
                    }
                );
                
                if (zResponse.data?.choices?.[0]?.message?.content) {
                    return zResponse.data.choices[0].message.content as string;
                }
            } catch (zError: any) {
                console.error("[Nexus AI] Zhipu Fallback also failed:", zError.message);
            }
        }

        throw error;
    }
}
