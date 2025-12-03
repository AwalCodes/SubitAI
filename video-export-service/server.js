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

  try {
    // Ensure directories exist
    await fs.mkdir(tempDir, { recursive: true })
    await fs.mkdir(outputDir, { recursive: true })

    // Get video file
    if (!req.file) {
      // Try to download from URL
      const videoUrl = req.body.videoUrl
      if (!videoUrl) {
        return res.status(400).json({ error: 'No video file or URL provided' })
      }

      // Download video from URL (Node.js 18+ has built-in fetch)
      const response = await fetch(videoUrl)
      if (!response.ok) {
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
      return res.status(400).json({ error: 'No subtitles provided' })
    }

    // Generate SRT file
    const srtContent = generateSRT(subtitles)
    srtFilePath = path.join(tempDir, `subtitles_${jobId}.srt`)
    await fs.writeFile(srtFilePath, srtContent, 'utf8')

    // Get style options
    const style = JSON.parse(req.body.style || '{}')
    const fontSize = style?.fontSize || 24
    const fontFamily = style?.fontFamily || 'Arial'
    const fontColor = style?.color || '#FFFFFF'
    const outlineColor = style?.outlineColor || '#000000'
    const outlineWidth = style?.outlineWidth || 2
    const position = style?.position || 'bottom'
    const verticalOffset = style?.verticalOffset || 80

    // Output path
    outputVideoPath = path.join(outputDir, `output_${jobId}.mp4`)

    // Convert hex color to BGR for FFmpeg
    const hexToBGR = (hex) => {
      hex = hex.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      return `${b.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${r.toString(16).padStart(2, '0')}`
    }

    // Calculate subtitle position
    let yPosition = ''
    if (position === 'bottom') {
      yPosition = `y=h-th-${verticalOffset}`
    } else if (position === 'top') {
      yPosition = `y=${verticalOffset}`
    } else {
      yPosition = 'y=(h-th)/2' // Center
    }

    // Build FFmpeg command
    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputVideoPath)
        .videoFilters(
          `subtitles=${srtFilePath}:force_style='FontName=${fontFamily},FontSize=${fontSize},PrimaryColour=&H${hexToBGR(fontColor)},OutlineColour=&H${hexToBGR(outlineColor)},Outline=${outlineWidth},Alignment=2,${yPosition}'`
        )
        .videoCodec('libx264')
        .audioCodec('aac')
        .audioBitrate('192k')
        .videoBitrate('5000k')
        .outputOptions([
          '-preset medium',
          '-crf 23',
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
            // Read output file
            const videoBuffer = await fs.readFile(outputVideoPath)
            
            // Clean up
            await cleanup()

            // Send video
            res.setHeader('Content-Type', 'video/mp4')
            res.setHeader('Content-Disposition', `attachment; filename="subtitle-video-${jobId}.mp4"`)
            res.send(videoBuffer)
            resolve()
          } catch (error) {
            reject(error)
          }
        })
        .on('error', async (err) => {
          console.error('FFmpeg error:', err)
          await cleanup()
          reject(err)
        })

      command.run()
    })

  } catch (error) {
    console.error('Export error:', error)
    await cleanup()
    res.status(500).json({ error: error.message || 'Video export failed' })
  }

  async function cleanup() {
    try {
      if (inputVideoPath && await fs.access(inputVideoPath).then(() => true).catch(() => false)) {
        await fs.unlink(inputVideoPath)
      }
      if (srtFilePath && await fs.access(srtFilePath).then(() => true).catch(() => false)) {
        await fs.unlink(srtFilePath)
      }
      if (outputVideoPath && await fs.access(outputVideoPath).then(() => true).catch(() => false)) {
        await fs.unlink(outputVideoPath)
      }
      if (req.file && req.file.path && await fs.access(req.file.path).then(() => true).catch(() => false)) {
        await fs.unlink(req.file.path)
      }
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
      const start = formatTime(seg.start)
      const end = formatTime(seg.end)
      return `${index + 1}\n${start} --> ${end}\n${seg.text.trim()}\n`
    })
    .join('\n')
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const millisecs = Math.floor((seconds % 1) * 1000)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${millisecs.toString().padStart(3, '0')}`
}

app.listen(PORT, () => {
  console.log(`Video export service running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})
