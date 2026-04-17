import { encrypt, decrypt } from './crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!
const IG_APP_ID = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID!
const IG_APP_SECRET = process.env.INSTAGRAM_CLIENT_SECRET!
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI!

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
    client_id: IG_APP_ID,
    redirect_uri: REDIRECT_URI,
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
      client_id: IG_APP_ID,
      client_secret: IG_APP_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      code,
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Failed to exchange code for token')
  return data.access_token
}

export function encryptToken(token: string): string {
  return encrypt(token, ENCRYPTION_KEY)
}

export function decryptToken(encrypted: string): string {
  return decrypt(encrypted, ENCRYPTION_KEY)
}

async function igFetch<T>(path: string, token: string): Promise<T> {
  const url = `https://graph.instagram.com${path}${path.includes('?') ? '&' : '?'}access_token=${token}`
  const res = await fetch(url)
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
