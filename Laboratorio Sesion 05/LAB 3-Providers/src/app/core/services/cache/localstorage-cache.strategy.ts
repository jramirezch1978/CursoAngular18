import { Injectable } from '@angular/core';
import { CacheStrategy } from '../../tokens/config.tokens';

interface StoredEntry<T> {
  value: T;
  expiry: number;
}

@Injectable()
export class LocalStorageCacheStrategy implements CacheStrategy {
  private readonly prefix = 'provias_cache_';
  
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;
      
      const entry: StoredEntry<T> = JSON.parse(item);
      
      if (Date.now() > entry.expiry) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }
      
      console.log(`[LocalStorageCache] Retrieved: ${key}`);
      return entry.value;
    } catch (error) {
      console.error('[LocalStorageCache] Error getting item:', error);
      return null;
    }
  }
  
  set<T>(key: string, value: T, ttl: number = 300000): void {
    try {
      console.log(`[LocalStorageCache] Storing: ${key} with TTL: ${ttl}ms`);
      const entry: StoredEntry<T> = {
        value,
        expiry: Date.now() + ttl
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.error('[LocalStorageCache] Error setting item:', error);
    }
  }
  
  remove(key: string): void {
    console.log(`[LocalStorageCache] Removing: ${key}`);
    localStorage.removeItem(this.prefix + key);
  }
  
  clear(): void {
    console.log(`[LocalStorageCache] Clearing all entries`);
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}
