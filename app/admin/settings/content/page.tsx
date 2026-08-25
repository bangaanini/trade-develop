"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

type TabType = 'company' | 'journey' | 'leading';

export default function ContentEditorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('company');
  
  const [content, setContent] = useState({
    section_company_title: "",
    section_company_text1: "",
    section_company_text2: "",
    section_journey_title: "",
    section_journey_card1_title: "",
    section_journey_card1_text: "",
    section_journey_card2_title: "",
    section_journey_card2_text: "",
    section_journey_card3_title: "",
    section_journey_card3_text: "",
    section_leading_title: "",
    section_leading_subtitle: "",
    section_leading_card1_title: "",
    section_leading_card1_text1: "",
    section_leading_card1_text2: "",
    section_leading_card2_title: "",
    section_leading_card2_text1: "",
    section_leading_card2_text2: "",
    section_leading_card3_title: "",
    section_leading_card3_text1: "",
    section_leading_card3_text2: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      
      if (data.success) {
        const settings = data.data.settings.content || {};
        setContent({...content, ...settings});
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Error loading content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const res = await fetch('/api/admin/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: content }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Content saved successfully!');
        router.refresh();
      } else {
        toast.error(data.error || 'Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Error saving content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin/settings')}
          className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-2"
        >
          ← Back to Settings
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-2">Content Editor</h1>
        <p className="text-muted-foreground">Edit homepage sections</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('company')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'company'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Company Introduction
        </button>
        <button
          onClick={() => setActiveTab('journey')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'journey'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Journey Start
        </button>
        <button
          onClick={() => setActiveTab('leading')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'leading'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Leading Platform
        </button>
      </div>

      {/* Company Introduction Tab */}
      {activeTab === 'company' && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Section Title</label>
            <input
              type="text"
              value={content.section_company_title}
              onChange={(e) => setContent({...content, section_company_title: e.target.value})}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Paragraph 1</label>
            <textarea
              value={content.section_company_text1}
              onChange={(e) => setContent({...content, section_company_text1: e.target.value})}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Paragraph 2</label>
            <textarea
              value={content.section_company_text2}
              onChange={(e) => setContent({...content, section_company_text2: e.target.value})}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
          </div>
        </div>
      )}

      {/* Journey Start Tab */}
      {activeTab === 'journey' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <label className="block text-sm font-medium mb-2">Section Title</label>
            <input
              type="text"
              value={content.section_journey_title}
              onChange={(e) => setContent({...content, section_journey_title: e.target.value})}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Card 1 */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold">Card 1</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={content.section_journey_card1_title}
                onChange={(e) => setContent({...content, section_journey_card1_title: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={content.section_journey_card1_text}
                onChange={(e) => setContent({...content, section_journey_card1_text: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold">Card 2</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={content.section_journey_card2_title}
                onChange={(e) => setContent({...content, section_journey_card2_title: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={content.section_journey_card2_text}
                onChange={(e) => setContent({...content, section_journey_card2_text: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold">Card 3</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={content.section_journey_card3_title}
                onChange={(e) => setContent({...content, section_journey_card3_title: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={content.section_journey_card3_text}
                onChange={(e) => setContent({...content, section_journey_card3_text: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>
          </div>
        </div>
      )}

      {/* Leading Platform Tab */}
      {activeTab === 'leading' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Section Title</label>
              <input
                type="text"
                value={content.section_leading_title}
                onChange={(e) => setContent({...content, section_leading_title: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Section Subtitle</label>
              <textarea
                value={content.section_leading_subtitle}
                onChange={(e) => setContent({...content, section_leading_subtitle: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
              />
            </div>
          </div>

          {/* Card 1 */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold">Card 1 - Safe and Secure</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={content.section_leading_card1_title}
                onChange={(e) => setContent({...content, section_leading_card1_title: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Point 1</label>
              <input
                type="text"
                value={content.section_leading_card1_text1}
                onChange={(e) => setContent({...content, section_leading_card1_text1: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Point 2</label>
              <input
                type="text"
                value={content.section_leading_card1_text2}
                onChange={(e) => setContent({...content, section_leading_card1_text2: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold">Card 2 - World Ecological</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={content.section_leading_card2_title}
                onChange={(e) => setContent({...content, section_leading_card2_title: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Point 1</label>
              <input
                type="text"
                value={content.section_leading_card2_text1}
                onChange={(e) => setContent({...content, section_leading_card2_text1: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Point 2</label>
              <input
                type="text"
                value={content.section_leading_card2_text2}
                onChange={(e) => setContent({...content, section_leading_card2_text2: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold">Card 3 - User Friendly</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={content.section_leading_card3_title}
                onChange={(e) => setContent({...content, section_leading_card3_title: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Point 1</label>
              <input
                type="text"
                value={content.section_leading_card3_text1}
                onChange={(e) => setContent({...content, section_leading_card3_text1: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Point 2</label>
              <input
                type="text"
                value={content.section_leading_card3_text2}
                onChange={(e) => setContent({...content, section_leading_card3_text2: e.target.value})}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
        <button
          onClick={fetchSettings}
          className="px-6 py-3 bg-card border border-border rounded-lg hover:bg-muted"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
