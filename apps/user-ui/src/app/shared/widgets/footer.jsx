import React from 'react'
import Link from 'next/link'

const Footer = () => {
    return (
        <footer className="w-full bg-white border-t border-gray-100 mt-10">

            {/* Top Newsletter Band */}
            <div className="bg-[#3BB77E] py-8 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {/* Mail icon */}
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-semibold text-base leading-tight">Subscribe to our newsletter</p>
                            <p className="text-white/70 text-xs">Get the latest deals and offers directly in your inbox</p>
                        </div>
                    </div>
                    <div className="flex w-full md:w-auto gap-0">
                        <input
                            type="email"
                            placeholder="Enter your email address..."
                            className="flex-1 md:w-72 h-11 px-4 rounded-l-full text-sm text-gray-700 placeholder:text-gray-400 border-none outline-none"
                        />
                        <button className="h-11 px-6 bg-[#3489FF] hover:bg-[#185FA5] transition-colors text-white text-sm font-semibold rounded-r-full whitespace-nowrap">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Footer Links */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-1">
                        <Link href="/" className="inline-block mb-4">
                            <span className="text-2xl font-bold">
                                <span className="text-[#3BB77E]">E</span>
                                <span className="text-gray-800">Shop</span>
                            </span>
                        </Link>
                        <p className="text-sm text-gray-500 leading-relaxed mb-5">
                            Your one-stop destination for everything you need — from electronics to fashion, delivered fast and reliably.
                        </p>
                        {/* Social icons */}
                        <div className="flex items-center gap-2">
                            {[
                                {
                                    label: 'Facebook',
                                    path: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z'
                                },
                                {
                                    label: 'Twitter/X',
                                    path: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z'
                                },
                                {
                                    label: 'Instagram',
                                    path: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01M7.5 2h9A5.5 5.5 0 0122 7.5v9A5.5 5.5 0 0116.5 22h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2z'
                                },
                                {
                                    label: 'YouTube',
                                    path: 'M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z'
                                },
                            ].map((s) => (
                                <a
                                    key={s.label}
                                    href="#"
                                    aria-label={s.label}
                                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#3BB77E] hover:border-[#3BB77E] transition-colors"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={s.path} />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Company</h3>
                        <ul className="space-y-2.5">
                            {['About Us', 'Careers', 'Press', 'Blog', 'Affiliate Program'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-sm text-gray-500 hover:text-[#3BB77E] transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Shop */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Shop</h3>
                        <ul className="space-y-2.5">
                            {['All Products', 'Shops', 'Offers & Deals', 'Become a Seller', 'Track Order'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-sm text-gray-500 hover:text-[#3BB77E] transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Support</h3>
                        <ul className="space-y-2.5">
                            {['Help Center', 'Returns & Refunds', 'Shipping Info', 'Privacy Policy', 'Terms of Service'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-sm text-gray-500 hover:text-[#3BB77E] transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Contact</h3>
                        <ul className="space-y-3">
                            {[
                                {
                                    icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 10a3 3 0 110-6 3 3 0 010 6z',
                                    text: 'Gotamkot 6 Holi West Rukum, Nepal'
                                },
                                {
                                    icon: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.63A2 2 0 012.18 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 8.1a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 15z',
                                    text: '+977 9868620708'
                                },
                                {
                                    icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6',
                                    text: ['rnkhatri201@gmail.com']
                                },
                            ].map(({ icon, text }) => (
                                <li key={text} className="flex items-start gap-2.5">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3BB77E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                                        <path d={icon} />
                                    </svg>
                                    <span className="text-sm text-gray-500 leading-snug">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>

            {/* Payment Methods */}
            <div className="border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-400">We accept</p>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                        {['Visa', 'Mastercard', 'PayPal', 'Stripe', 'Amex'].map((method) => (
                            <span
                                key={method}
                                className="px-3 py-1.5 rounded border border-gray-200 text-xs font-semibold text-gray-500 bg-gray-50"
                            >
                                {method}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3BB77E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            Secure Checkout
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3BB77E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                            Free Returns
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-100 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-gray-400">
                        © {new Date().getFullYear()} <span className="text-[#3BB77E] font-semibold">EShop</span>. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        {['Privacy Policy', 'Terms of Use', 'Cookie Settings'].map((item, i, arr) => (
                            <React.Fragment key={item}>
                                <Link href="#" className="text-xs text-gray-400 hover:text-[#3BB77E] transition-colors">
                                    {item}
                                </Link>
                                {i < arr.length - 1 && <span className="text-gray-200 text-xs">|</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

        </footer>
    )
}

export default Footer