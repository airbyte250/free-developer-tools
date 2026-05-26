export async function GET() {
  const content = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /tiles/
Disallow: /admin/

Sitemap: /sitemap.xml
`
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
