import { Outlet } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-secondary-600 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-white">
            <GraduationCap className="w-10 h-10" />
            <span className="text-2xl font-bold">BSocial</span>
          </div>
        </div>
        
        <div className="text-white">
          <h1 className="text-4xl font-bold mb-4">
            Connect with your<br />university community
          </h1>
          <p className="text-lg text-white/80">
            The exclusive social platform for UTU University students.
            Share, connect, and engage with your peers.
          </p>
        </div>

        <div className="text-white/60 text-sm">
          © {new Date().getFullYear()} BSocial. Made for UTU Students.
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <GraduationCap className="w-10 h-10 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">BSocial</span>
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  );
}
