import { Link } from 'react-router-dom';
import { Dumbbell, Brain, TrendingUp, Shield, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080B10] text-[#F8FAFC]">
      {/* Navbar */}
      <nav className="bg-[#080B10] border-b border-white/5">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Dumbbell className="text-[#FFC400]" size={28} />
              <span className="text-xl font-extrabold tracking-tight text-white">FitAI X</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/signin" className="text-[#A8B0BF] hover:text-white font-bold text-xs uppercase tracking-wider transition-colors">
                Sign In
              </Link>
              <Link to="/signup">
                <Button className="bg-[#FFC400] text-black hover:bg-[#FFD43B] font-bold rounded-xl text-xs px-4 py-2">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#080B10] via-[#0B1017]/50 to-[#080B10]">
          <div className="container-custom relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#FFC400]/10 border border-[#FFC400]/20 px-3 py-1 rounded-full text-xs font-bold text-[#FFC400] uppercase tracking-wider">
                <Brain size={14} />
                Next Generation AI Coaching
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
                AI-Powered <span className="text-[#FFC400]">Adaptive</span> Fitness
              </h1>
              <p className="text-base text-[#A8B0BF] max-w-xl mx-auto leading-relaxed">
                Transform your fitness journey with intelligent workout planning, 
                personalized nutrition guidance, and AI-powered coaching that adapts to your progress.
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-[#FFC400] text-black hover:bg-[#FFD43B] font-bold rounded-xl shadow-lg shadow-[#FFC400]/10 px-6 py-3.5 text-xs">
                    Start Your Journey
                    <ArrowRight className="ml-1.5" size={16} />
                  </Button>
                </Link>
                <Link to="/signin">
                  <Button variant="outline" size="lg" className="border-white/5 bg-[#10151D] hover:bg-[#151B24] text-white font-bold rounded-xl px-6 py-3.5 text-xs">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-20 bg-[#080B10]">
          <div className="container-custom">
            <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Everything You Need to Succeed
              </h2>
              <p className="text-xs text-[#A8B0BF]">
                Intelligent features designed to build strength and consistency.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="bg-[#10151D] border border-white/5 p-6 rounded-2xl space-y-4 hover:border-white/10 transition-all">
                <div className="bg-[#FFC400]/10 w-12 h-12 rounded-xl flex items-center justify-center">
                  <Brain className="text-[#FFC400]" size={24} />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">AI Coach</h3>
                <p className="text-xs text-[#A8B0BF] leading-relaxed">Personalized guidance that learns and adapts to your needs</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#10151D] border border-white/5 p-6 rounded-2xl space-y-4 hover:border-white/10 transition-all">
                <div className="bg-[#7CFF4D]/10 w-12 h-12 rounded-xl flex items-center justify-center">
                  <Dumbbell className="text-[#7CFF4D]" size={24} />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Smart Workouts</h3>
                <p className="text-xs text-[#A8B0BF] leading-relaxed">Adaptive plans that adjust based on your progress</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#10151D] border border-white/5 p-6 rounded-2xl space-y-4 hover:border-white/10 transition-all">
                <div className="bg-[#32D5F4]/10 w-12 h-12 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-[#32D5F4]" size={24} />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Progress</h3>
                <p className="text-xs text-[#A8B0BF] leading-relaxed">Detailed analytics to monitor your fitness journey</p>
              </div>

              {/* Feature 4 */}
              <div className="bg-[#10151D] border border-white/5 p-6 rounded-2xl space-y-4 hover:border-white/10 transition-all">
                <div className="bg-[#FF5E5E]/10 w-12 h-12 rounded-xl flex items-center justify-center">
                  <Shield className="text-[#FF5E5E]" size={24} />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Prevention</h3>
                <p className="text-xs text-[#A8B0BF] leading-relaxed">AI-powered risk detection and recovery guidance</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-gradient-to-t from-[#0B1017] to-[#080B10]">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto bg-[#10151D] border border-white/5 rounded-3xl p-8 md:p-12 text-center space-y-6">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Ready to Transform Your Fitness?
              </h2>
              <p className="text-xs text-[#A8B0BF] max-w-md mx-auto leading-relaxed">
                Join thousands of users who have already started their AI-powered fitness journey.
              </p>
              <div className="pt-2">
                <Link to="/signup">
                  <Button size="lg" className="bg-[#FFC400] text-black hover:bg-[#FFD43B] font-bold rounded-xl shadow-lg shadow-[#FFC400]/10 px-8 py-3.5 text-xs">
                    Get Started Free
                    <ArrowRight className="ml-1.5" size={16} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0B1017] border-t border-white/5 py-8 text-[#6F7887] text-xs">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="text-[#FFC400]" size={20} />
              <span className="font-extrabold text-white">FitAI X</span>
            </div>
            <p>© 2024 FitAI X. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
