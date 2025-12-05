"use client";
import { NetworkBackground } from "./components/NetworkBackground";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Mic, Zap, Shield } from "lucide-react";
import Link from "next/link";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <NetworkBackground />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-pulse-glow">
                <Zap className="w-4 h-4" />
                Next-Gen Voice AI
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Voice Bot That
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-float">
                Understands Everything
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of conversational AI. Natural, intelligent, and lightning-fast voice interactions powered by advanced neural networks.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link href="/voice/voice-agent"><Button size="lg" className="text-lg px-8 py-6 animate-pulse-glow">
                <Mic className="w-5 h-5 mr-2" />
                Try Demo
              </Button></Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Real-time voice processing with sub-100ms latency. Conversations that feel natural and immediate.
              </p>
            </Card>

            <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Enterprise Ready</h3>
              <p className="text-muted-foreground">
                Bank-grade security with end-to-end encryption. Your conversations stay private and secure.
              </p>
            </Card>

          
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <Card className="max-w-4xl mx-auto p-12 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 backdrop-blur-sm border-primary/30">
            <div className="text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to Transform Your Communication?
              </h2>
            
             
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Index;
