import { encrypt, decrypt } from './crypto'

function requireEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Missing required environment variable: ${name}`)
  return val
}

function getEncryptionKey() { return requireEnv('ENCRYPTION_KEY') }
function getIGAppId() { return requireEnv('NEXT_PUBLIC_INSTAGRAM_APP_ID') }
function getIGAppSecret() { return requireEnv('INSTAGRAM_CLIENT_SECRET') }
function getRedirectUri() { return requireEnv('INSTAGRAM_REDIRECT_URI') }

export interface IGProfile {
  id: string
  username: string
  name: string
  biography: string
  profile_picture_url: string
  website: string
  followers_count: number
  media_count: number
}

export interface IGMedia {
  id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  permalink: string
  caption?: string
  timestamp: string
  like_count?: number
  comments_count?: number
}

export function getOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: getIGAppId(),
    redirect_uri: getRedirectUri(),
    scope: 'instagram_basic,instagram_manage_insights',
    response_type: 'code',
    state,
  })
  return `https://api.instagram.com/oauth/authorize?${params}`
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const res = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: getIGAppId(),
      client_secret: getIGAppSecret(),
      grant_type: 'authorization_code',
      redirect_uri: getRedirectUri(),
      code,
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Failed to exchange code for token')
  return data.access_token
}

export function encryptToken(token: string): string {
  return encrypt(token, getEncryptionKey())
}

export function decryptToken(encrypted: string): string {
  return decrypt(encrypted, getEncryptionKey())
}

async function igFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://graph.instagram.com${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Instagram API error: ${res.status}`)
  return res.json()
}

export async function getProfile(encryptedToken: string): Promise<IGProfile> {
  const token = decryptToken(encryptedToken)
  return igFetch<IGProfile>(
    '/me?fields=id,username,name,biography,profile_picture_url,website,followers_count,media_count',
    token
  )
}

export async function getRecentMedia(encryptedToken: string, limit = 12): Promise<IGMedia[]> {
  const token = decryptToken(encryptedToken)
  const data = await igFetch<{ data: IGMedia[] }>(
    `/me/media?fields=id,media_type,permalink,caption,timestamp,like_count,comments_count&limit=${limit}`,
    token
  )
  return data.data
}

export function guessPostFormat(media: IGMedia): 'reels' | 'carrossel' | 'estatico' {
  if (media.media_type === 'VIDEO') return 'reels'
  if (media.media_type === 'CAROUSEL_ALBUM') return 'carrossel'
  return 'estatico'
}

export function countPostsInLastDays(media: IGMedia[], days: number): number {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return media.filter(m => new Date(m.timestamp) > cutoff).length
}
