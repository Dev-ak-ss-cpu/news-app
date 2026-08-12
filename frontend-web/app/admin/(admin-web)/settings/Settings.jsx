"use client";
import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Spinner,
  addToast,
} from '@heroui/react';
import { Settings as SettingsIcon, Save, Video, Clock, X, CheckCircle2 } from 'lucide-react';
import { genericGetApi, genericPutApi, getYouTubeId } from '@/app/Helper';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    breakingNewsExpiryHours: 24,
    trendingNewsExpiryHours: 48,
    liveVideoUrl: "",
  });

  // Parsed live so the admin sees whether the pasted link will work
  const liveVideoId = useMemo(
    () => getYouTubeId(settings.liveVideoUrl),
    [settings.liveVideoUrl]
  );
  const hasInvalidUrl = Boolean(settings.liveVideoUrl.trim()) && !liveVideoId;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await genericGetApi("/api/settings");
      if (response.success && response.data) {
        setSettings({
          breakingNewsExpiryHours: response.data.breakingNewsExpiryHours || 24,
          trendingNewsExpiryHours: response.data.trendingNewsExpiryHours || 48,
          liveVideoUrl: response.data.liveVideoUrl || "",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      addToast({
        title: "Error",
        description: "Failed to load settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (hasInvalidUrl) {
      addToast({
        title: "Invalid YouTube link",
        description: "Paste a full video URL, e.g. https://www.youtube.com/watch?v=VIDEO_ID",
      });
      return;
    }

    try {
      setSaving(true);
      const response = await genericPutApi("/api/settings", {
        ...settings,
        liveVideoUrl: settings.liveVideoUrl.trim(),
      });
      if (response.success) {
        // Use the normalised URL the server stored
        if (response.data) {
          setSettings((prev) => ({
            ...prev,
            liveVideoUrl: response.data.liveVideoUrl || "",
          }));
        }
        addToast({
          title: "Success",
          description: "Settings saved successfully",
        });
      } else {
        addToast({
          title: "Error",
          description: response.message || "Failed to save settings",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      addToast({
        title: "Error",
        description: "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto py-8">
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <SettingsIcon size={20} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Breaking News Expiry */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              Breaking News Expiry (Hours)
            </label>
            <Input
              type="number"
              min="1"
              value={settings.breakingNewsExpiryHours}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  breakingNewsExpiryHours: parseInt(e.target.value) || 24,
                })
              }
              placeholder="24"
              variant="bordered"
              className="max-w-xs"
            />
            <p className="text-xs text-gray-500">
              Articles marked as breaking news will automatically become regular after this duration
            </p>
          </div>

          {/* Trending News Expiry */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              Trending News Expiry (Hours)
            </label>
            <Input
              type="number"
              min="1"
              value={settings.trendingNewsExpiryHours}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  trendingNewsExpiryHours: parseInt(e.target.value) || 48,
                })
              }
              placeholder="48"
              variant="bordered"
              className="max-w-xs"
            />
            <p className="text-xs text-gray-500">
              Articles marked as trending will automatically become regular after this duration
            </p>
          </div>

          {/* Live Video URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Video size={16} className="text-gray-500" />
              Live Video URL
            </label>
            <Input
              type="url"
              value={settings.liveVideoUrl}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  liveVideoUrl: e.target.value,
                })
              }
              placeholder="https://www.youtube.com/watch?v=Cy2JyWkya5w"
              variant="bordered"
              className="w-full"
              isInvalid={hasInvalidUrl}
              errorMessage={
                hasInvalidUrl ? "That doesn't look like a YouTube video link" : undefined
              }
              endContent={
                settings.liveVideoUrl ? (
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, liveVideoUrl: "" })}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Clear live video URL"
                  >
                    <X size={16} />
                  </button>
                ) : null
              }
            />
            <p className="text-xs text-gray-500">
              Paste the full YouTube link — watch, live, youtu.be, shorts or embed URLs all work.
              Leave it empty to hide the live player from the site.
            </p>

            {liveVideoId && (
              <div className="pt-2 space-y-2">
                <p className="text-xs text-green-600 flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  Video ID detected: <strong>{liveVideoId}</strong>
                </p>
                <div className="max-w-md overflow-hidden rounded-lg border border-gray-200">
                  <iframe
                    key={liveVideoId}
                    src={`https://www.youtube.com/embed/${liveVideoId}`}
                    title="Live stream preview"
                    className="aspect-video w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-xs text-gray-500">
                  This is how the live player will appear on the site.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button
              color="primary"
              onPress={handleSave}
              isLoading={saving}
              isDisabled={hasInvalidUrl}
              startContent={!saving && <Save size={16} />}
              className="min-w-[120px]"
            >
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
