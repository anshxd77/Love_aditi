const Groq = require('groq-sdk');

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function main() {
    try {
        const models = await client.models.list();
        const visionModels = models.data.filter(m => m.id.includes('vision'));
        console.log('Vision Models:', visionModels.map(m => m.id));
    } catch (err) {
        console.error('Error fetching models:', err);
    }
}

main();
