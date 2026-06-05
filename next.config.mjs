/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // จำเป็นมาก เพื่อป้องกันไม่ให้ระบบรูปภาพของ Next.js พังบน GitHub Pages
  },
};

module.exports = nextConfig;