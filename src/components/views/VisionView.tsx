import React, { useState } from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

type CoreValueKey = 'core-value-1' | 'core-value-2' | 'core-value-3';

export const VisionView: React.FC = () => {
  const { settings, loading, updateVision, updateCoreValue } = useUserSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState<CoreValueKey | null>(null);
  const [visionText, setVisionText] = useState(settings?.vision || '');
  const [editValue, setEditValue] = useState('');
  const { toast } = useToast();

  // Update lokale state wanneer settings worden geladen
  React.useEffect(() => {
    if (settings) {
      setVisionText(settings.vision || '');
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateVision(visionText);
      setIsEditing(false);
      toast({
        title: "Vision opgeslagen",
        description: "Je visie is succesvol bijgewerkt.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Er ging iets mis bij het opslaan van je visie.",
        variant: "destructive",
      });
    }
  };

  const handleEditValue = (key: CoreValueKey) => {
    setEditingValue(key);
    setEditValue(settings?.[key] || '');
  };

  const handleSaveValue = async () => {
    if (!editingValue) return;

    try {
      await updateCoreValue(editingValue, editValue);
      setEditingValue(null);
      toast({
        title: "Core Value opgeslagen",
        description: "Je kernwaarde is succesvol bijgewerkt.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Er ging iets mis bij het opslaan van je kernwaarde.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Vision & Long-term Goals</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Vision & Long-term Goals</h1>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Long-term Vision</h2>
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={visionText}
                onChange={(e) => setVisionText(e.target.value)}
                className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Schrijf hier je visie en lange termijn doelen..."
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setVisionText(settings?.vision || '');
                  }}
                >
                  Annuleren
                </Button>
                <Button onClick={handleSave}>Opslaan</Button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="min-h-[16rem] p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {visionText ? (
                <p className="whitespace-pre-wrap">{visionText}</p>
              ) : (
                <p className="text-gray-400 italic">
                  Klik hier om je visie en lange termijn doelen toe te voegen...
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Core Values</h2>
          <div className="space-y-6">
            {(['core-value-1', 'core-value-2', 'core-value-3'] as const).map((key, index) => (
              <div key={key} className="group">
                {editingValue === key ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{index + 1}.</span>
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder={`Voer kernwaarde ${index + 1} in...`}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingValue(null);
                          setEditValue('');
                        }}
                      >
                        Annuleren
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveValue}
                      >
                        Opslaan
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => handleEditValue(key)}
                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="font-medium">{index + 1}.</span>
                    {settings?.[key] ? (
                      <span>{settings[key]}</span>
                    ) : (
                      <span className="text-gray-400 italic">Klik om kernwaarde toe te voegen...</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
