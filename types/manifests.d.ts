export type InstallationPolicy =
  "NOT_AVAILABLE" | "AVAILABLE" | "INSTALLED_BY_DEFAULT";

export type AuthenticationPolicy = "ON_INSTALL" | "ON_USE";

export interface MarketplacePolicy {
  installation: InstallationPolicy;
  authentication: AuthenticationPolicy;
  products?: readonly string[];
}

export interface LocalPluginSource {
  source: "local";
  path: `./${string}`;
}

export interface UrlPluginSource {
  source: "url";
  url: `https://${string}`;
  ref?: string;
  sha?: string;
}

export interface GitSubdirectoryPluginSource {
  source: "git-subdir";
  url: `https://${string}`;
  path: `./${string}`;
  ref?: string;
  sha?: string;
}

export interface NpmPluginSource {
  source: "npm";
  package: string;
  version?: string;
  registry?: `https://${string}`;
}

export type PluginSource =
  | LocalPluginSource
  | UrlPluginSource
  | GitSubdirectoryPluginSource
  | NpmPluginSource;

export interface MarketplacePluginEntry {
  name: string;
  source: PluginSource;
  policy: MarketplacePolicy;
  category: string;
}

export interface MarketplaceManifest {
  name: string;
  interface: {
    displayName: string;
  };
  plugins: readonly MarketplacePluginEntry[];
}

export interface PluginAuthor {
  name: string;
  email?: string;
  url?: `https://${string}`;
}

export interface PluginInterface {
  displayName: string;
  shortDescription: string;
  longDescription: string;
  developerName: string;
  category: string;
  capabilities: readonly string[];
  defaultPrompt?: string | readonly string[];
  default_prompt?: string | readonly string[];
  brandColor?: `#${string}`;
  composerIcon?: `./assets/${string}`;
  logo?: `./assets/${string}`;
  logoDark?: `./assets/${string}`;
  screenshots?: readonly `./assets/${string}`[];
  websiteURL?: `https://${string}`;
  privacyPolicyURL?: `https://${string}`;
  termsOfServiceURL?: `https://${string}`;
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: PluginAuthor;
  interface: PluginInterface;
  id?: string;
  homepage?: `https://${string}`;
  repository?: `https://${string}`;
  license?: string;
  keywords?: readonly string[];
  skills?: "./skills" | "./skills/";
  apps?: "./.app.json";
  mcpServers?: "./.mcp.json" | Record<string, object>;
}
