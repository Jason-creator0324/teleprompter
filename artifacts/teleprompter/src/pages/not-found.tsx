import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl text-center space-y-6">
        <div className="w-16 h-16 bg-destructive/20 rounded-2xl flex items-center justify-center mx-auto border border-destructive/30">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">404</h1>
          <p className="text-muted-foreground text-lg">
            The page you're looking for doesn't exist.
          </p>
        </div>
        
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-8 py-3 rounded-full font-semibold text-sm bg-primary text-primary-foreground hover:-translate-y-0.5 transition-all duration-200"
        >
          Return to Editor
        </Link>
      </div>
    </div>
  );
}
