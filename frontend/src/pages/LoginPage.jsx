import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, ArrowRight, User, Shield, KeyRound } from 'lucide-react';

export const LoginPage = ({ onLoginSuccess, onBackToHome }) => {
  const [selectedRole, setSelectedRole] = useState('officer');
  const [userId, setUserId] = useState('officer@civicflow.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    if (role === 'officer') {
      setUserId('officer@civicflow.gov.in');
    } else if (role === 'admin') {
      setUserId('admin@civicflow.gov.in');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess(selectedRole);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-between text-[#1A1A1A]">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-[#DDE1E5] px-6 flex items-center justify-between">
        <button 
          onClick={onBackToHome}
          className="flex items-center space-x-2 text-xs font-medium text-[#5F6368] hover:text-[#168A44] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-[#168A44] text-white rounded flex items-center justify-center font-bold text-xs shadow-sm">
            CF
          </div>
          <span className="font-bold text-base tracking-tight text-[#1A1A1A]">
            CivicFlow
          </span>
        </div>

        <div className="text-xs text-[#5F6368] hidden sm:block">
          Official Government Portal
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-[#DDE1E5] rounded gov-card p-8 space-y-6">
          {/* Header text */}
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Sign in
            </h1>
            <p className="text-xs text-[#5F6368]">
              Access the infrastructure management platform
            </p>
          </div>

          {/* Role Selection Tabs (Officer & Admin) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1A1A1A] block">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'officer', label: 'Officer', desc: 'Maintenance & Field' },
                { id: 'admin', label: 'Admin', desc: 'System & Settings' }
              ].map((role) => {
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleChange(role.id)}
                    className={`p-3 text-center rounded border transition-all text-xs ${
                      isSelected
                        ? 'bg-[#168A44] text-white border-[#168A44] font-semibold shadow-sm'
                        : 'bg-white text-[#5F6368] hover:bg-gray-50 border-[#DDE1E5]'
                    }`}
                  >
                    <div className="font-semibold">{role.label}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-[#DCFCE7]' : 'text-[#5F6368]'}`}>
                      {role.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email / User ID"
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />

            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full flex items-center justify-center space-x-2"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>

          {/* Back to Home Link */}
          <div className="pt-2 text-center">
            <button
              onClick={onBackToHome}
              className="text-xs text-[#5F6368] hover:text-[#168A44] transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="py-4 text-center text-xs text-[#5F6368] border-t border-[#DDE1E5] bg-white">
        &copy; 2026 CivicFlow Infrastructure Management. All rights reserved.
      </footer>
    </div>
  );
};
