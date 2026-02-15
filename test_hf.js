async function testHF() {
    // Small 1x1 base64 GIF for testing
    const base64Image = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    // Model: llava-hf/llava-1.5-7b-hf (Standard VLM)
    const url = "https://api-inference.huggingface.co/models/llava-hf/llava-1.5-7b-hf";

    console.log("Testing HF Inference API (No Token)...");

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: `USER: <image>\nWhat is this?\nASSISTANT:`,
                image: base64Image, // Some models allow this
                parameters: { max_new_tokens: 50 },
                wait_for_model: true
            })
        });

        console.log("Status:", response.status);
        const data = await response.text(); // Text mainly
        console.log("Body:", data.substring(0, 500));

    } catch (err) {
        console.error("Error:", err.message);
    }
}

testHF();
