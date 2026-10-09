import type { Client } from "@modelcontextprotocol/client";

type CallToolResult = Awaited<ReturnType<Client["callTool"]>>;

import type { Profile } from "./profiles.ts";
export interface Backend {
  query(name: string, args: Record<string, unknown>, signal?: AbortSignal): Promise<CallToolResult>;
  close(): Promise<void>;
  isAlive?(): boolean;
}
export type BackendFactory = (root: string, profile: Profile) => Promise<Backend>;
interface Entry {
  key: string;
  backend: Promise<Backend>;
  refs: number;
  lastUsed: number;
}
export class BackendPool {
  private entries = new Map<string, Entry>();
  private allocation: Promise<void> = Promise.resolve();
  private closed = false;
  private timer: NodeJS.Timeout;
  private factory: BackendFactory;
  private max: number;
  private idleMs: number;
  private cleanupError: unknown;
  constructor(options: { factory: BackendFactory; max?: number; idleMs?: number }) {
    this.factory = options.factory;
    this.max = options.max ?? 8;
    this.idleMs = options.idleMs ?? 300_000;
    this.timer = setInterval(
      () => {
        this.sweep().catch((error) => {
          this.cleanupError = error;
        });
      },
      Math.min(30_000, this.idleMs),
    );
    this.timer.unref();
  }
  get size(): number {
    return this.entries.size;
  }
  private async locked<T>(fn: () => Promise<T>): Promise<T> {
    const previous = this.allocation;
    let unlock: () => void = () => {};
    this.allocation = new Promise<void>((resolve) => {
      unlock = resolve;
    });
    await previous;
    try {
      return await fn();
    } finally {
      unlock();
    }
  }
  private async acquire(root: string, profile: Profile): Promise<Entry> {
    return this.locked(async () => {
      if (this.closed) throw new Error("Backend pool is closed");
      if (this.cleanupError)
        throw new Error("An idle backend failed to close", { cause: this.cleanupError });
      const key = JSON.stringify([root, profile]);
      let entry = this.entries.get(key);
      if (entry) {
        entry.refs++;
        return entry;
      }
      if (this.entries.size >= this.max) {
        const idle = [...this.entries.values()]
          .filter((e) => e.refs === 0)
          .sort((a, b) => a.lastUsed - b.lastUsed)[0];
        if (!idle) throw new Error("All backend slots are busy; retry later");
        this.entries.delete(idle.key);
        await (await idle.backend).close();
      }
      const backend = Promise.resolve().then(() => this.factory(root, profile));
      entry = { key, backend, refs: 1, lastUsed: Date.now() };
      this.entries.set(key, entry);
      return entry;
    });
  }
  async query(
    root: string,
    profile: Profile,
    name: string,
    args: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<CallToolResult> {
    if (signal?.aborted) throw signal.reason;
    const entry = await this.acquire(root, profile);
    let backend: Backend | undefined;
    try {
      backend = await entry.backend;
      if (signal?.aborted) throw signal.reason;
      return await backend.query(name, args, signal);
    } catch (error) {
      if (!backend || backend.isAlive?.() === false) {
        await this.locked(async () => {
          if (this.entries.get(entry.key) === entry) this.entries.delete(entry.key);
        });
        if (backend) await backend.close();
      }
      throw error;
    } finally {
      entry.refs--;
      entry.lastUsed = Date.now();
    }
  }
  private async sweep(): Promise<void> {
    await this.locked(async () => {
      for (const entry of this.entries.values()) {
        if (entry.refs === 0 && Date.now() - entry.lastUsed >= this.idleMs) {
          this.entries.delete(entry.key);
          await (await entry.backend).close();
        }
      }
    });
  }
  async close(): Promise<void> {
    clearInterval(this.timer);
    await this.locked(async () => {
      this.closed = true;
      const entries = [...this.entries.values()];
      this.entries.clear();
      const results = await Promise.allSettled(
        entries.map(async (e) => {
          const backend = await e.backend;
          await backend.close();
        }),
      );
      const failed = results.find((r) => r.status === "rejected");
      if (failed?.status === "rejected")
        throw new Error("Backend teardown failed", { cause: failed.reason });
    });
  }
}
