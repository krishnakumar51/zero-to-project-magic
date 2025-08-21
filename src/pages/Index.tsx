import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">Project</h1>
            <Button variant="outline" size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Ready to Build
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            This is your blank canvas. Start creating something amazing with a clean, 
            modern foundation and a beautiful design system already in place.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-primary rounded-sm"></div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Modern Design
            </h3>
            <p className="text-muted-foreground">
              Built with a cohesive design system using semantic color tokens.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-primary rounded-sm"></div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Component Ready
            </h3>
            <p className="text-muted-foreground">
              Includes shadcn/ui components with customizable variants.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-primary rounded-sm"></div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Fully Responsive
            </h3>
            <p className="text-muted-foreground">
              Mobile-first design that looks great on any device.
            </p>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button size="lg" className="mr-4">
            Start Building
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;