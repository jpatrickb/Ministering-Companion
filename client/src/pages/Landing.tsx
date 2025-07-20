import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <div className="w-20 h-20 bg-faith-blue rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-hands-helping text-white text-3xl"></i>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              Ministering Companion
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Strengthen relationships through inspired ministering. Record visits, 
              receive AI-powered insights, and access gospel resources to better 
              serve those you minister to.
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-faith-blue hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold"
            >
              Sign In to Get Started
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-faith-red bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-microphone text-faith-red text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Voice Recording</h3>
                <p className="text-slate-600">
                  Easily record your ministering visits and let AI transcribe 
                  your conversations for future reference.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-faith-green bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-brain text-faith-green text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">AI Insights</h3>
                <p className="text-slate-600">
                  Receive thoughtful analysis and suggestions for follow-up 
                  actions based on your recorded visits.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-faith-blue bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-book-open text-faith-blue text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Gospel Resources</h3>
                <p className="text-slate-600">
                  Access curated scriptures, conference talks, and service ideas 
                  to support your ministering efforts.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Ready to Enhance Your Ministering?
            </h2>
            <p className="text-slate-600 mb-8 text-lg">
              Join fellow church members in building stronger, more meaningful 
              relationships through inspired ministering.
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-faith-blue hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold"
            >
              Begin Your Journey
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
