/**
 * Generate TTS audio for blog posts using ElevenLabs API.
 *
 * This script:
 * 1. Finds all blog posts with audio EXPLICITLY enabled (opt-in)
 * 2. Checks if audio already exists in cache or on CloudFront
 * 3. Generates audio via ElevenLabs for posts without audio
 * 4. Saves MP3 files to .audio-cache/{slug}.mp3
 * 5. Creates audio-manifest.json with metadata
 *
 * NOTE: Audio is OPT-IN. Posts must have `audio.enabled: true` in frontmatter.
 *       Posts without this setting are skipped.
 *
 * Usage: ELEVENLABS_API_KEY=xxx node scripts/generate-blog-audio.mjs
 */
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { glob } from 'glob';
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  copyFileSync,
} from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const AUDIO_CACHE_DIR = join(rootDir, '.audio-cache');

// Configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE = process.env.ELEVENLABS_DEFAULT_VOICE || '8Ln42OXYupYsag45MAUy'; // Jay Wayne
const CLOUDFRONT_DOMAIN = 'terraconstructs.dev';
const MODEL_ID = 'eleven_multilingual_v2';
const OUTPUT_FORMAT = 'mp3_44100_128';

/**
 * Parse MDX frontmatter from file content.
 * Reused from prerender-blog.mjs
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const frontmatter = {};

  yaml.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (key === 'tags') {
      frontmatter[key] = [];
      return;
    }

    // Handle nested audio config
    if (key === 'audio') {
      frontmatter.audio = {};
      return;
    }

    // Handle audio sub-keys
    if (line.startsWith('  ') && frontmatter.audio !== undefined) {
      const subKey = key.trim();
      const subValue = value.replace(/^['"]|['"]$/g, '');
      if (subKey === 'enabled') {
        frontmatter.audio[subKey] = subValue === 'true';
      } else {
        frontmatter.audio[subKey] = subValue;
      }
      return;
    }

    frontmatter[key] = value.replace(/^['"]|['"]$/g, '');
  });

  // Parse tags array
  const tagsMatch = yaml.match(/tags:\s*\n((?:  - .+\n?)+)/);
  if (tagsMatch) {
    frontmatter.tags = tagsMatch[1]
      .split('\n')
      .filter(Boolean)
      .map((t) => t.replace(/^\s*-\s*/, '').trim());
  }

  return frontmatter;
}

/**
 * Extract plain text from MDX content for TTS.
 * Optimized for natural speech flow.
 */
