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

    console.log(`Webflow API: ${options.method || 'GET'} ${endpoint}`);
    if (options.body) {
      console.log('Request body:', options.body);
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webflow API error response:', errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText };
      }
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

  // Get all sites (needed for asset uploads)
  async getSites() {
    return this.request('/sites');
  }

  // Step 1: Create asset metadata to get upload URL
  async createAssetMetadata(siteId, fileName, fileHash) {
    return this.request(`/sites/${siteId}/assets`, {
      method: 'POST',
      body: JSON.stringify({
        fileName,
        fileHash
      })
    });
  }

  // Step 2: Upload file to S3 using the provided upload details
  async uploadToS3(uploadUrl, uploadDetails, fileBuffer, contentType) {
    const formData = new FormData();

    // Add all the upload details from Webflow (order matters for S3)
    Object.entries(uploadDetails).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Add the file last
    formData.append('file', new Blob([fileBuffer], { type: contentType }));

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`S3 upload failed: ${response.status} - ${text}`);
    }

    return response;
  }

  // Complete asset upload workflow
  async uploadAsset(siteId, fileName, fileBuffer, contentType) {
    // Generate MD5 hash of file
    const crypto = await import('crypto');
    const fileHash = crypto.createHash('md5').update(Buffer.from(fileBuffer)).digest('hex');

    // Step 1: Get upload URL from Webflow
    const metadata = await this.createAssetMetadata(siteId, fileName, fileHash);

    // Step 2: Upload to S3
    await this.uploadToS3(
      metadata.uploadUrl,
      metadata.uploadDetails,
      fileBuffer,
      contentType
    );

    // Return the asset info
    return {
      fileId: metadata.id,
      url: metadata.hostedUrl || metadata.url,
      fileName: metadata.fileName
    };
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
