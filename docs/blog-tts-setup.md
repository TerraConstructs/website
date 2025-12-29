# Blog TTS Setup Guide

This guide explains how to add text-to-speech (TTS) audio to blog posts using the ElevenLabs integration.

## Quick Start

### 1. Enable Audio in Frontmatter

Add the `audio` configuration to your blog post's frontmatter:

```yaml
---
title: "Your Post Title"
date: 2025-12-25
author: "Your Name"
audio:
  enabled: true
  voice: "8Ln42OXYupYsag45MAUy"  # Optional: defaults to Jay Wayne
---
```

### 2. Generate Audio

**Option A: Direct generation (uses auto-extracted text)**

```bash
export ELEVENLABS_API_KEY="your-api-key"
node scripts/generate-blog-audio.mjs --slug your-post-slug
```

**Option B: Human-in-the-loop review (recommended)**

```bash
# Step 1: Generate transcript for review
node scripts/generate-blog-audio.mjs --slug your-post-slug --review

# Step 2: Edit the generated transcript
# File location: blog/your-post-slug/transcript.txt

# Step 3: Generate audio from edited transcript
export ELEVENLABS_API_KEY="your-api-key"
node scripts/generate-blog-audio.mjs --slug your-post-slug
```

## Transcript Editing Best Practices

### What Gets Extracted

The script automatically:

1. **Adds metadata preamble**: "Title by Author, published on Date."
2. **Numbers main sections**: `## Heading` becomes "Section 1: Heading."
3. **Preserves body text**: All paragraphs and content
4. **Extracts JSX component data**: Labels, titles, descriptions from Stats, Milestones, etc.
5. **Includes Callout content**: Text from `<Callout>` components

### What You Should Edit

When reviewing `transcript.txt`, consider:

1. **Sub-headings**: Convert `###` headings to natural speech
   - Before: "DevOps Days Singapore"
   - After: "I spoke at DevOps Days Singapore about..."

2. **Technical terms**: Add pronunciation hints if needed
   - "CDKTF" → "C D K T F" or "CDK for Terraform"
   - "AWS" → "A W S"

3. **Lists**: Convert bullet points to narrative
   - Before: "- Feature A\n- Feature B"
   - After: "including Feature A and Feature B"

4. **Links**: The text is extracted, but you may want to rephrase
   - Before: "View archived version"
   - After: "you can view the archived version on the blog page"

5. **Code references**: Remove or rephrase technical snippets
   - Inline code is stripped automatically
   - But you may want to describe what the code does

6. **Add an outro**: Personal touch at the end
   - Example: "Thank you for listening to this blog post, do review the page for detailed links and visuals."

### Example Transcript Structure

```
2025 Year In Review by Vincent De Smet, published on December 25, 2025.

Section 1: TerraConstructs Milestones.

At the start of 2025, I launched the first iteration of the TerraConstructs website...

Section 2: Public Speaking.

I spoke at DevOps Days Singapore about...

[... content ...]

Thank you for listening to this blog post, do review the page for detailed links and visuals.
```

## Frontmatter Configuration

### Audio Settings

```yaml
audio:
  enabled: true    # Set to false to skip audio generation
  voice: "voice-id"  # Optional: ElevenLabs voice ID
```

### Available Voices

Default voice: **Jay Wayne** (`8Ln42OXYupYsag45MAUy`)

