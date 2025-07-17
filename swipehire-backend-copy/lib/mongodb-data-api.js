/**
 * MongoDB Atlas Data API Client
 * Cloudflare Workers compatible - no MongoDB driver required
 */

class MongoDBDataAPI {
  constructor() {
    this.baseURL = process.env.MONGO_DATA_API_URL;
    this.apiKey = process.env.MONGO_DATA_API_KEY;
    this.dataSource = process.env.MONGO_DATA_SOURCE || 'Cluster0';
    this.database = process.env.MONGO_DATABASE || 'swipehire';
  }

  /**
   * Make HTTP request to MongoDB Data API
   */
  async makeRequest(endpoint, payload) {
    const url = `${this.baseURL}/action/${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'api-key': this.apiKey,
      },
      body: JSON.stringify({
        dataSource: this.dataSource,
        database: this.database,
        ...payload
      })
    });

    if (!response.ok) {
      throw new Error(`MongoDB Data API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Find documents with filtering and options
   */
  async find(collection, filter = {}, options = {}) {
    const payload = {
      collection,
      filter
    };

    if (options.limit) payload.limit = options.limit;
    if (options.skip) payload.skip = options.skip;
    if (options.sort) payload.sort = options.sort;
    if (options.projection) payload.projection = options.projection;

    const result = await this.makeRequest('find', payload);
    return result.documents || [];
  }

  /**
   * Find one document
   */
  async findOne(collection, filter, projection = null) {
    const payload = {
      collection,
      filter
    };

    if (projection) payload.projection = projection;

    const result = await this.makeRequest('findOne', payload);
    return result.document || null;
  }

  /**
   * Insert one document
   */
  async insertOne(collection, document) {
    const payload = {
      collection,
      document
    };

    const result = await this.makeRequest('insertOne', payload);
    return result;
  }

  /**
   * Insert multiple documents
   */
  async insertMany(collection, documents) {
    const payload = {
      collection,
      documents
    };

    const result = await this.makeRequest('insertMany', payload);
    return result;
  }

  /**
   * Update one document
   */
  async updateOne(collection, filter, update, upsert = false) {
    const payload = {
      collection,
      filter,
      update,
      upsert
    };

    const result = await this.makeRequest('updateOne', payload);
    return result;
  }

  /**
   * Update multiple documents
   */
  async updateMany(collection, filter, update, upsert = false) {
    const payload = {
      collection,
      filter,
      update,
      upsert
    };

    const result = await this.makeRequest('updateMany', payload);
    return result;
  }

  /**
   * Delete one document
   */
  async deleteOne(collection, filter) {
    const payload = {
      collection,
      filter
    };

    const result = await this.makeRequest('deleteOne', payload);
    return result;
  }

  /**
   * Delete multiple documents
   */
  async deleteMany(collection, filter) {
    const payload = {
      collection,
      filter
    };

    const result = await this.makeRequest('deleteMany', payload);
    return result;
  }

  /**
   * Count documents
   */
  async count(collection, filter = {}) {
    const payload = {
      collection,
      filter
    };

    const result = await this.makeRequest('count', payload);
    return result.count || 0;
  }

  /**
   * Aggregate pipeline
   */
  async aggregate(collection, pipeline) {
    const payload = {
      collection,
      pipeline
    };

    const result = await this.makeRequest('aggregate', payload);
    return result.documents || [];
  }

  /**
   * Batch operations for efficiency
   */
  async batchFind(queries) {
    const promises = queries.map(({ collection, filter, options }) => 
      this.find(collection, filter, options)
    );
    
    return Promise.all(promises);
  }

  /**
   * Health check for Data API
   */
  async healthCheck() {
    try {
      const start = Date.now();
      await this.count('users', {});
      const duration = Date.now() - start;
      
      return {
        healthy: true,
        responseTime: duration,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const mongoAPI = new MongoDBDataAPI();

module.exports = mongoAPI;