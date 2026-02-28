import { describe, it, expect } from 'vitest';
import {
	isGenericFallbackPreviewHtml,
	buildPromptBasedPreviewHtml,
} from './previewFallback';

describe('previewFallback', () => {
	describe('isGenericFallbackPreviewHtml', () => {
		it('returns true for "Your Website Is Live"', () => {
			const html = '<html><body><h1>Your Website Is Live</h1></body></html>';
			expect(isGenericFallbackPreviewHtml(html)).toBe(true);
		});

		it('returns true for "Website Preview"', () => {
			const html = '<html><body><title>Website Preview</title></body></html>';
			expect(isGenericFallbackPreviewHtml(html)).toBe(true);
		});

		it('returns true for "A starter site is ready while model capacity recovers"', () => {
			const html =
				'<p>A starter site is ready while model capacity recovers.</p>';
			expect(isGenericFallbackPreviewHtml(html)).toBe(true);
		});

		it('returns false for custom content', () => {
			const html =
				'<html><body><h1>Pawfect Grooming Co.</h1><p>Dog grooming services</p></body></html>';
			expect(isGenericFallbackPreviewHtml(html)).toBe(false);
		});
	});

	describe('buildPromptBasedPreviewHtml', () => {
		it('produces NO "Your Website Is Live" - proving we replace fallback with real content', () => {
			const query = 'make me a website';
			const html = buildPromptBasedPreviewHtml(query);
			expect(html).not.toContain('Your Website Is Live');
			expect(html).not.toContain('Website Preview');
		});

		it('uses prompt words for title', () => {
			const query = 'make me a website for a dog grooming business';
			const html = buildPromptBasedPreviewHtml(query);
			expect(html).toContain('make me a website for a dog grooming business');
			expect(html).toContain(`Generated from your prompt: "${query}"`);
		});

		it('includes dog image when query mentions dog', () => {
			const query = 'put a dog image in there';
			const html = buildPromptBasedPreviewHtml(query);
			expect(html).toContain('Dog themed hero image');
			expect(html).toContain('images.unsplash.com');
			expect(html).toContain('<img ');
		});

		it('includes dog image when query mentions canine', () => {
			const html = buildPromptBasedPreviewHtml('canine care tips');
			expect(html).toContain('Dog themed hero image');
		});

		it('does NOT include dog image for non-dog queries', () => {
			const html = buildPromptBasedPreviewHtml('make a recipe website');
			expect(html).not.toContain('Dog themed hero image');
		});

		it('produces valid HTML that passes fallback check (replacement is not re-replaced)', () => {
			const query = 'dog grooming site with hero image';
			const html = buildPromptBasedPreviewHtml(query);
			expect(isGenericFallbackPreviewHtml(html)).toBe(false);
		});
	});
});