To use a different voice, find the voice ID from [ElevenLabs Voice Library](https://elevenlabs.io/voice-library) and add it to your frontmatter.

## Command Reference

### Generate for All Posts

```bash
export ELEVENLABS_API_KEY="your-api-key"
node scripts/generate-blog-audio.mjs
```

### Generate for Single Post

```bash
node scripts/generate-blog-audio.mjs --slug 2025-12-25-year-in-review
```

### Review Mode (Generate Transcripts)

```bash
node scripts/generate-blog-audio.mjs --review
node scripts/generate-blog-audio.mjs --slug your-slug --review
```

### API Key Management

**Option 1: Environment variable**
```bash
export ELEVENLABS_API_KEY="your-api-key"
```

**Option 2: From file** (recommended for local development)
```bash
echo "your-api-key" > elevenlabs-key
export ELEVENLABS_API_KEY="$(cat elevenlabs-key | tr -d '\n\r ')"
```

Note: `elevenlabs-key` is gitignored for security.

## Build Integration

### Production Workflow

Audio is published to S3 separately from the main site build to avoid Terraform conflicts:

```bash
# 1. Generate audio (if not already done)
export ELEVENLABS_API_KEY="your-api-key"
node scripts/generate-blog-audio.mjs --slug your-post-slug

# 2. Publish audio to S3 (requires AWS credentials)
export S3_BUCKET="your-site-bucket"
pnpm publish:audio

# 3. Build site (checks CDN for audio availability)
pnpm build
```

The build process:
1. Checks CloudFront CDN for each post with `audio.enabled: true`
2. Sets `hasAudio: true` in posts-metadata.json if found
3. SSR renders the floating audio player for posts with audio

### Full Build (for posts without S3 audio yet)

```bash
export ELEVENLABS_API_KEY="your-api-key"
pnpm build:full
```

This runs build + audio generation. Audio files go to `.audio-cache/` only.

## Local Testing

### Testing with Vite Dev Server

**Note:** Audio playback is not supported in Vite dev server mode. The floating audio player will show "Failed to load audio" because:
- Dev server doesn't serve audio from `.audio-cache/`
- Audio files are only on S3/CloudFront in production

To test audio locally, use `vite preview` with manual setup (see below).

### Testing with Vite Preview

To test the audio player locally with `vite preview`:

```bash
# 1. Build the site
pnpm build

# 2. Manually copy audio from cache to dist (temporary, for testing only)
mkdir -p dist/blog/your-post-slug
cp .audio-cache/your-post-slug.mp3 dist/blog/your-post-slug/audio.mp3

# 3. Preview locally
pnpm preview
```

**Important:** Do NOT commit audio files to dist/. They are managed separately via S3 to avoid Terraform conflicts. The manual copy is for local testing only.

## Audio Cache

Audio files are cached in `.audio-cache/` (gitignored) to prevent costly re-generation across builds.

**Cache priority:**
1. Check `.audio-cache/` first
2. Check CloudFront CDN second
3. Generate new audio if not found

**Clear cache:**
```bash
rm -rf .audio-cache/
```

## Troubleshooting

### Audio Only Contains End of Post

**Cause**: JSX component removal regex failed
**Solution**: Update the script (this was fixed in the latest version)

### Character Count Too Low

**Cause**: Text extraction stripped too much content
**Solution**: Use `--review` mode to inspect and edit the transcript

### Audio Not Generated

**Check:**
1. API key is set: `echo $ELEVENLABS_API_KEY`
2. Frontmatter has `audio.enabled: true` (required - audio is opt-in)
3. Script ran without errors: check console output

### Audio Player Shows "Failed to load audio"

**In Vite Dev Server:** This is expected - dev server doesn't serve audio files.

**In Vite Preview:** Manually copy audio to dist for testing:
```bash
cp .audio-cache/your-slug.mp3 dist/blog/your-slug/audio.mp3
```

**In Production:** Check that audio was published to S3:
```bash
curl -I https://terraconstructs.dev/blog/your-slug/audio.mp3
```

### Verbose Logging

The script automatically logs:
- Text extraction details (length, word count, preview)
- Audio stream type analysis
- Chunk processing (size, total bytes)

Use this output to diagnose issues.

## Architecture

```
blog/your-post-slug/
  ├── index.mdx              # Blog post content
  └── transcript.txt         # Optional: edited transcript for TTS

.audio-cache/
  └── your-post-slug.mp3     # Cached audio (gitignored, published to S3)

dist/blog/your-post-slug/
  └── index.html             # Rendered HTML (Terraform-managed)

dist/blog/
  ├── posts-metadata.json    # Includes hasAudio flag per post
  └── audio-manifest.json    # Metadata for generated audio files

S3 (production):
s3://your-bucket/blog/your-post-slug/
  ├── index.html             # From dist/ via Terraform
  └── audio.mp3              # Published via pnpm publish:audio
```

**Key points:**
- Audio files are NOT in dist/ (would conflict with Terraform)
- Audio is published separately to S3 via `publish:audio` script
- Build checks CloudFront CDN for audio availability
- `hasAudio` flag in posts-metadata.json drives audio player rendering

## Best Practices

1. **Always use --review mode first** for important posts
2. **Edit transcripts** to remove subheaders and technical formatting
3. **Add an outro** to thank listeners and direct them to the blog
4. **Test with --slug** before generating for all posts
5. **Commit transcript.txt** if you've edited it (helps with future re-generation)
6. **Cache persists across builds** - delete `.audio-cache/` if you want fresh audio

## Cost Considerations

- ElevenLabs charges per character
- A 1000-word post ≈ 8000 characters
- Cache prevents re-generation (saves money)
- Use `--slug` for testing to avoid processing all posts

## Examples

### New Post with Audio

```yaml
---
title: "Getting Started with CDKTF"
date: 2025-12-28
author: "Your Name"
tags:
  - cdktf
  - terraform
excerpt: "Learn how to use CDK for Terraform"
audio:
  enabled: true
---

Your content here...
```

### Post Without Audio

```yaml
---
title: "Quick Update"
date: 2025-12-28
author: "Your Name"
audio:
  enabled: false
---
```

### Custom Voice

```yaml
---
audio:
  enabled: true
  voice: "EXAVITQu4vr4xnSDxMaL"  # Sarah
---
```
