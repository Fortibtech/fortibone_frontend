const fetch = require('node-fetch'); // If available, or use native fetch in newer node

async function test() {
    try {
        console.log('Fetching from http://localhost:8081/api/jobs...');
        const res = await fetch('http://localhost:8081/api/jobs');
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Data:', data);
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();
