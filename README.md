# Gnist

Desktop-app for å lære låter på gitar med fingerspill. Et animert gripebrett viser venstrehåndsgrepet og lyser opp strengen som plukkes, i takt med ekte gitarlyd, tabulatur, tempo og loop.

Bygget med **Tauri 2**, **React 19**, **TypeScript** og **Vite**. Designet ligger i [`design_handoff_gnist/`](design_handoff_gnist/README.md).

## Kom i gang

Du trenger Node 20+ og Rust (stable). Gitar-samplene er sjekket inn, så du trenger ikke laste dem ned.

```bash
npm install
npm run app:dev      # starter desktop-appen med hot reload
npm run dev          # bare nettleserversjonen på http://localhost:1420
npm run app:build    # bygger installasjonsprogram (.exe) i <cargo-target>/release/bundle/nsis
```

Andre kommandoer:

```bash
npm test             # enhetstester (Vitest)
npm run typecheck    # TypeScript
npm run fetch-samples  # henter gitar-samplene på nytt ved behov
```

## Struktur

```
src/
  data/music.ts          akkorder, plukkemønstre, låter og øvelser
  audio/engine.ts        sample-basert nylongitar (én stemme per streng)
  audio/scheduler.ts     lookahead-scheduler på AudioContext-klokka
  store/                 lagring bak et KeyValueStore-grensesnitt (localStorage i dag)
  lib/                   ren logikk: statistikk, streak, kveldens økt, filtre, avspillingsposisjon
  views/                 Hjem, Bibliotek, Teknikk, Fremdrift, Stemmer
  views/practice/        øvingsvisningen: gripebrett, tab, transport, innstillinger
src-tauri/               Tauri-skallet (Rust)
public/samples/nylon/    gitar-samples, ett per MIDI-tone (E2–E5)
```

## Hvordan ting fungerer

- **Avspilling:** hver takt er 8 åttendedeler med én akkord. Lyden planlegges ca. 120 ms fram i tid på AudioContext-klokka, og gripebrettet oppdateres når tonen faktisk klinger, så lyd og bilde holder takten.
- **Lagring:** all fremdrift lagres lokalt. `src/store/storage.ts` definerer `KeyValueStore`, og for å bytte til en database lager du en ny implementasjon av det grensesnittet.
- **Øvingstid:** telles bare mens avspillingen går. En dag teller i streaken etter 5 minutter.
- **Mestring:** settes manuelt i øvingsvisningen (glidebryter og «Marker som mestret»).
- **Kveldens økt:** bygges fra fremdriften din: oppvarming, én øvelse du er i gang med og låten du sist øvde på, med loop rundt der du slapp.

## Kjente begrensninger

- Arrangementene er generert fra akkord og mønster, ikke ekte transkripsjoner.
- Videofeltet er en plassholder.
- Stemmeapparatet spiller ekte referansetoner, men nålen er simulert. Mikrofonlytting kommer senere.

## Lisens for lyd

Gitarlyden er «Acoustic Guitar (nylon)» fra FluidR3 GM-soundfonten av Frank Wen, gjengitt som MP3 av [midi-js-soundfonts](https://github.com/gleitz/midi-js-soundfonts), og lisensiert under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Se [`public/samples/CREDITS.txt`](public/samples/CREDITS.txt).
