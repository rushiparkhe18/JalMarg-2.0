import './globals.css'
import 'leaflet/dist/leaflet.css'

export const metadata = {
  title: 'JalMarg 2.0 - Maritime Navigation System',
  description: 'Modern Maritime Navigation System with Real-time Weather and Route Optimization',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
