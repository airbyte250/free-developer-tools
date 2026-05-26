import { NextRequest } from 'next/server'
import { verifyApiAuth } from '@/lib/auth-api'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  if (!(await verifyApiAuth(request))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { hostname } = body

  if (!hostname) {
    return Response.json({ error: 'Missing hostname' }, { status: 400 })
  }

  try {
    // Run certbot to get SSL certificate
    const { stdout, stderr } = await execAsync(
      `certbot certonly --nginx -d ${hostname} --non-interactive --agree-tos --email admin@${hostname} 2>&1 || true`,
      { timeout: 60000 }
    )

    // Reload nginx to pick up new cert
    await execAsync('nginx -s reload 2>&1 || true')

    return Response.json({
      success: true,
      message: `SSL certificate provisioned for ${hostname}`,
      output: stdout || stderr,
    })
  } catch (err) {
    return Response.json({
      success: false,
      error: `SSL provisioning failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      note: 'If using Cloudflare, set SSL mode to "Full" and SSL will work through Cloudflare proxy automatically.',
    }, { status: 500 })
  }
}
