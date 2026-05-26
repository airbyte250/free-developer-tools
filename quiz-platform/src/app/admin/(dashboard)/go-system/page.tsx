'use client'

import { useState, useEffect, useRef } from 'react'

interface GoImage {
  id: string
  tileId: string
  link: string
  cols: number
  rows: number
  count: number
  width: number
  height: number
  createdAt: string
}

interface TenantInfo {
  id: string
  hostname: string
  status: string
}

export default function GoSystemPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [images, setImages] = useState<GoImage[]>([])
  const [tenants, setTenants] = useState<TenantInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('settings')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [settingsRes, imagesRes, tenantsRes] = await Promise.all([
        fetch('/api/admin/go-settings'),
        fetch('/api/admin/go-images'),
        fetch('/api/admin/tenants'),
      ])
      if (settingsRes.ok) setSettings(await settingsRes.json())
      if (imagesRes.ok) setImages(await imagesRes.json())
      if (tenantsRes.ok) {
        const tenantsData = await tenantsRes.json()
        setTenants(tenantsData.map((t: { id: string; hostname: string; status: string }) => ({ id: t.id, hostname: t.hostname, status: t.status })))
      }
    } catch (err) {
      console.error('Failed to load:', err)
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    setSaving(true)
    try {
      await fetch('/api/admin/go-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      alert('Settings saved!')
    } catch {
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function uploadImage(e: React.FormEvent) {
    e.preventDefault()
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)
    formData.append('link', settings.upload_link || '/go')
    formData.append('targetTiles', settings.target_tiles || '100')

    try {
      const res = await fetch('/api/admin/go-images', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message)
        loadData()
        if (fileInputRef.current) fileInputRef.current.value = ''
      } else {
        alert(data.error || 'Upload failed')
      }
    } catch {
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function deleteImage(tileId: string) {
    if (!confirm('Delete this image?')) return
    try {
      await fetch('/api/admin/go-images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tileId }),
      })
      setImages(images.filter((i) => i.tileId !== tileId))
    } catch {
      alert('Delete failed')
    }
  }

  function updateSetting(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Go System</h1>
        <p className="text-sm text-gray-500">Content management, media optimization & ad toolkit</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
        {['settings', 'images', 'ads', 'advanced'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'settings' && '⚙️ Settings'}
            {tab === 'images' && '🖼️ Go Images'}
            {tab === 'ads' && '📢 Ad Management'}
            {tab === 'advanced' && '🔧 Advanced'}
          </button>
        ))}
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Go URL Settings */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Go URL Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.go_enabled !== '0'}
                  onChange={(e) => updateSetting('go_enabled', e.target.checked ? '1' : '0')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-700">Enable /go URL redirect to random quiz/post</span>
              </label>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Restrict to Categories (comma-separated slugs)</label>
                <input
                  type="text"
                  value={settings.go_categories || ''}
                  onChange={(e) => updateSetting('go_categories', e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="Leave empty for all categories"
                />
              </div>
            </div>
          </div>

          {/* Tiles Image Visibility */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Tiles Image Visibility</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="tiles_visibility"
                  checked={settings.tiles_visibility !== 'all'}
                  onChange={() => updateSetting('tiles_visibility', 'go_only')}
                  className="h-4 w-4 border-gray-300 text-indigo-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">/go Users Only</span>
                  <p className="text-xs text-gray-500">Tiles image sirf /go URL se aane wale users ko dikhegi</p>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="tiles_visibility"
                  checked={settings.tiles_visibility === 'all'}
                  onChange={() => updateSetting('tiles_visibility', 'all')}
                  className="h-4 w-4 border-gray-300 text-indigo-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">All Users</span>
                  <p className="text-xs text-gray-500">Tiles image sabhi visitors ko dikhegi</p>
                </div>
              </label>
            </div>
          </div>

          {/* Facebook Browser Detection */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Facebook Browser Detection</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.fb_browser_detection === '1'}
                  onChange={(e) => updateSetting('fb_browser_detection', e.target.checked ? '1' : '0')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-700">Enable FB/Instagram browser detection</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.fb_browser_only === '1'}
                  onChange={(e) => updateSetting('fb_browser_only', e.target.checked ? '1' : '0')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-700">Show Go images to FB/IG in-app browser ONLY</span>
              </label>
              <p className="text-xs text-gray-500">When enabled, tiles will only appear for Facebook/Instagram in-app browser traffic</p>
            </div>
          </div>

          {/* Video Loading Animation */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Video Loading Animation</h2>
            <p className="mb-4 text-xs text-gray-500">When user clicks the Go image, show a video loading/buffering animation before redirecting</p>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.video_loading_enabled !== '0'}
                  onChange={(e) => updateSetting('video_loading_enabled', e.target.checked ? '1' : '0')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-700">Enable video loading animation on click</span>
              </label>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Loading Timer (seconds)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.video_loading_timer || '5'}
                  onChange={(e) => updateSetting('video_loading_timer', e.target.value)}
                  className="w-24 rounded-lg border px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Animation Style</label>
                <select
                  value={settings.video_loading_style || 'youtube'}
                  onChange={(e) => updateSetting('video_loading_style', e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="youtube">YouTube Style (Red progress bar + spinner)</option>
                  <option value="facebook">Facebook Video Style (Blue spinner)</option>
                  <option value="buffer">Buffer/Loading Style (Circular spinner)</option>
                  <option value="tiktok">TikTok Style (Pulsing dots)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Visit Count Redirect */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Visit Count Redirect</h2>
            <p className="mb-4 text-xs text-gray-500">Redirect users to a custom URL after they visit /go a certain number of times</p>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.visit_redirect_enabled === '1'}
                  onChange={(e) => updateSetting('visit_redirect_enabled', e.target.checked ? '1' : '0')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-700">Enable redirect after X visits</span>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Visit Threshold</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.visit_redirect_count || '3'}
                    onChange={(e) => updateSetting('visit_redirect_count', e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">Redirect after this many visits</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Cookie Expiry (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="43200"
                    value={settings.visit_redirect_expiry || '30'}
                    onChange={(e) => updateSetting('visit_redirect_expiry', e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Redirect URL</label>
                <input
                  type="url"
                  value={settings.visit_redirect_url || ''}
                  onChange={(e) => updateSetting('visit_redirect_url', e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="https://example.com/offer"
                />
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.visit_redirect_reset !== '0'}
                  onChange={(e) => updateSetting('visit_redirect_reset', e.target.checked ? '1' : '0')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-700">Reset count after redirect</span>
              </label>
            </div>
          </div>

          {/* Display Settings */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Display Settings</h2>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.hide_featured_image !== '0'}
                onChange={(e) => updateSetting('hide_featured_image', e.target.checked ? '1' : '0')}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
              />
              <span className="text-sm font-medium text-gray-700">Hide featured image when Go image is displayed</span>
            </label>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : '💾 Save Settings'}
          </button>
        </div>
      )}

      {/* Go Images Tab */}
      {activeTab === 'images' && (
        <div className="space-y-6">
          {/* Upload Form */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Upload New Go Image</h2>
            <p className="mb-4 text-sm text-gray-500">Image will be auto-split into tiles for canvas reassembly (looks like video thumbnail)</p>
            <form onSubmit={uploadImage} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Image File (JPG, PNG, WebP)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Click Link URL</label>
                <input
                  type="text"
                  value={settings.upload_link || '/go'}
                  onChange={(e) => updateSetting('upload_link', e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="/go"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Target Tiles Count</label>
                <input
                  type="number"
                  min="4"
                  max="400"
                  value={settings.target_tiles || '100'}
                  onChange={(e) => updateSetting('target_tiles', e.target.value)}
                  className="w-24 rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="rounded-lg bg-green-600 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-green-700 disabled:opacity-50"
              >
                {uploading ? 'Processing...' : '📤 Upload & Split Image'}
              </button>
            </form>
          </div>

          {/* Current Images */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Current Go Images ({images.length})</h2>
            {images.length === 0 ? (
              <p className="text-sm text-gray-500">No images uploaded yet.</p>
            ) : (
              <div className="space-y-4">
                {images.map((img) => (
                  <div key={img.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Tile ID: {img.tileId}</p>
                      <p className="text-xs text-gray-500">
                        Grid: {img.cols}x{img.rows} ({img.count} tiles) | Link: {img.link}
                      </p>
                      <p className="text-xs text-gray-400">
                        Created: {new Date(img.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteImage(img.tileId)}
                      className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ad Management Tab */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
          {/* Ads Visibility */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Ads Visibility</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="ads_visibility"
                  checked={settings.ads_visibility !== 'go_only'}
                  onChange={() => updateSetting('ads_visibility', 'all')}
                  className="h-4 w-4 border-gray-300 text-indigo-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">All Users</span>
                  <p className="text-xs text-gray-500">Ads will show to every visitor</p>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="ads_visibility"
                  checked={settings.ads_visibility === 'go_only'}
                  onChange={() => updateSetting('ads_visibility', 'go_only')}
                  className="h-4 w-4 border-gray-300 text-indigo-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">/go Users Only</span>
                  <p className="text-xs text-gray-500">Ads will only show to visitors who came through /go URL</p>
                </div>
              </label>
            </div>
          </div>

          {/* Global Head/Body Code */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Global Ad Code</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Global Head Code</label>
                <textarea
                  value={settings.global_head_code || ''}
                  onChange={(e) => updateSetting('global_head_code', e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border px-3 py-2 font-mono text-xs"
                  placeholder="Code injected into <head> (AdSense/AdX scripts, etc.)"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Global Body Code</label>
                <textarea
                  value={settings.global_body_code || ''}
                  onChange={(e) => updateSetting('global_body_code', e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border px-3 py-2 font-mono text-xs"
                  placeholder="Code injected before </body>"
                />
              </div>
            </div>
          </div>

          {/* Header Ad */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Header Ad (Below Title)</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.header_ad_enabled === '1'}
                  onChange={(e) => updateSetting('header_ad_enabled', e.target.checked ? '1' : '0')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-700">Enable header ad</span>
              </label>
              <textarea
                value={settings.header_ad_code || ''}
                onChange={(e) => updateSetting('header_ad_code', e.target.value)}
                rows={4}
                className="w-full rounded-lg border px-3 py-2 font-mono text-xs"
                placeholder="Ad code HTML"
              />
            </div>
          </div>

          {/* In-Content Ad 1 */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">In-Content Ad 1 (After 3rd Paragraph)</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.in_content_1_enabled === '1'}
                  onChange={(e) => updateSetting('in_content_1_enabled', e.target.checked ? '1' : '0')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-700">Enable in-content ad after 3rd paragraph</span>
              </label>
              <textarea
                value={settings.in_content_1_code || ''}
                onChange={(e) => updateSetting('in_content_1_code', e.target.value)}
                rows={4}
                className="w-full rounded-lg border px-3 py-2 font-mono text-xs"
                placeholder="Ad code HTML"
              />
            </div>
          </div>

          {/* In-Content Ad 2 */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">In-Content Ad 2 (After 6th Paragraph)</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.in_content_2_enabled === '1'}
                  onChange={(e) => updateSetting('in_content_2_enabled', e.target.checked ? '1' : '0')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-700">Enable in-content ad after 6th paragraph</span>
              </label>
              <textarea
                value={settings.in_content_2_code || ''}
                onChange={(e) => updateSetting('in_content_2_code', e.target.value)}
                rows={4}
                className="w-full rounded-lg border px-3 py-2 font-mono text-xs"
                placeholder="Ad code HTML"
              />
            </div>
          </div>

          {/* After Article Ad */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">After Article Ad</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.after_article_enabled === '1'}
                  onChange={(e) => updateSetting('after_article_enabled', e.target.checked ? '1' : '0')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-700">Enable after-article ad</span>
              </label>
              <textarea
                value={settings.after_article_code || ''}
                onChange={(e) => updateSetting('after_article_code', e.target.value)}
                rows={4}
                className="w-full rounded-lg border px-3 py-2 font-mono text-xs"
                placeholder="Ad code HTML"
              />
            </div>
          </div>

          {/* Reward Ad */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Reward Ad (Popup)</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.reward_ad_enabled === '1'}
                  onChange={(e) => updateSetting('reward_ad_enabled', e.target.checked ? '1' : '0')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm font-medium text-gray-700">Enable reward ad popup</span>
              </label>
              <textarea
                value={settings.reward_ad_code || ''}
                onChange={(e) => updateSetting('reward_ad_code', e.target.value)}
                rows={4}
                className="w-full rounded-lg border px-3 py-2 font-mono text-xs"
                placeholder="Reward ad code HTML"
              />
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : '💾 Save Ad Settings'}
          </button>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Go URLs (Per Domain)</h2>
            <p className="mb-4 text-sm text-gray-500">Har domain ki apni /go URL hai. Share karo — visitor random quiz pe redirect hoga aur /go user mark ho jayega.</p>
            {tenants.length === 0 ? (
              <p className="text-sm text-gray-500">Koi domain register nahi hai. Tenants page se domain add karo.</p>
            ) : (
              <div className="space-y-3">
                {tenants.filter(t => t.status === 'active').map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border bg-gray-50 px-4 py-3">
                    <div>
                      <code className="rounded bg-indigo-50 px-2 py-1 text-sm font-bold text-indigo-700">
                        https://{t.hostname}/go
                      </code>
                      <p className="mt-1 text-xs text-gray-500">{t.hostname} ke quiz pe redirect karega</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://${t.hostname}/go`)
                        alert('Copied!')
                      }}
                      className="rounded-lg bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-200"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">How It Works</h2>
            <div className="rounded-lg bg-gray-50 p-4">
              <ol className="list-inside list-decimal space-y-2 text-sm text-gray-700">
                <li><strong>User visits /go</strong> → random quiz page pe redirect + <code className="rounded bg-gray-200 px-1 text-xs">_t=1</code> cookie set</li>
                <li><strong>Quiz page pe</strong> → Go image tiles load hoti hain (canvas reassembly + play button overlay)</li>
                <li><strong>User clicks image</strong> → video loading animation (YouTube/Facebook/Buffer/TikTok style)</li>
                <li><strong>Timer end hone pe</strong> → redirect to link URL (more ad impressions)</li>
              </ol>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Status</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border bg-gray-50 p-3 text-center">
                <p className="text-2xl font-bold text-indigo-600">{tenants.filter(t => t.status === 'active').length}</p>
                <p className="text-xs text-gray-500">Active Domains</p>
              </div>
              <div className="rounded-lg border bg-gray-50 p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{images.length}</p>
                <p className="text-xs text-gray-500">Go Images</p>
              </div>
              <div className="rounded-lg border bg-gray-50 p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{settings.go_enabled !== '0' ? 'ON' : 'OFF'}</p>
                <p className="text-xs text-gray-500">Go Redirect</p>
              </div>
              <div className="rounded-lg border bg-gray-50 p-3 text-center">
                <p className="text-2xl font-bold text-orange-600">{settings.video_loading_timer || '5'}s</p>
                <p className="text-xs text-gray-500">Loading Timer</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
