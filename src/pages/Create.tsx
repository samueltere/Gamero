import React, { useEffect, useState } from 'react';
import { Loader2, Music2, UploadCloud, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { TrackCard } from '@/components/music/TrackCard';
import { TrackRow } from '@/components/music/TrackRow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMusic } from '@/contexts/MusicContext';
import { buildAlbumArt, createStudioTrack } from '@/lib/studio';
import type { Track } from '@/types/music';

const generationSteps = [
  'Shaping your arrangement...',
  'Blending the mood and genre...',
  'Sketching lyrics and cover direction...',
  'Finalizing your studio draft...',
];

export const Create: React.FC = () => {
  const { addToQueue, communityTracks, playTrack, saveStudioTrack, signIn, uploadTrack, user } = useMusic();
  const [activeTab, setActiveTab] = useState('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedTrack, setGeneratedTrack] = useState<Track | null>(null);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    artist: '',
    genre: 'Afrobeats',
    description: '',
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');

  const [studioPrompt, setStudioPrompt] = useState('');
  const [studioGenre, setStudioGenre] = useState('Afrobeats');
  const [studioMood, setStudioMood] = useState('Chill');
  const [coverRefreshCount, setCoverRefreshCount] = useState(0);

  useEffect(() => {
    if (!imageFile) {
      setCoverPreview('');
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setCoverPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const draftCover = buildAlbumArt({
    title: generatedTrack?.title || 'Draft Cover',
    genre: studioGenre,
    mood: studioMood,
    prompt: `${studioPrompt} ${coverRefreshCount}`,
  });
  const ownerName = user?.displayName?.trim() || user?.email?.split('@')[0] || 'Your account';
  const isUploadReady = Boolean(uploadForm.title.trim() && audioFile && imageFile && user);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!uploadForm.title.trim()) {
      toast.error('Add a track title before publishing.');
      return;
    }

    if (!audioFile || !imageFile) {
      toast.error('Add both an audio file and a cover image from your device.');
      return;
    }

    if (!user) {
      toast.error('Continue with Google before publishing music.');
      return;
    }

    setIsUploading(true);

    try {
      const newTrack = await uploadTrack({
        title: uploadForm.title,
        genre: uploadForm.genre,
        description: uploadForm.description,
        audioFile,
        imageFile,
      });

      toast.success('Your track is live on Gemero.');
      playTrack(newTrack);
      setUploadForm({
        title: '',
        genre: 'Afrobeats',
        description: '',
      });
      setAudioFile(null);
      setImageFile(null);
      setCoverPreview('');
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, 'Upload failed. Please check your files and try again.'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!studioPrompt.trim()) {
      toast.error('Enter a short prompt before generating a draft.');
      return;
    }

    setIsGenerating(true);
    setGenerationStep(0);

    const interval = window.setInterval(() => {
      setGenerationStep((current) => Math.min(current + 1, generationSteps.length - 1));
    }, 550);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 1800));
      const draftTrack = createStudioTrack({
        prompt: `${studioPrompt} ${coverRefreshCount}`,
        genre: studioGenre,
        mood: studioMood,
      });
      setGeneratedTrack(draftTrack);
      toast.success('Studio draft ready.');
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong while preparing the draft.');
    } finally {
      window.clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!generatedTrack) {
      return;
    }

    if (!user) {
      toast.error('Continue with Google before saving a draft.');
      return;
    }

    try {
      const savedTrack = await saveStudioTrack(generatedTrack);
      setGeneratedTrack(savedTrack);
      toast.success('Studio draft saved to your library.');
    } catch (error) {
      console.error(error);
      toast.error('Could not save that draft right now.');
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <Card className="rounded-[34px] p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--gamero-muted)]">Creation lab</p>
              <h1 className="mt-3 font-display text-4xl font-semibold">Upload original releases or shape a new sound inside Gemero&apos;s living studio.</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--gamero-muted)]">
                The studio should feel magical, not like a boring form. Publish real songs from your device, or use the orb-inspired draft flow when you want to explore a fresh direction.
              </p>
            </div>
            <div className="relative mx-auto h-52 w-52">
              <div className="gamero-orb absolute inset-0 rounded-[38%] blur-[1px]" />
              <div className="absolute inset-[18%] rounded-[42%] border border-white/15 bg-white/10 backdrop-blur-md" />
            </div>
          </div>
        </Card>

        <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="upload">Upload release</TabsTrigger>
            <TabsTrigger value="draft">Create draft</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Card className="rounded-[34px] p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-3xl font-semibold">Publish your music</h2>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">
                      Upload an audio file and a cover image from your device so everyone can stream your release.
                    </p>
                  </div>
                  {!user && (
                    <Button onClick={signIn} variant="outline" className="rounded-full px-5">
                      Continue with Google
                    </Button>
                  )}
                </div>

                <form onSubmit={handleUpload} className="mt-8 space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      value={uploadForm.title}
                      onChange={(event) => setUploadForm((current) => ({ ...current, title: event.target.value }))}
                      placeholder="Track title"
                    />
                    <div className="flex h-12 items-center rounded-2xl border border-[var(--gamero-border)] bg-white/8 px-4 text-sm text-[var(--gamero-muted)]">
                      Publishing as <span className="ml-2 truncate font-semibold text-[var(--gamero-text)]">{ownerName}</span>
                    </div>
                  </div>

                  <select
                    value={uploadForm.genre}
                    onChange={(event) => setUploadForm((current) => ({ ...current, genre: event.target.value }))}
                    className="h-12 w-full rounded-2xl border border-[var(--gamero-border)] bg-white/8 px-4 text-[var(--gamero-text)] focus:border-[var(--gamero-accent)]/60 focus:outline-none"
                  >
                    {['Afrobeats', 'Hip-Hop', 'Pop', 'R&B', 'Gospel', 'Amapiano'].map((genre) => (
                      <option key={genre} value={genre} className="bg-[var(--gamero-bg)] text-[var(--gamero-text)]">
                        {genre}
                      </option>
                    ))}
                  </select>

                  <textarea
                    value={uploadForm.description}
                    onChange={(event) => setUploadForm((current) => ({ ...current, description: event.target.value }))}
                    placeholder="Short description for listeners"
                    className="min-h-32 w-full rounded-[24px] border border-[var(--gamero-border)] bg-white/8 p-4 text-[var(--gamero-text)] placeholder:text-[var(--gamero-muted)] focus:border-[var(--gamero-accent)]/60 focus:outline-none"
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="rounded-[26px] border border-dashed border-[var(--gamero-border)] bg-white/[0.03] p-5">
                      <p className="text-sm font-medium">Audio file</p>
                      <p className="mt-2 truncate text-sm text-[var(--gamero-muted)]">{audioFile ? audioFile.name : 'Choose MP3, WAV, or another playable format'}</p>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(event) => setAudioFile(event.target.files?.[0] || null)}
                        className="mt-4 block w-full text-sm text-[var(--gamero-muted)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--gamero-accent)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                      />
                    </label>

                    <label className="rounded-[26px] border border-dashed border-[var(--gamero-border)] bg-white/[0.03] p-5">
                      <p className="text-sm font-medium">Cover image</p>
                      <p className="mt-2 truncate text-sm text-[var(--gamero-muted)]">{imageFile ? imageFile.name : 'Choose JPG, PNG, or WEBP from your device'}</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                        className="mt-4 block w-full text-sm text-[var(--gamero-muted)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--gamero-accent)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                      />
                    </label>
                  </div>

                  <Button type="submit" disabled={isUploading || !isUploadReady} className="rounded-full px-6">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4" />
                        Publish release
                      </>
                    )}
                  </Button>
                </form>
              </Card>

              <Card className="rounded-[34px] p-6 md:p-8">
                <h2 className="font-display text-3xl font-semibold">Release preview</h2>
                <p className="mt-3 text-sm leading-7 text-zinc-400">Your cover uploads from the device and becomes the artwork listeners see.</p>
                <div className="mt-6 overflow-hidden rounded-[30px] border border-white/8 bg-white/[0.04] p-5">
                  <div className="overflow-hidden rounded-[26px]">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Upload preview" className="aspect-square w-full object-cover" />
                    ) : (
                      <div className="flex aspect-square items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(147,248,114,0.15),_transparent_38%),#0d1324]">
                        <Music2 className="h-16 w-16 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <div className="mt-5">
                    <p className="text-xl font-semibold">{uploadForm.title || 'Untitled release'}</p>
                    <p className="mt-1 text-[var(--gamero-muted)]">{ownerName}</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--gamero-muted)]">{uploadForm.description || 'Add a short note to tell listeners what this release is about.'}</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="draft">
            <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
              <Card className="rounded-[34px] p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-3xl font-semibold">Build a fast draft</h2>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">
                      Start from a mood, genre, or short idea. Gemero turns that into a playable draft with lyrics and a cover concept that feels alive.
                    </p>
                  </div>
                  <Button variant="outline" className="rounded-full px-5" onClick={() => setCoverRefreshCount((current) => current + 1)}>
                    Refresh cover
                  </Button>
                </div>

                <div className="mt-8 space-y-5">
                  <div className="relative overflow-hidden rounded-[30px] border border-[var(--gamero-border)] bg-white/8 p-5">
                    <div className="gamero-orb absolute left-[-20px] top-[-16px] h-28 w-28 opacity-85" />
                    <div className="relative">
                      <p className="text-xs uppercase tracking-[0.28em] text-[var(--gamero-muted)]">Creation orb</p>
                      <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--gamero-muted)]">
                        Type a vibe, let the orb react, and shape a first draft without turning the process into a technical dashboard.
                      </p>
                    </div>
                  </div>

                  <textarea
                    value={studioPrompt}
                    onChange={(event) => setStudioPrompt(event.target.value)}
                    placeholder="Example: warm afro-fusion track for a sunset rooftop set"
                    className="min-h-36 w-full rounded-[26px] border border-white/10 bg-white/5 p-4 text-white placeholder:text-zinc-500 focus:border-gamero-lime/60 focus:outline-none"
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <select
                      value={studioGenre}
                      onChange={(event) => setStudioGenre(event.target.value)}
                      className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-white focus:border-gamero-lime/60 focus:outline-none"
                    >
                      {['Afrobeats', 'Hip-Hop', 'Pop', 'R&B', 'Gospel'].map((genre) => (
                        <option key={genre} value={genre} className="bg-gamero-bg text-white">
                          {genre}
                        </option>
                      ))}
                    </select>

                    <select
                      value={studioMood}
                      onChange={(event) => setStudioMood(event.target.value)}
                      className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-white focus:border-gamero-lime/60 focus:outline-none"
                    >
                      {['Chill', 'Energetic', 'Reflective', 'Warm', 'Confident', 'Dark'].map((mood) => (
                        <option key={mood} value={mood} className="bg-gamero-bg text-white">
                          {mood}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleGenerate} disabled={isGenerating} className="rounded-full px-6">
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Preparing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4" />
                          Generate draft
                        </>
                      )}
                    </Button>
                    {generatedTrack && (
                      <>
                        <Button variant="outline" className="rounded-full px-6" onClick={() => addToQueue(generatedTrack)}>
                          Queue draft
                        </Button>
                        <Button variant="outline" className="rounded-full px-6" onClick={handleSaveDraft}>
                          Save to library
                        </Button>
                      </>
                    )}
                  </div>

                  {isGenerating && (
                    <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                      <p className="text-sm font-medium text-white">{generationSteps[generationStep]}</p>
                    </div>
                  )}
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-[34px] p-6 md:p-8">
                  <h2 className="font-display text-3xl font-semibold">Cover concept</h2>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">Every draft includes a fresh cover so the result feels ready to play.</p>
                  <div className="mt-6 overflow-hidden rounded-[30px]">
                    <img src={generatedTrack?.albumArt || draftCover} alt="Draft cover" className="aspect-square w-full object-cover" />
                  </div>
                </Card>

                {generatedTrack ? (
                  <TrackCard track={generatedTrack} />
                ) : (
                  <Card className="rounded-[34px] p-6 md:p-8">
                    <h3 className="font-display text-2xl font-semibold">Draft preview</h3>
                    <p className="mt-4 text-sm leading-7 text-zinc-400">
                      Generate a studio draft to see the title, artwork, and playback card here.
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <section>
          <div>
            <h2 className="font-display text-3xl font-semibold">Fresh community uploads</h2>
            <p className="mt-2 text-sm text-zinc-400">New releases from the people publishing directly into Gemero.</p>
          </div>
          <Card className="mt-5 rounded-[32px] p-4">
            <div className="space-y-2">
              {communityTracks.slice(0, 5).map((track, index) => (
                <TrackRow key={track.id} track={track} index={index + 1} />
              ))}
              {communityTracks.length === 0 && <p className="p-4 text-sm text-zinc-500">No community uploads yet. Publish the first one from the form above.</p>}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    try {
      const parsed = JSON.parse(error.message) as { error?: unknown };
      if (typeof parsed.error === 'string' && parsed.error.trim()) {
        return parsed.error;
      }
      if (parsed.error && typeof parsed.error === 'object') {
        const nestedMessage = Reflect.get(parsed.error, 'message');
        if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
          return nestedMessage;
        }
      }
    } catch {
      return error.message;
    }
    return error.message;
  }

  if (error && typeof error === 'object') {
    const maybeMessage = Reflect.get(error, 'message');
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage;
    }

    const maybeError = Reflect.get(error, 'error');
    if (typeof maybeError === 'string' && maybeError.trim()) {
      return maybeError;
    }

    if (maybeError && typeof maybeError === 'object') {
      const nestedMessage = Reflect.get(maybeError, 'message');
      if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
        return nestedMessage;
      }
    }
  }

  return fallback;
}