function extractTextForTTS(content, slug = 'unknown', frontmatter = {}) {
  // Add metadata preamble
  const { title, author, date } = frontmatter;
  let preamble = '';
  if (title) {
    preamble = `${title}`;
    if (author) preamble += ` by ${author}`;
    if (date) {
      // Format date nicely for speech
      const dateObj = new Date(date);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      preamble += `, published on ${formattedDate}`;
    }
    preamble += '.\n\n';
  }

  // Remove frontmatter
  let text = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');

  // Remove code blocks entirely (not speech-friendly)
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`[^`]+`/g, '');

  // Extract text from JSX component props before removing components
  // This preserves valuable content from Stats, Milestones, Callout, etc.

  // Extract from label="..." or title="..." or description="..." props
  const propMatches = text.matchAll(/(?:label|title|description):\s*["']([^"']+)["']/g);
  const extractedProps = [];
  for (const match of propMatches) {
    extractedProps.push(match[1]);
  }

  // Extract from Callout and similar components with children
  // Match: <Callout ...>content</Callout>
  // Use a balanced approach to handle nested braces
  const calloutRegex = /<(Callout)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g;
  const calloutMatches = text.matchAll(calloutRegex);
  const extractedChildren = [];
  for (const match of calloutMatches) {
    const children = match[2];
    // Only include if it looks like text content (not more JSX)
    if (children && !children.trim().startsWith('<')) {
      extractedChildren.push(children.trim());
    }
  }

  // Remove JSX/MDX components using a more robust approach
  // Handle self-closing tags: <Component />
  // Handle tags with complex props including braces: <Component items={[...]} />

  // First pass: Remove multi-line JSX components (handle nested braces)
  // Match opening tag, consume all braces/content, find closing /> or </Tag>
  let prevText;
  let iterations = 0;
  do {
    prevText = text;
    // Match <UpperCase...> and find matching /> or </UpperCase>
    text = text.replace(/<([A-Z]\w+)(?:\s[\s\S]*?)?\/>/g, ''); // Self-closing
    text = text.replace(/<([A-Z]\w+)(?:\s[\s\S]*?)?>[\s\S]*?<\/\1>/g, ''); // With closing tag
    iterations++;
  } while (text !== prevText && iterations < 10); // Repeat until no more changes

  // Remove remaining HTML-style tags
  text = text.replace(/<[a-z][^>]*(?:\/>|>[\s\S]*?<\/[a-z][^>]*>)/g, '');

  // Append extracted prop values and children at the end (they contain readable content)
  if (extractedProps.length > 0) {
    text += '\n\n' + extractedProps.join('. ') + '.';
  }
  if (extractedChildren.length > 0) {
    text += '\n\n' + extractedChildren.join(' ');
  }

  // Convert headings to text with section markers and pause
  // Track section numbers for better TTS flow
  let sectionCount = 0;
  text = text.replace(/^##\s+(.+)$/gm, (match, heading) => {
    sectionCount++;
    return `\nSection ${sectionCount}: ${heading}.\n`;
  });

  // Convert other heading levels (h1, h3-h6) without section numbers
  text = text.replace(/^#\s+(.+)$/gm, '\n$1.\n'); // h1
  text = text.replace(/^#{3,6}\s+(.+)$/gm, '\n$1.\n'); // h3-h6

  // Convert links to just their text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove emphasis markers
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');

  // Remove image markdown
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

  // Clean up list markers
  text = text.replace(/^\s*[-*+]\s+/gm, '');
  text = text.replace(/^\s*\d+\.\s+/gm, '');

  // Normalize whitespace
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.replace(/[ \t]+/g, ' ');
  text = text.trim();

  // Prepend metadata preamble
  const finalText = preamble + text;

  // VERBOSE LOGGING: Log extracted text details
  console.log(`  📝 [${slug}] Text extraction:`);
  console.log(`     - Total length: ${finalText.length} chars`);
  console.log(`     - Word count: ~${finalText.split(/\s+/).length} words`);
  if (finalText.length > 0) {
    const preview = finalText.length > 200 ? finalText.substring(0, 200) + '...' : finalText;
    console.log(`     - Preview: "${preview}"`);
    if (finalText.length > 400) {
      const ending = finalText.substring(finalText.length - 200);
      console.log(`     - Ending: "...${ending}"`);
    }
  }

  return finalText;
}

/**
 * Get transcript file path for a blog post.
 */
function getTranscriptPath(slug) {
  return join(rootDir, 'blog', slug, 'transcript.txt');
}

/**
 * Check if a reviewed transcript exists.
 */
function hasReviewedTranscript(slug) {
  return existsSync(getTranscriptPath(slug));
}

/**
 * Load transcript from file.
 */
function loadTranscript(slug) {
  return readFileSync(getTranscriptPath(slug), 'utf-8');
}

/**
 * Save transcript to file for human review.
 */
function saveTranscriptForReview(slug, text) {
  const transcriptPath = getTranscriptPath(slug);
  writeFileSync(transcriptPath, text, 'utf-8');
  return transcriptPath;
}

/**
 * Check if audio exists in local cache.
 */
function checkAudioInCache(slug) {
  const cachePath = join(AUDIO_CACHE_DIR, `${slug}.mp3`);
  return existsSync(cachePath);
}

/**
 * Copy audio from cache to dist directory.
 */
function copyAudioFromCache(slug) {
  const cachePath = join(AUDIO_CACHE_DIR, `${slug}.mp3`);
  const distPath = join(rootDir, 'dist', 'blog', slug, 'audio.mp3');
  mkdirSync(dirname(distPath), { recursive: true });
  copyFileSync(cachePath, distPath);
  return distPath;
}

/**
 * Save audio to cache directory.
 */
function saveAudioToCache(slug, sourcePath) {
  mkdirSync(AUDIO_CACHE_DIR, { recursive: true });
  const cachePath = join(AUDIO_CACHE_DIR, `${slug}.mp3`);
  copyFileSync(sourcePath, cachePath);
  return cachePath;
}

/**
 * Check if audio already exists on CloudFront.
 * Must verify content-type is audio/mpeg, not text/html (SPA fallback).
 */
async function checkAudioExists(slug) {
  const url = `https://${CLOUDFRONT_DOMAIN}/blog/${slug}/audio.mp3`;
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) return false;

    // Check content-type to avoid SPA fallback false positives
    const contentType = response.headers.get('content-type');
    return contentType && contentType.includes('audio/');
  } catch {
    return false;
  }
}

/**
 * Generate audio using ElevenLabs API.
 */
