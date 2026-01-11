import { Link } from 'react-router-dom';
import { GraduationCap, Users, MessageCircle, Newspaper, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <GraduationCap className="w-8 h-8" />
            <span className="text-xl font-bold">BSocial</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-white hover:text-white/80 font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Your University,<br />Your Community
        </h1>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          The exclusive social platform for UTU University students. 
          Connect with classmates, join club pages, and stay updated with campus life.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="bg-white text-primary-600 px-8 py-3 rounded-full font-semibold hover:bg-white/90 transition-colors flex items-center gap-2"
          >
            Join Now <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-white/60 text-sm">
            Only for @uktech.net.in email holders
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Newspaper className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Share & Post</h3>
            <p className="text-white/70">
              Share updates, photos, and thoughts with your university community. Express yourself freely.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Direct Messaging</h3>
            <p className="text-white/70">
              Chat privately with classmates and friends. Create group chats for projects and hangouts.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Club Pages</h3>
            <p className="text-white/70">
              Follow your favorite clubs - Dramatics, Sports, Tech, and more. Stay updated on events.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to join your campus community?
          </h2>
          <p className="text-white/70 mb-8">
            Sign up with your university email and start connecting today.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3 rounded-full font-semibold hover:bg-white/90 transition-colors"
          >
            Create Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between text-white/60 text-sm">
          <p>© {new Date().getFullYear()} BSocial. Made for UTU University students.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
