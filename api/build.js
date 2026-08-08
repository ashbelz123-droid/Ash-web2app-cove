export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const { website_url, app_name, package_name } = req.body || {};
    if (!website_url || !app_name || !package_name) return res.status(400).json({ error: 'Missing build details' });
    const url = new URL(website_url);
    if (url.protocol !== 'https:') return res.status(400).json({ error: 'HTTPS is required' });
    if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){2,}$/.test(package_name)) return res.status(400).json({ error: 'Invalid package name' });
    if (!process.env.GITHUB_TOKEN) return res.status(500).json({ error: 'Build service is not configured yet' });

    const response = await fetch('https://api.github.com/repos/ashbelz123-droid/Ash-web2app-cove/actions/workflows/build-apk.yml/dispatches', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ref: 'main', inputs: { website_url: url.toString(), app_name: String(app_name).slice(0, 30), package_name } })
    });
    if (!response.ok) return res.status(502).json({ error: 'GitHub build could not be started' });
    return res.status(202).json({ ok: true, message: 'Android build started. Check GitHub Actions for the APK artifact.' });
  } catch { return res.status(400).json({ error: 'Invalid build request' }); }
}