async function generateAudio(client, text, voiceId, slug = 'unknown') {
  console.log(`  🔊 [${slug}] Calling ElevenLabs API...`);
  const response = await client.textToSpeech.convert(voiceId, {
    text,
    modelId: MODEL_ID,
    outputFormat: OUTPUT_FORMAT,
  });

  // VERBOSE LOGGING: Log response type
  console.log(`  📦 [${slug}] Response type analysis:`);
  console.log(`     - Constructor: ${response?.constructor?.name || 'unknown'}`);
  console.log(`     - Is Readable: ${response instanceof Readable}`);
  console.log(`     - Is ReadableStream: ${response instanceof ReadableStream}`);
  console.log(`     - Is Buffer: ${Buffer.isBuffer(response)}`);
  console.log(`     - Has Symbol.asyncIterator: ${typeof response?.[Symbol.asyncIterator] === 'function'}`);
  console.log(`     - Has Symbol.iterator: ${typeof response?.[Symbol.iterator] === 'function'}`);

  return response;
}

/**
 * Save audio stream to file.
 */
async function saveAudioToFile(audioStream, outputPath, slug = 'unknown') {
  mkdirSync(dirname(outputPath), { recursive: true });

  console.log(`  💾 [${slug}] Saving audio to: ${outputPath}`);
  let totalBytes = 0;

  // Handle different response types from ElevenLabs SDK
  if (audioStream instanceof Readable) {
    console.log(`     - Handling as Node.js Readable stream`);
    const writeStream = createWriteStream(outputPath);
    audioStream.pipe(writeStream);
    await finished(writeStream);
    // Note: Can't easily track bytes with pipe, would need to add transform stream
  } else if (audioStream instanceof ReadableStream) {
    console.log(`     - Handling as Web ReadableStream`);
    // Web ReadableStream
    const reader = audioStream.getReader();
    const chunks = [];
    let chunkCount = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunkCount++;
      const chunkSize = value?.length || value?.byteLength || 0;
      totalBytes += chunkSize;
      console.log(`     - Chunk ${chunkCount}: ${chunkSize} bytes (total: ${totalBytes})`);
      chunks.push(value);
    }
    const buffer = Buffer.concat(chunks);
    writeFileSync(outputPath, buffer);
    console.log(`     - Final buffer size: ${buffer.length} bytes`);
  } else if (Buffer.isBuffer(audioStream)) {
    console.log(`     - Handling as Buffer`);
    totalBytes = audioStream.length;
    console.log(`     - Buffer size: ${totalBytes} bytes`);
    writeFileSync(outputPath, audioStream);
  } else if (typeof audioStream[Symbol.asyncIterator] === 'function') {
    console.log(`     - Handling as async iterable`);
    // Async iterable
    const chunks = [];
    let chunkCount = 0;
    for await (const chunk of audioStream) {
      chunkCount++;
      const chunkSize = chunk?.length || chunk?.byteLength || 0;
      totalBytes += chunkSize;
      console.log(`     - Chunk ${chunkCount}: ${chunkSize} bytes (total: ${totalBytes})`);
      console.log(`     - Chunk type: ${chunk?.constructor?.name || typeof chunk}`);
      chunks.push(chunk);
    }
    console.log(`     - Collected ${chunks.length} chunks, attempting Buffer.concat...`);
    const buffer = Buffer.concat(chunks);
    console.log(`     - Final buffer size: ${buffer.length} bytes`);
    writeFileSync(outputPath, buffer);
  } else {
    throw new Error('Unknown audio stream type');
  }

  console.log(`  ✅ [${slug}] Saved ${totalBytes > 0 ? totalBytes : '(size unknown)'} bytes to file`);
}

/**
 * Parse command-line arguments.
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    slug: null,
    review: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slug' && i + 1 < args.length) {
      options.slug = args[i + 1];
      i++;
    } else if (args[i] === '--review') {
      options.review = true;
    }
  }

  return options;
}

/**
 * Main function to generate audio for all blog posts.
 */
