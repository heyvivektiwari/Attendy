import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Attendy - Student Attendance Tracker',
    short_name: 'Attendy',
    description: 'Track lectures, labs, and attendance percentages effortlessly.',
    start_url: '/',
    display: 'standalone',
    background_color: '#070411',
    theme_color: '#005691',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
