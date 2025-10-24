export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/booking/:path*', '/my-bookings/:path*', '/staff/:path*', '/manager/:path*'],
}

