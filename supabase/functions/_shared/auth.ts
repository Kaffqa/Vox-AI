import { createClient } from 'npm:@supabase/supabase-js@2';

export interface AuthUser {
  id: string;
  email?: string;
  [key: string]: unknown;
}

/**
 * Validates the incoming request's Authorization header against Supabase Auth.
 * Returns the authenticated user object or throws an error.
 */
export async function validateUser(req: Request): Promise<AuthUser> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const authHeader = req.headers.get('Authorization');

  if (!authHeader) {
    throw new Error('Missing Authorization header');
  }

  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    throw new Error('Invalid Authorization header format');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }

  if (!user) {
    throw new Error('User not found');
  }

  return user as AuthUser;
}
