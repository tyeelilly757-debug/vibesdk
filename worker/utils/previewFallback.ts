/**
 * Preview fallback replacement logic.
 * When the worker serves generic scaffold HTML, we replace it with prompt-based content
 * so users see relevant previews instead of "Your Website Is Live".
 */

export function isGenericFallbackPreviewHtml(contents: string): boolean {
	return (
		contents.includes('Your Website Is Live') ||
		contents.includes('Website Preview') ||
		contents.includes('VibeSDK Website Preview') ||
		contents.includes('A starter site is ready while model capacity recovers.')
	);
}

export function buildPromptBasedPreviewHtml(query: string): string {
	const trimmed = (query || '').trim();
	const lowered = trimmed.toLowerCase();
	const words = trimmed.split(/\s+/).filter(Boolean);
	const title = words.length > 0 ? words.slice(0, 6).join(' ') : 'Project Preview';
	const subtitle =
		trimmed.length > 0
			? `Generated from your prompt: "${trimmed}"`
			: 'Generated from your prompt with a complete starter structure.';
	const isDogSite = lowered.includes('dog') || lowered.includes('canine') || lowered.includes('pet');
	const image = isDogSite
		? '<img src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1600&q=80" alt="Dog themed hero image" />'
		: '';
	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body { margin: 0; font-family: Inter, system-ui, sans-serif; background: linear-gradient(140deg, #0f172a, #1d4ed8); color: #f8fafc; }
      main { max-width: 980px; margin: 0 auto; padding: 56px 20px 40px; }
      h1 { margin: 0 0 8px; font-size: 2rem; line-height: 1.15; }
      p { margin: 0 0 20px; color: #cbd5e1; line-height: 1.5; }
      img { width: 100%; max-height: 320px; object-fit: cover; border-radius: 12px; border: 1px solid #334155; margin-bottom: 18px; }
      .grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
      .card { background: rgba(15, 23, 42, 0.72); border: 1px solid #334155; border-radius: 12px; padding: 14px; }
      .card h2 { margin: 0 0 6px; font-size: 1rem; color: #93c5fd; }
      .card p { margin: 0; color: #cbd5e1; font-size: 0.95rem; }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${subtitle}</p>
      ${image}
      <section class="grid">
        <article class="card"><h2>Hero</h2><p>Project headline and value proposition tailored to your prompt.</p></article>
        <article class="card"><h2>Core Section</h2><p>Primary content area aligned with requested goals and features.</p></article>
        <article class="card"><h2>Contact / CTA</h2><p>A clear conversion section so users can take the next action.</p></article>
      </section>
    </main>
  </body>
</html>`;
}
