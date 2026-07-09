export async function submitLead(data) {
    // If running on local dev without a proxy or backend, we can fallback to direct call (for testing only)
    // But as per requirements, we target the local/Vercel serverless function endpoint.
    const url = '/api/affiliates';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to submit lead');
        }

        const result = await response.json();
        incrementLeadCount();
        return result.success;
    } catch (error) {
        console.error('CRM Submission Error:', error);
        throw error;
    }
}


function incrementLeadCount() {
  fetch("/api/leads-count", { method: "POST" }).catch((err) =>
    console.warn("[leads-count] Failed to increment:", err)
  );
}
