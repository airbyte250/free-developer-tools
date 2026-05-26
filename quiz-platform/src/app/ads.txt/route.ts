import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const headersList = await headers()
  const hostname = headersList.get('x-tenant-host') || ''

  const tenant = await prisma.tenant.findUnique({
    where: { hostname },
    include: { adsTxt: true },
  })

  if (!tenant || tenant.adsTxt.length === 0) {
    // Default ads.txt with the tenant's publisher ID
    if (tenant && tenant.adClientId) {
      const pubId = tenant.adClientId.replace('ca-pub-', '')
      const content = `google.com, pub-${pubId}, DIRECT, f08c47fec0942fa0`
      return new Response(content, {
        headers: { 'Content-Type': 'text/plain' },
      })
    }
    return new Response('# No ads.txt configuration found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  const content = tenant.adsTxt.map(entry => entry.line).join('\n')
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
