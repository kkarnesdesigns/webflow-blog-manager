// Webflow API Integration Layer

const WEBFLOW_API_BASE = 'https://api.webflow.com/v2';

class WebflowAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'accept': 'application/json'
    };
  }

  async request(endpoint, options = {}) {
    const url = `${WEBFLOW_API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API request failed: ${response.status}`);
    }

    return response.json();
  }

  // Collection Items
  async getCollectionItems(collectionId, options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/collections/${collectionId}/items${query}`);
  }

  async getCollectionItem(collectionId, itemId) {
    return this.request(`/collections/${collectionId}/items/${itemId}`);
  }

  async createCollectionItem(collectionId, data, isDraft = true) {
    return this.request(`/collections/${collectionId}/items${isDraft ? '' : '/live'}`, {
      method: 'POST',
      body: JSON.stringify({ fieldData: data, isDraft })
    });
  }

  async updateCollectionItem(collectionId, itemId, data, isLive = false) {
    const endpoint = isLive
      ? `/collections/${collectionId}/items/${itemId}/live`
      : `/collections/${collectionId}/items/${itemId}`;

    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify({ fieldData: data })
    });
  }

  async deleteCollectionItem(collectionId, itemId) {
    return this.request(`/collections/${collectionId}/items/${itemId}`, {
      method: 'DELETE'
    });
  }

  // Publishing
  async publishItem(collectionId, itemId) {
    return this.request(`/collections/${collectionId}/items/publish`, {
      method: 'POST',
      body: JSON.stringify({ itemIds: [itemId] })
    });
  }

  // Get collection schema
  async getCollection(collectionId) {
    return this.request(`/collections/${collectionId}`);
  }
}

// Singleton instance
let webflowInstance = null;

export function getWebflowClient() {
  if (!webflowInstance) {
    const apiKey = process.env.WEBFLOW_API_KEY;
    if (!apiKey) {
      throw new Error('WEBFLOW_API_KEY is not configured');
    }
    webflowInstance = new WebflowAPI(apiKey);
  }
  return webflowInstance;
}

export default WebflowAPI;
