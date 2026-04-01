const axios = require('axios');
const apiKey = "35735b354f48463bbbdde949a5ae36d4.2GaUb7FSXZHVgXmf";

async function test() {
    try {
        console.log("Fetching available models...");
        const response = await axios.get(
            "https://open.bigmodel.cn/api/paas/v4/models",
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            }
        );
        console.log("Models:", JSON.stringify(response.data.data.map(m => m.id), null, 2));
    } catch (error) {
        console.error("Error fetching models:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data));
        } else {
            console.error(error.message);
        }
    }
}

test();
