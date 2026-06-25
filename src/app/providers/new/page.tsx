'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ArrowLeft,
  Save,
  Plus,
  X
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewProviderPage() {
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [newService, setNewService] = useState('');
  const [newArea, setNewArea] = useState('');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddService = () => {
    if (newService && !services.includes(newService)) {
      setServices([...services, newService]);
      setNewService('');
    }
  };

  const handleRemoveService = (service: string) => {
    setServices(services.filter(s => s !== service));
  };

  const handleAddArea = () => {
    if (newArea && !areas.includes(newArea)) {
      setAreas([...areas, newArea]);
      setNewArea('');
    }
  };

  const handleRemoveArea = (area: string) => {
    setAreas(areas.filter(a => a !== area));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSaving(false);
    router.push('/providers');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg">
      <Header />
      
      <main className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Link 
            href="/providers"
            className="p-2 rounded-lg bg-white/[0.05] text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="w-7 h-7 text-cyan-400" />
              New Provider
            </h1>
            <p className="text-sm text-white/40 mt-1">Add a new service provider to the database</p>
          </div>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="p-6 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06] space-y-6"
        >
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-white/60 mb-2">Business Name *</label>
              <input 
                required
                type="text"
                placeholder="e.g., Quick Fix Plumbing"
                className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            
            <div>
              <label className="block text-sm text-white/60 mb-2">Contact Person</label>
              <input 
                type="text"
                placeholder="e.g., John Smith"
                className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            
            <div>
              <label className="block text-sm text-white/60 mb-2">Phone Number</label>
              <input 
                type="tel"
                placeholder="e.g., (555) 123-4567"
                className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            
            <div>
              <label className="block text-sm text-white/60 mb-2">Email Address</label>
              <input 
                type="email"
                placeholder="e.g., contact@company.com"
                className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Services Offered</label>
            <div className="flex gap-2 mb-3">
              <input 
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                placeholder="Add a service (e.g., Plumbing, Electrical)"
                className="flex-1 bg-black/30 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                type="button"
                onClick={handleAddService}
                className="px-4 py-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {services.map(service => (
                <span 
                  key={service}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-sm"
                >
                  {service}
                  <button
                    type="button"
                    onClick={() => handleRemoveService(service)}
                    className="hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Service Areas */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Service Areas</label>
            <div className="flex gap-2 mb-3">
              <input 
                type="text"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddArea())}
                placeholder="Add an area (e.g., Downtown, Brooklyn)"
                className="flex-1 bg-black/30 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                type="button"
                onClick={handleAddArea}
                className="px-4 py-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {areas.map(area => (
                <span 
                  key={area}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm"
                >
                  {area}
                  <button
                    type="button"
                    onClick={() => handleRemoveArea(area)}
                    className="hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-6 pt-4 border-t border-white/[0.06]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-white/[0.2] bg-black/30 text-cyan-500 focus:ring-cyan-500/20" />
              <span className="text-white/80">Available for emergency calls</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/[0.2] bg-black/30 text-cyan-500 focus:ring-cyan-500/20" />
              <span className="text-white/80">Active provider</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link 
              href="/providers"
              className="px-6 py-3 rounded-lg bg-white/[0.05] text-white/60 hover:bg-white/[0.08] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Provider
                </>
              )}
            </button>
          </div>
        </motion.form>
      </main>
    </div>
  );
}
