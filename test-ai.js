const axios = require('axios');
const apiKey = "35735b354f48463bbbdde949a5ae36d4.2GaUb7FSXZHVgXmf";

async function test() {
    try {
        console.log("Testing Zhipu AI with key:", apiKey.substring(0, 10) + "...");
        const response = await axios.post(
            "https://open.bigmodel.cn/api/paas/v4/chat/completions",
            {
                model: "glm-4.5-air",
                messages: [{ role: "user", content: "Say hello" }],
                max_tokens: 10,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("Success! Response:", response.data.choices[0].message.content);
    } catch (error) {
        console.error("Error calling Zhipu AI:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data));
        } else {
            console.error(error.message);
        }
    }
}

test();