async function generateBlogAudio() {
  const options = parseArgs();

  console.log('🎙️  Starting blog audio generation...\n');
  if (options.slug) {
    console.log(`🎯 Single-post mode: ${options.slug}\n`);
  }
  if (options.review) {
    console.log(`📝 Review mode: Generating transcripts for human review\n`);
  }

  // Check for API key (not needed in review mode)
  if (!options.review && !ELEVENLABS_API_KEY) {
    console.log('⚠️  ELEVENLABS_API_KEY not set. Skipping audio generation.\n');
    return;
  }

  // Initialize ElevenLabs client (not needed in review mode)
  const client = options.review ? null : new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

  // Find all blog posts
  let postFiles = await glob('blog/*/index.mdx', { cwd: rootDir });

  // Filter by slug if specified
  if (options.slug) {
    postFiles = postFiles.filter((file) => {
      const slug = basename(dirname(join(rootDir, file)));
      return slug === options.slug;
    });

    if (postFiles.length === 0) {
      console.log(`❌ No blog post found with slug: ${options.slug}\n`);
      return;
    }
  }

  console.log(`📄 Found ${postFiles.length} blog post${postFiles.length !== 1 ? 's' : ''}\n`);

  const audioManifest = [];
  let generated = 0;
  let skipped = 0;
  let disabled = 0;

  for (const file of postFiles) {
    const fullPath = join(rootDir, file);
    const content = readFileSync(fullPath, 'utf-8');
    const frontmatter = parseFrontmatter(content);
    const slug = basename(dirname(fullPath));

    // OPT-IN: Only process posts with audio.enabled: true
    if (frontmatter.audio?.enabled !== true) {
      console.log(`⏭️  ${slug}: Audio not enabled (add 'audio.enabled: true' to frontmatter)`);
      disabled++;
      continue;
    }

    // REVIEW MODE: Generate transcripts for human review
    if (options.review) {
      console.log(`📝 ${slug}: Extracting transcript for review...`);
      const text = extractTextForTTS(content, slug, frontmatter);
      const transcriptPath = saveTranscriptForReview(slug, text);
      console.log(`✅ ${slug}: Transcript saved to ${transcriptPath}`);
      console.log(`   Edit the transcript, then run without --review to generate audio\n`);
      generated++;
      continue;
    }

    // Priority 1: Check if audio exists in persistent cache
    if (checkAudioInCache(slug)) {
      console.log(`✅ ${slug}: Audio found in cache, copying to dist/`);
      copyAudioFromCache(slug);
      audioManifest.push({
        slug,
        audioUrl: `/blog/${slug}/audio.mp3`,
        source: 'cache',
      });
      skipped++;
      continue;
    }

    // Priority 2: Check if audio already exists on CloudFront
    const exists = await checkAudioExists(slug);
    if (exists) {
      console.log(`✅ ${slug}: Audio already exists on CDN`);
      audioManifest.push({
        slug,
        audioUrl: `/blog/${slug}/audio.mp3`,
        source: 'cdn',
      });
      skipped++;
      continue;
    }

    // Priority 3: Check if audio exists locally in dist (for rebuilds without deploy)
    const localAudioPath = join(rootDir, 'dist', 'blog', slug, 'audio.mp3');
    if (existsSync(localAudioPath)) {
      console.log(`✅ ${slug}: Audio already exists in dist/, copying to cache`);
      saveAudioToCache(slug, localAudioPath);
      audioManifest.push({
        slug,
        audioUrl: `/blog/${slug}/audio.mp3`,
        source: 'local',
      });
      skipped++;
      continue;
    }

    // Extract text for TTS
    console.log(`🎤 ${slug}: Generating audio...`);
    let text;
    if (hasReviewedTranscript(slug)) {
      console.log(`  📄 [${slug}] Using reviewed transcript from file`);
      text = loadTranscript(slug);
    } else {
      text = extractTextForTTS(content, slug, frontmatter);
    }
    const charCount = text.length;

    // Get voice ID from frontmatter or use default
    const voiceId = frontmatter.audio?.voice || DEFAULT_VOICE;

    try {
      const audioStream = await generateAudio(client, text, voiceId, slug);
      const outputPath = join(rootDir, 'dist', 'blog', slug, 'audio.mp3');
      await saveAudioToFile(audioStream, outputPath, slug);

      // Save to persistent cache for future builds
      const cachePath = saveAudioToCache(slug, outputPath);
      console.log(`✅ ${slug}: Audio saved to dist/ and cache`);

      audioManifest.push({
        slug,
        audioUrl: `/blog/${slug}/audio.mp3`,
        voiceId,
        charCount,
        source: 'generated',
      });
      generated++;
    } catch (error) {
      console.error(`❌ ${slug}: Failed to generate audio - ${error.message}`);
      // Continue with other posts (silent skip behavior)
    }
  }

  // Write audio manifest (skip in review mode)
  if (!options.review) {
    const manifestPath = join(rootDir, 'dist', 'blog', 'audio-manifest.json');
    writeFileSync(manifestPath, JSON.stringify(audioManifest, null, 2));
    console.log(`\n📋 Audio manifest saved to ${manifestPath}`);
  }

  if (options.review) {
    console.log(`
✨ Transcript generation complete!
   Transcripts created: ${generated}

   📝 Next steps:
   1. Review and edit the transcript.txt files in each blog post directory
   2. Run the script again WITHOUT --review to generate audio from edited transcripts
`);
  } else {
    console.log(`
✨ Audio generation complete!
   Generated: ${generated}
   Skipped (exists): ${skipped}
   Disabled: ${disabled}
`);
  }
}

// Run the script
generateBlogAudio().catch((err) => {
  console.error('❌ Audio generation failed:', err);
  // Don't exit with error code - silent skip behavior
});
