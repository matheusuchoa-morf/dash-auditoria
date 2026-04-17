import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getProfile, getRecentMedia } from '@/lib/instagram-api'

export async function GET(req: NextRequest) {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) return authResult

  const encToken = req.cookies.get('ig_token_enc')?.value
  if (!encToken) return NextResponse.json({ error: 'Instagram not connected' }, { status: 400 })

  try {
    const [profile, media] = await Promise.all([
      getProfile(encToken),
      getRecentMedia(encToken, 12),
    ])
    return NextResponse.json({ profile, media })
  } catch (err) {
    console.error('[instagram/insights]', err)
    return NextResponse.json({ error: 'Failed to fetch Instagram data' }, { status: 502 })
  }
}
