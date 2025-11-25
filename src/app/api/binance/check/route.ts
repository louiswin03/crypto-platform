import { NextRequest, NextResponse } from 'next/server'
import { supabase, SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import { getUserIdFromRequest } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'utilisateur depuis le token JWT
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
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

    // Récupérer la clé Binance de l'utilisateur
    const { data: exchangeKey, error } = await supabase
      .from('exchange_keys')
      .select('status, last_sync_at, permissions')
      .eq('user_id', user.id)
      .eq('exchange_name', 'binance')
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
        accountType: 'SPOT',
        lastSync: exchangeKey.last_sync_at,
        permissions: {
          read: true,
          trade: false,
          withdraw: false
        }
      }
    })
  } catch (error) {

    return NextResponse.json({
      connected: false
    })
  }
}
