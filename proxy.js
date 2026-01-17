// proxy.js - Para evitar CORS
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

async function makeRequest(endpoint, data = {}) {
    const url = CORS_PROXY + API_URL + '?action=' + endpoint;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(data)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: error.message };
    }
}
