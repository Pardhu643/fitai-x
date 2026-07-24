import { Link } from 'react-router-dom';
import { Dumbbell, Brain, TrendingUp, Shield, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-gray-200">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Dumbbell className="text-primary-600" size={32} />
              <span className="text-xl font-bold text-gray-900">FitAI X</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/signin" className="text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="py-20 bg-gradient-to-b from-primary-50 to-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                AI-Powered Adaptive Fitness
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Transform your fitness journey with intelligent workout planning, 
                personalized nutrition guidance, and AI-powered coaching that adapts to your progress.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link to="/signup">
                  <Button size="lg">
                    Start Your Journey
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
                <Link to="/signin">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Everything You Need to Succeed
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="text-primary-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Coach</h3>
                <p className="text-gray-600">Personalized guidance that learns and adapts to your needs</p>
              </div>
              <div className="text-center">
                <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="text-secondary-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Workouts</h3>
                <p className="text-gray-600">Adaptive plans that adjust based on your progress</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
                <p className="text-gray-600">Detailed analytics to monitor your fitness journey</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Injury Prevention</h3>
                <p className="text-gray-600">AI-powered risk detection and recovery guidance</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Ready to Transform Your Fitness?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of users who have already started their AI-powered fitness journey.
              </p>
              <Link to="/signup">
                <Button size="lg">
                  Get Started Free
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Dumbbell size={24} />
              <span className="font-bold">FitAI X</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 FitAI X. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
