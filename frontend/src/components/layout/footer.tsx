import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Project Info */}
          <div className="space-y-4">
            <Link href="/" className="font-hanken text-lg font-bold tracking-tight inline-block">
              <span>MEDICARE<span className="text-primary font-extrabold">PLUS</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              A full-stack Doctor Appointment System developed as a university project.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-hanken text-xs font-bold uppercase tracking-wider text-foreground">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="hover:text-primary transition-colors">
                  Browse Doctors
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Single Divider and Copyright */}
        <div className="mt-16 pt-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
          <p>© 2026 MediCare Plus</p>
        </div>
      </div>
    </footer>
  );
};
