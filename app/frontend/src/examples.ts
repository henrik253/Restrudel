// examples.ts — bundled demo tracks so the app is testable without a file of
// your own. Assets live in public/examples/ (served at /examples/...).
export interface ExampleSong {
  id: string;
  title: string;
  artist: string;
  url: string;
  /** filename handed to the pipeline when this example is loaded */
  fileName: string;
}

export const EXAMPLE_SONGS: ExampleSong[] = [
  {
    id: 'fur-elise',
    title: 'Für Elise',
    artist: 'Beethoven',
    url: '/examples/fur-elise.mp3',
    fileName: 'Beethoven - Für Elise.mp3',
  },
];
