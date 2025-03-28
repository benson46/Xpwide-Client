import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = [
        {
            title: "Company",
            links: [
                { path: "/aboutus", label: "About us" },
                { path: "/contact", label: "Contact us" },
            ],
        },
        {
            title: "Support",
            links: [
                { path: "/customer-care", label: "Customer care" },
                { path: "/faqs", label: "FAQs" },
                { path: "/service", label: "Service" },
            ],
        },
        {
            title: "Legal",
            links: [
                { path: "/privacy-policy", label: "Privacy policy" },
                { path: "/terms", label: "Terms of service" },
                { path: "/return-policy", label: "Return policy" },
            ],
        },
    ];

    return (
        <footer className="w-full bg-gray-900 text-gray-200">
            {/* Main footer content */}
            <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                    {/* Footer links */}
                    {footerLinks.map((section, index) => (
                        <div key={index} className="space-y-4">
                            <h4 className="font-semibold text-lg sm:text-base">
                                {section.title}
                            </h4>
                            <ul className="space-y-3">
                                {section.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <Link
                                            to={link.path}
                                            className="text-gray-400 hover:text-primary flex items-center group transition-colors text-base sm:text-sm"
                                        >
                                            <ChevronRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-1 transition-all duration-200 flex-shrink-0" />
                                            <span className="truncate">{link.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom copyright bar */}
            <div className="border-t border-gray-800 py-4">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                        <p className="text-sm sm:text-xs text-gray-500 text-center md:text-left">
                            © {currentYear} XPWide. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;