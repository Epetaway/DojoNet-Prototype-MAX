import sharp from 'sharp'

export async function processImage(buffer, { width, grayscale=false, muted=false }){
  let p = sharp(buffer).resize({ width, withoutEnlargement: true })
  if(grayscale) p = p.grayscale()
  if(muted){
    p = p.modulate({ saturation: 0.85, brightness: 0.98 })
    p = p.linear(0.95, 2)
  }
  return p.jpeg({ quality: 82, mozjpeg: true }).toBuffer()
}
