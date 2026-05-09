import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";

const Footer = () => (
  <footer className="glass mt-20 border-t border-border">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Wrench className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">Krishiseva</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Book trusted labour near you. Verified workers, secure payments.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold">Services</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/services" className="transition-colors hover:text-primary">All Services</Link>
            <Link to="/workers" className="transition-colors hover:text-primary">Find Workers</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold">Company</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/become-worker" className="transition-colors hover:text-primary">Become a Worker</Link>
            <Link to="/developer" className="transition-colors hover:text-primary">Developer</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold">Support</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <a href="mailto:support@krishiseva.com" className="transition-colors hover:text-primary">Help Center</a>
            <a href="mailto:contact@krishiseva.com" className="transition-colors hover:text-primary">Contact</a>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        Copyright 2026 Krishiseva. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
