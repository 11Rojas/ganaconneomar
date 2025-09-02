import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    console.log("Middleware called for:", req.nextUrl.pathname)
    console.log("Token:", req.nextauth.token)
    
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
    const isAdminApi = req.nextUrl.pathname.startsWith("/api/admin")
    const isAdminLogin = req.nextUrl.pathname === "/admin/login"
    
    console.log("Is admin route:", isAdminRoute)
    console.log("Is admin login:", isAdminLogin)
    console.log("User role:", token?.role)
    
    // Excluir la página de login de admin de la verificación
    if (isAdminLogin) {
      console.log("Allowing access to admin login")
      return NextResponse.next()
    }
    
    // Si es una ruta de admin y el usuario no es admin, redirigir al login de admin
    if ((isAdminRoute || isAdminApi) && token?.role !== "admin") {
      console.log("User is not admin, redirecting to login")
      if (isAdminRoute) {
        return NextResponse.redirect(new URL("/admin/login", req.url))
      } else {
        return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
      }
    }
    
    console.log("Allowing access to:", req.nextUrl.pathname)
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
        const isAdminApi = req.nextUrl.pathname.startsWith("/api/admin")
        const isAdminLogin = req.nextUrl.pathname === "/admin/login"
        
        console.log("Authorized callback for:", req.nextUrl.pathname)
        console.log("Token exists:", !!token)
        console.log("User role:", token?.role)
        
        // Permitir acceso a la página de login de admin sin autenticación
        if (isAdminLogin) {
          console.log("Allowing access to admin login without auth")
          return true
        }
        
        // Si es una ruta de admin, requerir autenticación
        if (isAdminRoute || isAdminApi) {
          const hasToken = !!token
          console.log("Admin route requires auth, has token:", hasToken)
          return hasToken
        }
        
        // Para otras rutas, permitir acceso
        console.log("Non-admin route, allowing access")
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/raffles/:path*",
    "/api/purchases/:path*",
    "/api/exchange-rate/:path*",
    "/api/analytics/:path*"
  ]
}
