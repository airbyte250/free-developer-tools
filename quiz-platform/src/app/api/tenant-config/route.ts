import { getTenantConfig } from '@/lib/tenant'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const hostname = request.nextUrl.searchParams.get('hostname') || request.headers.get('x-tenant-host') || ''

  if (!hostname) {
    return Response.json({ error: 'hostname parameter required' }, { status: 400 })
  }

  const config = await getTenantConfig(hostname)

  if (!config) {
    return Response.json({ error: 'Tenant not found or inactive' }, { status: 404 })
  }

  return Response.json(config)
}
