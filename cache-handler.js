const path = require('path');

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options;
    this.cache = new Map();
  }

  async get(key) {
    return this.cache.get(key);
  }

  async set(key, data, ctx) {
    this.cache.set(key, {
      value: data,
      lastModified: Date.now(),
      tags: ctx?.tags,
    });
  }

  async revalidateTag(tag) {
    for (const [key, value] of this.cache) {
      if (value.tags?.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }
};
