import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  MapPin, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Building,
  Lightbulb,
  Droplets,
  Building2,
  Waves
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SEED_ASSETS } from '../data/mockData';
import assetService from '../services/assetService';

export const LandingPage = ({ onExploreDashboard }) => {
  const [topAsset, setTopAsset] = useState(SEED_ASSETS[0]);
  const [counts, setCounts] = useState({
    roads: 'Monitored',
    bridges: 'Monitored',
    streetlights: 'Monitored',
  });

  useEffect(() => {
    let mounted = true;
    Promise.all([
      assetService.getPriorities(1),
      assetService.getAssets()
    ]).then(([pRes, aRes]) => {
      if (!mounted) return;
      if (pRes.items && pRes.items.length > 0) {
        setTopAsset(pRes.items[0]);
      }
      if (aRes.items && aRes.items.length > 0) {
        const roadCount = aRes.items.filter(a => a.asset_type === 'road').length;
        const bridgeCount = aRes.items.filter(a => a.asset_type?.startsWith('bridge')).length;
        const lightCount = aRes.items.filter(a => a.asset_type?.startsWith('streetlight')).length;
        setCounts({
          roads: `${roadCount} Segments`,
          bridges: `${bridgeCount} Spans`,
          streetlights: `${lightCount} Arrays`,
        });
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FA] text-[#1A1A1A]">
      {/* SECTION 1: HERO */}
      <section id="home" className="bg-white border-b border-[#DDE1E5] py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#DCFCE7] text-[#126B37] rounded text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#168A44] inline-block"></span>
              <span>Public Infrastructure Management Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A] leading-[1.2]">
              Predict. Prioritize. Maintain Better.
            </h1>

            <p className="text-base sm:text-lg text-[#5F6368] leading-relaxed max-w-2xl font-normal">
              CivicFlow helps municipal departments track road quality, streetlights, and public infrastructure. Identify assets that need maintenance before serious damage occurs.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={onExploreDashboard}
                className="flex items-center space-x-2"
              >
                <span>Explore Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <a 
                href="#how-it-works"
                className="px-5 py-2.5 text-sm font-medium text-[#1A1A1A] hover:bg-gray-100 border border-[#DDE1E5] bg-white rounded transition-colors"
              >
                How It Works
              </a>
            </div>

            <div className="pt-4 border-t border-[#DDE1E5] flex flex-wrap items-center gap-6 text-xs text-[#5F6368]">
              <div>Target Window: <strong className="text-[#1A1A1A]">Next 30 Days</strong></div>
              <div>Coverage: <strong className="text-[#1A1A1A]">City Infrastructure</strong></div>
              <div>Decision Basis: <strong className="text-[#1A1A1A]">Condition & Community Reports</strong></div>
            </div>
          </div>

          {/* Right Hero Visual: Clean Infrastructure Card Preview */}
          <div className="lg:col-span-5">
            <div className="gov-card p-0 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-[#126B37] text-white px-4 py-3 flex items-center justify-between text-xs">
                <span className="flex items-center space-x-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#86EFAC]"></span>
                  <span>Maintenance Priority Overview</span>
                </span>
                <span className="text-[#D1E7DD]">Ward 4</span>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4 bg-white">
                <div className="flex items-start justify-between border-b border-[#DDE1E5] pb-3">
                  <div>
                    <span className="text-xs text-[#5F6368]">Top Priority Asset</span>
                    <div className="text-base font-bold text-[#1A1A1A]">{topAsset.name}</div>
                    <div className="text-xs text-[#5F6368] mt-0.5">{topAsset.location}</div>
                  </div>
                  <StatusBadge level={topAsset.risk_level} />
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-2.5 bg-[#F7F8FA] rounded border border-[#DDE1E5]">
                    <span className="text-[#5F6368] block text-[11px]">Risk Level</span>
                    <span className="text-lg font-bold text-red-600">{topAsset.risk_score}</span>
                  </div>
                  <div className="p-2.5 bg-[#F7F8FA] rounded border border-[#DDE1E5]">
                    <span className="text-[#5F6368] block text-[11px]">Urgency</span>
                    <span className="text-lg font-bold text-orange-600">{topAsset.urgency_score}</span>
                  </div>
                  <div className="p-2.5 bg-[#F7F8FA] rounded border border-[#DDE1E5]">
                    <span className="text-[#5F6368] block text-[11px]">Priority</span>
                    <span className="text-lg font-bold text-[#168A44]">{topAsset.priority_score}</span>
                  </div>
                </div>

                {/* Key Reason */}
                <div className="p-3 bg-[#F7F8FA] rounded border border-[#DDE1E5] text-xs">
                  <span className="text-[#5F6368] font-medium block mb-1">Recommended Action:</span>
                  <div className="font-semibold text-[#1A1A1A]">
                    {topAsset.recommended_action}
                  </div>
                </div>

                {/* Bottom link */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-[#5F6368]">Suggested Window: <strong>7 Days</strong></span>
                  <button 
                    onClick={onExploreDashboard}
                    className="font-semibold text-[#168A44] hover:underline flex items-center"
                  >
                    View Details <ChevronRight className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 border-b border-[#DDE1E5] bg-[#F7F8FA]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase text-[#168A44] tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">
              How CivicFlow Works
            </h2>
            <p className="text-sm text-[#5F6368]">
              Connecting field inspections, citizen reports, and maintenance planning into a clear workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-[#DDE1E5] rounded gov-card space-y-3">
              <div className="w-8 h-8 rounded bg-[#DCFCE7] text-[#168A44] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A]">Collect Infrastructure Data</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Gathers road condition surveys, previous repair history, weather exposure, and community grievance reports.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#DDE1E5] rounded gov-card space-y-3">
              <div className="w-8 h-8 rounded bg-[#DCFCE7] text-[#168A44] flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A]">Calculate Maintenance Priority</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Evaluates which assets need intervention earliest by balancing physical wear, urgency, and public usage.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#DDE1E5] rounded gov-card space-y-3">
              <div className="w-8 h-8 rounded bg-[#DCFCE7] text-[#168A44] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-[#1A1A1A]">Recommend Clear Actions</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Provides maintenance officers with specific recommendations, estimated budget bands, and clear deadlines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: INFRASTRUCTURE CATEGORIES */}
      <section id="infrastructure" className="bg-white border-b border-[#DDE1E5] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase text-[#168A44] tracking-wider">
              Asset Types
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">
              Infrastructure Categories
            </h2>
            <p className="text-sm text-[#5F6368]">
              Comprehensive tracking across critical municipal assets.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Roads', icon: Building, count: counts.roads, status: 'Active' },
              { name: 'Bridges', icon: Building2, count: counts.bridges, status: 'Monitored' },
              { name: 'Streetlights', icon: Lightbulb, count: counts.streetlights, status: 'Active' },
              { name: 'Water Systems', icon: Droplets, count: '62 Lines', status: 'Planned' },
              { name: 'Public Buildings', icon: Building2, count: '45 Facilities', status: 'Monitored' },
              { name: 'Drainage', icon: Waves, count: '88 Channels', status: 'Monitored' }
            ].map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="p-4 bg-[#F7F8FA] border border-[#DDE1E5] rounded gov-card text-center space-y-2 hover:border-[#168A44] transition-colors">
                  <div className="w-10 h-10 mx-auto rounded bg-white border border-[#DDE1E5] text-[#168A44] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-xs text-[#1A1A1A]">{cat.name}</div>
                  <div className="text-[11px] text-[#5F6368]">{cat.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: CALL TO ACTION */}
      <section className="bg-[#F7F8FA] py-16 px-4 sm:px-6 lg:px-8 border-b border-[#DDE1E5]">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Access the Infrastructure Management Platform
          </h2>
          <p className="text-sm text-[#5F6368] leading-relaxed">
            Sign in to view operational maintenance queues, report issues, or oversee ward infrastructure health.
          </p>
          <div>
            <Button variant="primary" size="lg" onClick={onExploreDashboard}>
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
