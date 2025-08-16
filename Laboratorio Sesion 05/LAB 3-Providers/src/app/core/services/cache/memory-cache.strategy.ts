import { Injectable } from '@angular/core';
import { CacheStrategy } from '../../tokens/config.tokens';

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

@Injectable()
export class MemoryCacheStrategy implements CacheStrategy {
  private cache = new Map<string, CacheEntry<any>>();
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    console.log(`[MemoryCache] Retrieved: ${key}`);
    return entry.value as T;
  }
  
  set<T>(key: string, value: T, ttl: number = 300000): void {
    console.log(`[MemoryCache] Storing: ${key} with TTL: ${ttl}ms`);
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }
  
  remove(key: string): void {
    console.log(`[MemoryCache] Removing: ${key}`);
    this.cache.delete(key);
  }
  
  clear(): void {
    console.log(`[MemoryCache] Clearing all entries`);
    this.cache.clear();
  }
}
