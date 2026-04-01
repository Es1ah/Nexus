const axios = require('axios');

async function test() {
    try {
        const apiKey = "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";
        console.log("Testing OpenRouter with key:", apiKey ? apiKey.substring(0, 15) + "..." : "missing");

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "google/gemini-2.0-flash-001",
                messages: [{ role: "user", content: "Say hello" }]
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://nexus-truth.engine",
                    "X-Title": "Nexus Truth Engine",
                },
            }
        );
        console.log("Success! Response:", response.data.choices[0].message.content);
    } catch (error) {
        console.error("Error calling OpenRouter:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data));
        } else {
            console.error(error.message);
        }
    }
}

test();
