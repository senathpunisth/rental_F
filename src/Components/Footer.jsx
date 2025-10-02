import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div>
          <div className="text-lg font-semibold">CarRent</div>
          <p className="mt-2 text-slate-600">
            Affordable, reliable car rentals across Sri Lanka.
          </p>
        </div>
        <div>
          <div className="font-semibold">Company</div>
          <ul className="mt-2 space-y-1 text-slate-600">
            <li><Link to="/about" className="hover:text-orange-600">About</Link></li>
            <li><Link to="/careers" className="hover:text-orange-600">Careers</Link></li>
            <li><Link to="/contact" className="hover:text-orange-600">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold">Support</div>
          <ul className="mt-2 space-y-1 text-slate-600">
            <li><Link to="/help" className="hover:text-orange-600">Help Center</Link></li>
            <li><Link to="/terms" className="hover:text-orange-600">Terms</Link></li>
            <li><Link to="/privacy" className="hover:text-orange-600">Privacy</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold">Follow</div>
          <ul className="mt-2 space-y-1 text-slate-600">
            <li><a href="#" className="hover:text-orange-600">Facebook</a></li>
            <li><a href="#" className="hover:text-orange-600">Instagram</a></li>
            <li><a href="#" className="hover:text-orange-600">X / Twitter</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} CarRent. All rights reserved.
      </div>
    </footer>
  );
}
