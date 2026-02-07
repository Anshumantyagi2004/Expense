import { Phone, Mail } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <div className="bg-white text-indigo-600 py-4 text-center bottom-0 w-full border mt-auto">
            <p>© 2025 Promozione Branding HRM. <Link to="/cash-expense">All rights reserved.</Link></p>
        </div>
    )
}
