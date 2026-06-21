/**
 * GET /api/contracts/[id]/download?path=<storagePath>
 *
 * Génère une URL signée Supabase Storage et redirige l'utilisateur.
 * Vérifie que le contrat appartient bien à l'utilisateur connecté (protection RLS manuelle).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const storagePath = request.nextUrl.searchParams.get('path')
  if (!storagePath) {
    return new NextResponse('Missing path parameter', { status: 400 })
  }

  // Vérifier que le contrat appartient à l'utilisateur
  const { data: contract } = await supabase
    .from('contracts')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!contract) {
    return new NextResponse('Not found', { status: 404 })
  }

  // Générer une URL signée valable 5 minutes (usage unique implicite)
  const { data, error } = await supabase.storage
    .from('contracts')
    .createSignedUrl(storagePath, 300)

  if (error || !data?.signedUrl) {
    return new NextResponse('Could not generate download URL', { status: 500 })
  }

  return NextResponse.redirect(data.signedUrl)
}
