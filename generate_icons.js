// Simple icon generator using Node.js
// Creates basic PNG files without external dependencies

const fs = require('fs');

// Create a simple blue square PNG (minimal valid PNG)
function createSimplePNG(size, filename) {
    // This creates a very basic blue square PNG
    // For a production extension, you'd want to use proper tools or libraries

    const { createCanvas } = require('canvas');
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(0, 0, size, size);

    // Draw Sigma symbol
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.7}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Σ', size / 2, size / 2);

    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filename, buffer);
    console.log(`Created ${filename}`);
}

// Try to create icons, fallback to manual generation if canvas not available
try {
    createSimplePNG(16, 'icon16.png');
    createSimplePNG(48, 'icon48.png');
    createSimplePNG(128, 'icon128.png');
    console.log('All icons created successfully!');
} catch (error) {
    console.log('Canvas module not available. Using fallback method...');
    console.log('Please open generate_icons.html in your browser to download the icons.');

    // Create simple colored squares as fallback
    // This is a minimal valid PNG - just a colored square
    createFallbackIcons();
}

function createFallbackIcons() {
    // Create very basic PNG files (solid blue squares)
    // These are minimal but valid PNG files
    const sizes = [16, 48, 128];

    sizes.forEach(size => {
        // Create a minimal valid PNG with solid color
        // PNG file format in base64
        const png = createMinimalPNG(size);
        fs.writeFileSync(`icon${size}.png`, png);
        console.log(`Created fallback icon${size}.png`);
    });
}

function createMinimalPNG(size) {
    // Create the simplest possible valid PNG (blue square)
    // This is a very basic implementation
    const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    // IHDR chunk
    const ihdr = createChunk('IHDR',
        Buffer.concat([
            intToBytes(size, 4), // width
            intToBytes(size, 4), // height
            Buffer.from([8, 2, 0, 0, 0]) // bit depth, color type, compression, filter, interlace
        ])
    );

    // Simple blue pixel data (RGB)
    const pixelData = Buffer.alloc(size * size * 3);
    for (let i = 0; i < size * size; i++) {
        pixelData[i * 3] = 0x21;     // R
        pixelData[i * 3 + 1] = 0x96; // G
        pixelData[i * 3 + 2] = 0xF3; // B
    }

    // Add filter bytes (0 for no filter) at start of each row
    const rows = [];
    for (let y = 0; y < size; y++) {
        const row = Buffer.alloc(size * 3 + 1);
        row[0] = 0; // filter byte
        pixelData.copy(row, 1, y * size * 3, (y + 1) * size * 3);
        rows.push(row);
    }
    const imageData = Buffer.concat(rows);

    // Compress with zlib
    const zlib = require('zlib');
    const compressed = zlib.deflateSync(imageData);

    const idat = createChunk('IDAT', compressed);
    const iend = createChunk('IEND', Buffer.alloc(0));

    return Buffer.concat([pngSignature, ihdr, idat, iend]);
}

function createChunk(type, data) {
    const length = intToBytes(data.length, 4);
    const typeBytes = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBytes, data]));

    return Buffer.concat([length, typeBytes, data, intToBytes(crc, 4)]);
}

function intToBytes(value, bytes) {
    const buffer = Buffer.alloc(bytes);
    buffer.writeUInt32BE(value, 0);
    return buffer;
}

function crc32(data) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
        crc = crc ^ data[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
        }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}
