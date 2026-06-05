'use client'; // เพิ่มบรรทัดนี้เข้ามาที่บนสุดครับ

import dynamic from 'next/dynamic';

// โหลด Component แบบ Dynamic และบังคับให้ข้ามการทำงานฝั่ง Server (ssr: false)
const QuantumCore = dynamic(() => import('./components/QuantumCore'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950">
      <p className="text-cyan-500 text-xl font-bold animate-pulse">Initializing Application...</p>
    </div>
  )
});

export default function Home() {
  return (
    <main>
      <QuantumCore />
    </main>
  );
}