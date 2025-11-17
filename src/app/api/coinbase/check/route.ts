import { NextRequest, NextResponse } from 'next/server'
import { supabase, SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import { getUserIdFromRequest } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'utilisateur depuis le token JWT
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        connected: false
      })
    }

    const token = authHeader.substring(7)

    // Vérifier le token JWT
    let userId: string
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key') as { userId: string }
      userId = decoded.userId
    } catch (jwtError) {
      return NextResponse.json({
        connected: false
      })
    }

    // Récupérer l'utilisateur
    const user = await SupabaseDatabaseService.getUserById(userId)
    if (!user) {
      return NextResponse.json({
        connected: false
      })
    }

    // Récupérer la clé Coinbase de l'utilisateur
    const { data: exchangeKey, error } = await supabase
      .from('exchange_keys')
      .select('status, last_sync_at, permissions')
      .eq('user_id', user.id)
      .eq('exchange_name', 'coinbase')
      .eq('status', 'active')
      .single()

    if (error || !exchangeKey) {
      return NextResponse.json({
        connected: false
      })
    }

    return NextResponse.json({
      connected: true,
      accountInfo: {
        lastSync: exchangeKey.last_sync_at,
        permissions: {
          read: true,
          trade: false,
          withdraw: false
        }
      }
    })
  } catch (error) {
    console.error('Erreur check connexion:', error)
    return NextResponse.json({
      connected: false
    })
  }
}
