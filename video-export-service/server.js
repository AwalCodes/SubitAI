const express = require('express')
const ffmpeg = require('fluent-ffmpeg')
const multer = require('multer')
const cors = require('cors')
const fs = require('fs').promises
const path = require('path')
const crypto = require('crypto')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Configure multer for file uploads
const upload = multer({
  dest: 'temp/',
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Video export service is running' })
})

// Video export endpoint
app.post('/export', upload.single('video'), async (req, res) => {
  const tempDir = path.join(__dirname, 'temp')
  const outputDir = path.join(__dirname, 'output')

  let inputVideoPath = null
  let srtFilePath = null
  let outputVideoPath = null
  const jobId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()

  // Track if we've sent the response already (error case)
  let responseSent = false

  try {
    // Ensure directories exist
    await fs.mkdir(tempDir, { recursive: true })
    await fs.mkdir(outputDir, { recursive: true })

    // Get video file
    if (!req.file) {
      // Try to download from URL
      const videoUrl = req.body.videoUrl
      if (!videoUrl) {
        responseSent = true
        return res.status(400).json({ error: 'No video file or URL provided' })
      }

      // Download video from URL (Node.js 18+ has built-in fetch)
      const response = await fetch(videoUrl)
      if (!response.ok) {
        responseSent = true
        return res.status(400).json({ error: 'Failed to download video from URL' })
      }

      const buffer = Buffer.from(await response.arrayBuffer())
      const ext = path.extname(new URL(videoUrl).pathname) || '.mp4'
      inputVideoPath = path.join(tempDir, `input_${jobId}${ext}`)
      await fs.writeFile(inputVideoPath, buffer)
    } else {
      inputVideoPath = req.file.path
    }

    // Get subtitles
    const subtitles = JSON.parse(req.body.subtitles || '[]')
    if (!subtitles || subtitles.length === 0) {
      if (!responseSent) {
        responseSent = true
        return res.status(400).json({ error: 'No subtitles provided' })
      }
    }

    // Get style options
    const style = JSON.parse(req.body.style || '{}')

    // Generate ASS file instead of SRT
    const assContent = generateASS(subtitles, style)
    const assFilePath = path.join(tempDir, `subtitles_${jobId}.ass`)
    await fs.writeFile(assFilePath, assContent, 'utf8')

    // Output path
    outputVideoPath = path.join(outputDir, `output_${jobId}.mp4`)

    // Build FFmpeg command
    return new Promise((resolve, reject) => {
      res.setHeader('Content-Type', 'video/mp4')
      res.setHeader('Content-Disposition', `attachment; filename="subtitle-video-${jobId}.mp4"`)

      const command = ffmpeg(inputVideoPath)
        .videoFilters(
          `subtitles=${assFilePath}`
        )
        .videoCodec('libx264')
        .audioCodec('aac')
        .audioBitrate('192k')
        .videoBitrate('5000k')
        .outputOptions([
          '-preset ultrafast',
          '-crf 28',
          '-movflags +faststart',
          '-pix_fmt yuv420p'
        ])
        .output(outputVideoPath)
        .on('start', (cmd) => {
          console.log('FFmpeg command:', cmd)
        })
        .on('progress', (progress) => {
          console.log('Processing: ' + Math.round(progress.percent) + '%')
        })
        .on('end', async () => {
          try {
            // Stream the file content to response
            const { createReadStream } = require('fs')
            const fileStream = createReadStream(outputVideoPath)

            fileStream.on('error', (err) => {
              console.error('Stream error:', err)
              if (!responseSent) {
                // Try to end if possible, though headers likely sent
                res.end()
              }
            })

            fileStream.pipe(res)

            fileStream.on('end', async () => {
              await cleanup()
              resolve()
            })

          } catch (error) {
            reject(error)
          }
        })
        .on('error', async (err) => {
          console.error('FFmpeg error:', err)
          await cleanup()
          // If headers haven't been sent, valid JSON error. 
          // Since we set headers early for streaming anticipation (or intended to), check writable.
          if (!res.headersSent) {
            res.status(500).json({ error: 'FFmpeg processing failed' })
            responseSent = true
          }
          reject(err)
        })

      command.run()
    })

  } catch (error) {
    console.error('Export error:', error)
    await cleanup()
    if (!responseSent && !res.headersSent) {
      res.status(500).json({ error: error.message || 'Video export failed' })
    }
  }

  async function cleanup() {
    try {
      if (inputVideoPath) await fs.unlink(inputVideoPath).catch(() => { })
      // Cleanup ass file instead of srt
      if (assFilePath) await fs.unlink(assFilePath).catch(() => { })

      if (outputVideoPath) await fs.unlink(outputVideoPath).catch(() => { })
      if (req.file && req.file.path) await fs.unlink(req.file.path).catch(() => { })
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  }
})

// Generate SRT format
function generateSRT(segments) {
  return segments
    .filter((seg) => seg.text && seg.text.trim())
    .map((seg, index) => {
      const start = formatSRTTime(seg.start)
      const end = formatSRTTime(seg.end)
      return `${index + 1}\n${start} --> ${end}\n${seg.text.trim()}\n`
    })
    .join('\n')
}

function formatSRTTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const millisecs = Math.floor((seconds % 1) * 1000)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${millisecs.toString().padStart(3, '0')}`
}

// Helper: Convert hex color to ASS format &HBBGGRR
function toASSColor(hex) {
  if (!hex) return '&HFFFFFF'
  hex = hex.replace('#', '')
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('')
  }
  const r = hex.substr(0, 2)
  const g = hex.substr(2, 2)
  const b = hex.substr(4, 2)
  // ASS uses BGR order
  return `&H${b}${g}${r}`
}

function formatASSTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const centisecs = Math.floor((seconds % 1) * 100) // ASS uses centiseconds

  return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centisecs.toString().padStart(2, '0')}`
}

