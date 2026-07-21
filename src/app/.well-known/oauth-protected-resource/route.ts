/**
 * OAuth 2.0 Protected Resource Metadata (RFC 9728).
 * MCP clients hit this to discover which authorization server protects the
 * PorchLyte MCP server — Supabase Auth, acting as our OAuth 2.1 server.
 */
import {
  metadataCorsOptionsRequestHandler,
  protectedResourceHandler,
} from "mcp-handler";

const handler = protectedResourceHandler({
  authServerUrls: [`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`],
});

const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
