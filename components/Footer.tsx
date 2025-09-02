import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"
import TikTok from "./Tiktok"

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-[#febd59]/20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-[#febd59] rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold gradient-text">Gana con Neomar</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              La plataforma líder en rifas online de Venezuela. Participa de forma segura y transparente en nuestras
              emocionantes rifas con premios increíbles.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/Neomarng" className="text-gray-400 hover:text-[#febd59] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
   <a href="https://www.facebook.com/neomargregoriotv" className="text-gray-400 hover:text-[#febd59] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-[#febd59] transition-colors">
                  Rifas Activas
                </Link>
              </li>
              <li>
                <Link href="/verify" className="text-gray-400 hover:text-[#febd59] transition-colors">
                  Verificar Tickets
                </Link>
              </li>
      
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400">
                <Phone className="w-4 h-4 mr-2 text-[#febd59]" />
                +58 412-9054717
              </li>
              
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">© 2025 Gana con Neomar. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