function generateASS(segments, style) {
  const fontSize = style?.fontSize || 24
  const fontFamily = style?.fontFamily || 'Arial'
  const fontColor = toASSColor(style?.color || '#FFFFFF')
  const outlineColor = toASSColor(style?.outlineColor || '#000000')
  const outlineWidth = style?.outlineWidth || 2
  const verticalOffset = style?.verticalOffset || 20

  // Alignment: 2=Bottom Center, 5=Top Center, 10=Center (approximated for ASS basic alignments)
  // ASS Alignments: 1=Left-Bot, 2=Center-Bot, 3=Right-Bot, 5=Top-Left, 6=Top-Center, ...
  let alignment = 2 // Bottom Center default
  let marginV = verticalOffset

  if (style?.position === 'top') {
    alignment = 8 // Top Center
  } else if (style?.position === 'center') {
    alignment = 5 // Middle Center
  }

  const animation = style?.animation || 'none'
  const animDuration = (style?.animationDuration || 0.3) * 1000

  // Header
  let content = `[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 1

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontFamily},${fontSize},${fontColor},&H000000FF,${outlineColor},&H00000000,-1,0,0,0,100,100,0,0,1,${outlineWidth},0,${alignment},10,10,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`

  segments.forEach(seg => {
    if (!seg.text || !seg.text.trim()) return

    const start = formatASSTime(seg.start)
    const end = formatASSTime(seg.end)
    let text = seg.text.trim()
    let tags = ''

    // Apply Animations via ASS Tags
    if (animation === 'fade') {
      // \fad(fadeIn, fadeOut) in ms
      tags += `\\fad(${animDuration},${animDuration})`
    } else if (animation === 'slide') {
      // Slide up effect using \move
      // We assume sliding from slightly lower Y to target Y
      // This requires knowing precise coordinates, which is tricky in generic ASS without resolution info.
      // Fallback to simple fade for stability if strict slide is hard, or use generic move.
      // Approximating slide up from Bottom+50 to Bottom
      // \move(x1,y1,x2,y2)
      // Standard move is hard to calculate without exact screen pos. 
      // Let's use \fad as fallback or \t based transforms?
      // Actually, \move is coordinate based.
      // A safer bet for "slide" without coords is just \fad for now or strict move if assumed 1080p.
      // Let's implement fade for slide for robustness unless we mandate 1080p.
      tags += `\\fad(${animDuration},${animDuration})`
    } else if (animation === 'typewriter') {
      // Simple typewriter simulated by standard display (no specific tag unless doing karaoke per char)
      // Leaving plain (pop-in) or adding a transform
    } else if (animation === 'bounce') {
      // \t for scaling?
      // \t(start, end, \fscx120\fscy120) -> bounce effect
      tags += `{\\t(0,200,\\fscx110\\fscy110)\\t(200,400,\\fscx100\\fscy100)}`
    } else if (animation === 'glow') {
      // Outline blur?
      tags += `{\\bord${outlineWidth + 2}\\blur5}`
    }

    content += `Dialogue: 0,${start},${end},Default,,0,0,0,,{${tags}}${text}\n`
  })

  return content
}




app.listen(PORT, () => {
  console.log(`Video export service running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})
