import { LichessUser } from '../types';
import { getSession } from '../auth/session';
import { buildApiUrl, RequestOptions } from './index';

/**
 * Fetches the current user's profile from Lichess
 * 
 * @param options - Request options
 * @returns The user's profile data or null if not authenticated
 */
export async function fetchUserProfile(options: RequestOptions = {}): Promise<LichessUser | null> {
  const session = await getSession();
  if (!session?.accessToken) return null;
  
  try {
    const url = buildApiUrl('account', {}, options);
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json() as LichessUser;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Options for fetching user games
 */
export interface GameListOptions {
  /** Maximum number of games to fetch */
  max?: number;
  /** Whether to only include rated games */
  rated?: boolean;
  /** Filter by performance type (e.g., "blitz", "rapid") */
  perfType?: string;
  /** Filter by color */
  color?: 'white' | 'black';
  /** Whether to only include analyzed games */
  analysed?: boolean;
  /** Whether to include ongoing games */
  ongoing?: boolean;
  /** Whether to include finished games */
  finished?: boolean;
  /** Whether to include the last position FEN */
  lastFen?: boolean;
  /** Whether to include moves */
  moves?: boolean;
  /** Whether to include PGN in JSON */
  pgnInJson?: boolean;
  /** Whether to include tags */
  tags?: boolean;
  /** Whether to include clock information */
  clocks?: boolean;
  /** Whether to include evaluations */
  evals?: boolean;
  /** Whether to include opening information */
  opening?: boolean;
}

/**
 * Fetches games for a user
 * 
 * @param username - Username to fetch games for (defaults to current user)
 * @param options - Options for filtering the games
 * @returns Array of games or null on error
 */
export async function fetchUserGames(
  username?: string, 
  options: GameListOptions = {}
) {
  const session = await getSession();
  if (!session?.accessToken) return null;
  
  // If no username provided, use current user
  const user = username || session.user.id;
  
  // Build query parameters
  const params: Record<string, string> = {};
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) {
      params[key] = String(value);
    }
  });
  
  try {
    const response = await fetch(buildApiUrl(`games/user/${user}`, params), {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    // Games API returns NDJSON, so we need to parse it line by line
    const text = await response.text();
    return text.trim().split('\n').map(line => JSON.parse(line));
  } catch (error) {
    console.error('Error fetching user games:', error);
    return null;
  }
}

/**
 * Fetches email address of the current user
 * Requires 'email:read' scope
 */
export async function fetchUserEmail(): Promise<string | null> {
  const session = await getSession();
  if (!session?.accessToken) return null;
  
  try {
    const response = await fetch(buildApiUrl('account/email'), {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.email;
  } catch (error) {
    console.error('Error fetching user email:', error);
    return null;
  }
}

/**
 * Fetches the current user's preferences
 * Requires 'preference:read' scope
 */
export async function fetchUserPreferences(): Promise<Record<string, any> | null> {
  const session = await getSession();
  if (!session?.accessToken) return null;
  
  try {
    const response = await fetch(buildApiUrl('account/preferences'), {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
}

/**
 * Fetches the current user's kid mode status
 * Requires 'preference:read' scope
 */
export async function fetchKidModeStatus(): Promise<boolean | null> {
  const session = await getSession();
  if (!session?.accessToken) return null;
  
  try {
    const response = await fetch(buildApiUrl('account/kid'), {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.kid;
  } catch (error) {
    console.error('Error fetching kid mode status:', error);
    return null;
  }
}