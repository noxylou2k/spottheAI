"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CHALLENGES,
  CHAPTERS,
  REFERENCES,
  ROUNDS,
  STEPS,
  TEAM_COLORS,
  type ChoiceId,
  type RoundId,
  type StepId,
} from "../content";
import DitherVeil from "@/components/DitherVeil";
import { AiPhoto, RealPhoto } from "./Shots";

const STORAGE_KEY = "spot-the-ai-v1";
const TEAM_INDEXES = [0, 1, 2, 3];

type RoundPicks = Record<RoundId, Partial<Record<number, "A" | "B">>>;

type Save = {
  step: number;
  names: string[];
  challengePicks: Partial<Record<StepId, ChoiceId>>;
  roundPicks: RoundPicks;
  revealed: Partial<Record<RoundId, boolean>>;
  notes: string[];
  pledge: boolean[];
};

const EMPTY_PICKS: RoundPicks = {
  "round-1": {},
  "round-2": {},
  "round-3": {},
};

function defaultNames() {
  return ["Team 1", "Team 2", "Team 3", "Team 4"];
}

function emptySave(): Save {
  return {
    step: 0,
    names: defaultNames(),
    challengePicks: {},
    roundPicks: EMPTY_PICKS,
    revealed: {},
    notes: [],
    pledge: [false, false, false],
  };
}

function loadSave(): Save | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Save;
    if (!Array.isArray(data.names) || data.names.length !== 4) return null;
    if (typeof data.step !== "number") return null;
    return {
      ...emptySave(),
      ...data,
      names: data.names.map((name, index) => name.trim() || defaultNames()[index]),
      step: Math.min(Math.max(0, data.step), STEPS.length - 1),
      roundPicks: { ...EMPTY_PICKS, ...data.roundPicks },
      pledge: Array.isArray(data.pledge) && data.pledge.length === 3 ? data.pledge : [false, false, false],
      notes: Array.isArray(data.notes) ? data.notes.slice(0, 40) : [],
    };
  } catch {
    return null;
  }
}

function scoresFor(picks: RoundPicks, revealed: Save["revealed"]) {
  return TEAM_INDEXES.map((team) =>
    ROUNDS.reduce((total, round) => {
      if (!revealed[round.id]) return total;
      return total + (picks[round.id]?.[team] === round.correct ? 1 : 0);
    }, 0),
  );
}

export default function Workshop() {
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [names, setNames] = useState(defaultNames);
  const [challengePicks, setChallengePicks] = useState<Save["challengePicks"]>({});
  const [roundPicks, setRoundPicks] = useState<RoundPicks>(EMPTY_PICKS);
  const [revealed, setRevealed] = useState<Save["revealed"]>({});
  const [notes, setNotes] = useState<string[]>([]);
  const [pledge, setPledge] = useState([false, false, false]);
  const stageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const saved = loadSave();
    if (saved) {
      setStep(saved.step);
      setNames(saved.names);
      setChallengePicks(saved.challengePicks);
      setRoundPicks(saved.roundPicks);
      setRevealed(saved.revealed);
      setNotes(saved.notes);
      setPledge(saved.pledge);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const payload: Save = { step, names, challengePicks, roundPicks, revealed, notes, pledge };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [ready, step, names, challengePicks, roundPicks, revealed, notes, pledge]);

  useEffect(() => {
    stageRef.current?.scrollTo({ top: 0 });
  }, [step]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        document.getElementById("go-next")?.click();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        document.getElementById("go-back")?.click();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const scores = useMemo(() => scoresFor(roundPicks, revealed), [roundPicks, revealed]);
  const current = STEPS[step];
  const showScores = current.chapter === "Rounds" || current.chapter === "Scores";

  function goToChapter(chapter: string) {
    const index = STEPS.findIndex((item) => item.chapter === chapter);
    if (index >= 0) setStep(index);
  }

  function resetAll() {
    sessionStorage.removeItem(STORAGE_KEY);
    const fresh = emptySave();
    setStep(0);
    setNames(fresh.names);
    setChallengePicks({});
    setRoundPicks(EMPTY_PICKS);
    setRevealed({});
    setNotes([]);
    setPledge([false, false, false]);
  }

  if (!ready) {
    return (
      <div className="boot">
        <p>Spot the AI</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-row">
          <p className="brand">
            Spot the AI
            <span>Digital literacy masterclass</span>
          </p>
          {showScores ? (
            <ol className="score-strip" aria-label="Live scores">
              {names.map((name, index) => (
                <li key={index} style={{ ["--team" as string]: TEAM_COLORS[index] }}>
                  <span>{name}</span>
                  <strong>{scores[index]}</strong>
                </li>
              ))}
            </ol>
          ) : (
            <p className="top-meta">4 teams · 3 rounds · 15 minutes</p>
          )}
        </div>
        <nav className="chapters" aria-label="Workshop chapters">
          {CHAPTERS.map((chapter) => {
            const first = STEPS.findIndex((item) => item.chapter === chapter);
            const state = current.chapter === chapter ? "is-on" : step > first ? "is-done" : "";
            return (
              <button key={chapter} type="button" className={`chapter ${state}`} onClick={() => goToChapter(chapter)}>
                {chapter}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="stage" ref={stageRef}>
        <div className="wrap">
          {current.id === "welcome" && (
            <Welcome
              names={names}
              onName={(index, value) =>
                setNames((prev) => prev.map((name, i) => (i === index ? value : name)))
              }
              onStart={() => {
                setNames((prev) => prev.map((name, index) => name.trim() || defaultNames()[index]));
                setStep(1);
              }}
            />
          )}
          {current.id === "rules" && <Rules />}
          {current.id === "landscape" && <Landscape />}
          {current.id === "anatomy" && <Anatomy />}
          {current.id === "challenge-1" && (
            <Challenge
              id="challenge-1"
              pick={challengePicks["challenge-1"]}
              onPick={(choice) =>
                setChallengePicks((prev) => ({ ...prev, "challenge-1": choice }))
              }
            />
          )}
          {current.id === "video" && <VideoLesson />}
          {current.id === "writing" && <WritingLesson />}
          {current.id === "tools" && <ToolsLesson />}
          {current.id === "protocol" && <ProtocolLesson />}
          {current.id === "algorithm" && <AlgorithmLesson />}
          {current.id === "challenge-2" && (
            <Challenge
              id="challenge-2"
              pick={challengePicks["challenge-2"]}
              onPick={(choice) =>
                setChallengePicks((prev) => ({ ...prev, "challenge-2": choice }))
              }
            />
          )}
          {current.id.startsWith("round-") && (
            <Round
              id={current.id as RoundId}
              names={names}
              picks={roundPicks[current.id as RoundId]}
              open={Boolean(revealed[current.id as RoundId])}
              onPick={(team, choice) =>
                setRoundPicks((prev) => ({
                  ...prev,
                  [current.id]: { ...prev[current.id as RoundId], [team]: choice },
                }))
              }
            />
          )}
          {current.id === "finale" && (
            <Finale
              names={names}
              scores={scores}
              notes={notes}
              pledge={pledge}
              onNote={(note) => setNotes((prev) => [note, ...prev].slice(0, 40))}
              onPledge={(index) =>
                setPledge((prev) => prev.map((on, i) => (i === index ? !on : on)))
              }
              onReset={resetAll}
            />
          )}
        </div>
      </main>

      <footer className="dock">
        <p className="progress">
          {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
          <span>{current.chapter}</span>
        </p>
        <div className="dock-actions">
          <button id="go-back" type="button" className="btn ghost" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>
            Back
          </button>
          <DockNext
            stepId={current.id}
            challengePick={challengePicks[current.id]}
            roundPicks={current.id.startsWith("round-") ? roundPicks[current.id as RoundId] : undefined}
            revealed={current.id.startsWith("round-") ? Boolean(revealed[current.id as RoundId]) : false}
            onReveal={() => setRevealed((prev) => ({ ...prev, [current.id]: true }))}
            onNext={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}
          />
        </div>
      </footer>
    </div>
  );
}

function DockNext({
  stepId,
  challengePick,
  roundPicks,
  revealed,
  onReveal,
  onNext,
}: {
  stepId: StepId;
  challengePick?: ChoiceId;
  roundPicks?: Partial<Record<number, "A" | "B">>;
  revealed: boolean;
  onReveal: () => void;
  onNext: () => void;
}) {
  if (stepId === "welcome" || stepId === "finale") return null;

  if (stepId === "challenge-1" || stepId === "challenge-2") {
    return (
      <button id="go-next" type="button" className="btn primary" disabled={!challengePick} onClick={onNext}>
        {challengePick ? "Continue" : "Pick an answer"}
      </button>
    );
  }

  if (stepId.startsWith("round-")) {
    const locked = TEAM_INDEXES.every((team) => roundPicks?.[team]);
    const waiting = TEAM_INDEXES.filter((team) => !roundPicks?.[team]).length;
    if (!revealed) {
      return (
        <button id="go-next" type="button" className="btn primary" disabled={!locked} onClick={onReveal}>
          {locked ? "Reveal answers" : `Waiting on ${waiting} team${waiting === 1 ? "" : "s"}`}
        </button>
      );
    }
    return (
      <button id="go-next" type="button" className="btn primary" onClick={onNext}>
        {stepId === "round-3" ? "Reveal scores" : "Next round"}
      </button>
    );
  }

  return (
    <button id="go-next" type="button" className="btn primary" onClick={onNext}>
      Continue
    </button>
  );
}

function Welcome({
  names,
  onName,
  onStart,
}: {
  names: string[];
  onName: (index: number, value: string) => void;
  onStart: () => void;
}) {
  return (
    <section className="hero">
      <div
        className="veil-frame"
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
          borderRadius: 18,
          border: "1px solid rgba(238, 243, 251, 0.12)",
          background: "#070b14",
        }}
      >
        <div
          className="veil-open"
          style={{
            position: "relative",
            height: 88,
            flex: "0 0 88px",
            overflow: "hidden",
          }}
        >
          <DitherVeil
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            fit="cover"
            pattern="bayer"
            pixelSize={5}
            palette="duotone"
            inkColor="#100e16"
            paperColor="#f4efe6"
            rim={0}
            contrast={1.25}
            brightness={0}
            revealRadius={120}
            softness={0.35}
            linger={0.45}
          />
        </div>
        <div
          className="hero-copy"
          style={{
            position: "relative",
            zIndex: 1,
            top: "auto",
            right: "auto",
            bottom: "auto",
            left: "auto",
            margin: 0,
            padding: "14px 16px 14px",
            background: "#070b14",
            border: "none",
            borderRadius: 0,
          }}
        >
          <p className="kicker">Interactive workshop</p>
          <h1>Can you beat the algorithm?</h1>
          <p className="lede">
            A practical field guide for spotting synthetic content, then a three-round game where all four teams play every question.
          </p>
          <button id="go-next" type="button" className="btn primary xl" onClick={onStart}>
            Start the workshop
          </button>
        </div>
      </div>
      <form
        className="team-setup"
        onSubmit={(event) => {
          event.preventDefault();
          onStart();
        }}
      >
        <p className="setup-label">Name the four teams</p>
        {names.map((name, index) => (
          <label key={index} className="team-field" style={{ ["--team" as string]: TEAM_COLORS[index] }}>
            <span>Team {index + 1}</span>
            <input
              value={name}
              maxLength={18}
              aria-label={`Team ${index + 1} name`}
              onChange={(event) => onName(index, event.target.value)}
            />
          </label>
        ))}
      </form>
    </section>
  );
}

function Rules() {
  const rules = [
    ["01", "Split into teams", "Four pads. One shared screen. Solo works too if a team is short."],
    ["02", "Two posts, one is AI", "Each round, every team commits before the reveal."],
    ["03", "Spot the AI, score a point", "One point per correct pick. Three points is a perfect game."],
  ];
  return (
    <section className="lesson">
      <p className="kicker">Game mode · Spot the AI</p>
      <h1>How a round works</h1>
      <ol className="rules">
        {rules.map(([index, title, body]) => (
          <li key={index}>
            <span>{index}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Landscape() {
  return (
    <section className="lesson">
      <p className="kicker">01 / The landscape</p>
      <h1>Why verification matters right now</h1>
      <div className="stat-block">
        <p>50%+</p>
        <span>Over half of social feed recommendations feature synthetic or AI-assisted images, text, or synthetic voice clips.</span>
      </div>
      <div className="tiles two">
        <article>
          <h2>Hyper-realistic deepfakes</h2>
          <p>Generative tools craft convincing human faces and voices instantly.</p>
        </article>
        <article>
          <h2>Emotional engagement bait</h2>
          <p>Synthetic stories evoke rage or shock to farm rapid reposts.</p>
        </article>
      </div>
    </section>
  );
}

function Anatomy() {
  const signals = [
    ["Anatomy and hands", "Fused fingers, extra digits, or impossible joint bends."],
    ["Garbled text", "Warped lettering on signs, clothes, or background posters."],
    ["Asymmetry", "Mismatched earrings, non-matching glasses frames, or odd teeth."],
    ["Plastic texture", "Overly smooth skin sheen lacking natural pores or fine wrinkles."],
  ];
  return (
    <section className="lesson">
      <p className="kicker">02 / Visual analysis</p>
      <h1>Anatomy of an AI image</h1>
      <p className="lede">Four signals worth zooming in on before you trust a face.</p>
      <div className="tiles four">
        {signals.map(([title, body]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Challenge({
  id,
  pick,
  onPick,
}: {
  id: "challenge-1" | "challenge-2";
  pick?: ChoiceId;
  onPick: (choice: ChoiceId) => void;
}) {
  const challenge = CHALLENGES[id];
  const locked = Boolean(pick);
  return (
    <section className="lesson">
      <p className="kicker">{challenge.kicker}</p>
      <h1>{challenge.title}</h1>
      <p className="scene">{challenge.scene}</p>
      <p className="prompt">{challenge.prompt}</p>
      <div className="options">
        {challenge.options.map((option) => {
          const state = !locked ? "" : option.id === challenge.correct ? "is-correct" : option.id === pick ? "is-wrong" : "";
          return (
            <button
              key={option.id}
              type="button"
              className={`option ${state} ${pick === option.id ? "is-picked" : ""}`}
              disabled={locked}
              onClick={() => onPick(option.id)}
            >
              <span className="letter">{option.id}</span>
              <span>
                <strong>{option.text}</strong>
                {locked && <em>{option.why}</em>}
              </span>
              {locked && (
                <span className="mark">{option.id === challenge.correct ? "This is the one" : option.id === pick ? "Not this one" : ""}</span>
              )}
            </button>
          );
        })}
      </div>
      {locked && <p className="answer-line">{challenge.answerTitle}</p>}
    </section>
  );
}

function VideoLesson() {
  return (
    <section className="lesson">
      <p className="kicker">04 / Video verification</p>
      <h1>Deepfake motion</h1>
      <ol className="rules compact">
        <li>
          <span>01</span>
          <h2>Unnatural eye behavior</h2>
          <p>Missing blinking rhythms, fixed stares, or shifting iris shapes.</p>
        </li>
        <li>
          <span>02</span>
          <h2>Audio-lip misalignment</h2>
          <p>Mouth movements fail to close on “M”, “B”, and “P”.</p>
        </li>
        <li>
          <span>03</span>
          <h2>Boundary morphing</h2>
          <p>Objects crossing in front of a face, like hands, cause a glitchy blur.</p>
        </li>
      </ol>
      <aside className="protip">
        <p>Pro tip · the slow-mo test</p>
        <strong>Scrub at 0.25×.</strong>
        <span>Generative models build frames one by one. Ears or teeth can vanish for a single frame.</span>
      </aside>
    </section>
  );
}

function WritingLesson() {
  return (
    <section className="lesson">
      <p className="kicker">05 / Written content</p>
      <h1>Human vs. AI on the feed</h1>
      <div className="compare">
        <article>
          <p>AI-generated captions</p>
          <ul>
            <li>Overuse of buzzwords: delve, tapestry, unleash.</li>
            <li>Ultra-balanced tone with no strong opinion.</li>
            <li>Perfectly uniform, robotic paragraph lengths.</li>
          </ul>
        </article>
        <article className="human">
          <p>Genuine human posts</p>
          <ul>
            <li>Organic slang, typos, and specific idioms.</li>
            <li>Personal anecdotes and a point of view.</li>
            <li>Varied sentence length and emotional cadence.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}

function ToolsLesson() {
  const tools = [
    ["Reverse image search", "Locate the original photo with Google Lens or TinEye and trace where it started."],
    ["Content credentials", "Look for a CR pin. It points at digital provenance metadata."],
    ["Fact-check outlets", "Cross-examine the claim with Snopes or BBC Verify."],
    ["Metadata inspectors", "Check EXIF camera data for missing or impossible hardware info."],
  ];
  return (
    <section className="lesson">
      <p className="kicker">06 / Practical tools</p>
      <h1>Four tools worth knowing</h1>
      <div className="tiles four">
        {tools.map(([title, body], index) => (
          <article key={title}>
            <span>0{index + 1}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProtocolLesson() {
  const steps = [
    ["Pause and assess", "Notice if the post triggers sudden outrage or extreme emotion."],
    ["Inspect the source", "Check account age, the handle, and previous post history."],
    ["Reverse search", "Run a reverse image search or a video keyframe search."],
    ["Cross-verify", "Confirm whether major news outlets cover the event."],
  ];
  return (
    <section className="lesson">
      <p className="kicker">07 / Workflow</p>
      <h1>The 4-step verification protocol</h1>
      <ol className="protocol">
        {steps.map(([title, body], index) => (
          <li key={title}>
            <span>Step 0{index + 1}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function AlgorithmLesson() {
  return (
    <section className="lesson">
      <p className="kicker">08 / Feed mechanics</p>
      <h1>How AI content gets amplified</h1>
      <div className="tiles">
        <article>
          <h2>Engagement optimization</h2>
          <p>Algorithms prioritize sensational media regardless of authenticity.</p>
        </article>
        <article>
          <h2>Automated bot networks</h2>
          <p>AI accounts share each other’s posts to simulate organic virality.</p>
        </article>
        <article>
          <h2>Comment section clues</h2>
          <p>Read the comments for debunking links and warnings that are already there.</p>
        </article>
      </div>
      <p className="rule-banner">The more shocking a post is, the more it deserves a pause.</p>
    </section>
  );
}

function Round({
  id,
  names,
  picks,
  open,
  onPick,
}: {
  id: RoundId;
  names: string[];
  picks: Partial<Record<number, "A" | "B">>;
  open: boolean;
  onPick: (team: number, choice: "A" | "B") => void;
}) {
  const round = ROUNDS.find((item) => item.id === id)!;
  return (
    <section className="lesson round">
      <p className="kicker">{round.kicker}</p>
      <h1>{round.title}</h1>
      <p className="lede">{round.hint}</p>
      {round.layout === "photos" ? (
        <div className="faceoff">
          <figure className={`shot ${open && round.correct === "A" ? "is-ai" : ""} ${open && round.correct !== "A" ? "is-clear" : ""}`}>
            <span className="shot-tag">
              Photo A
              {open && <em>{round.correct === "A" ? "AI" : "Clear"}</em>}
            </span>
            <RealPhoto />
          </figure>
          <figure className={`shot ${open && round.correct === "B" ? "is-ai" : ""} ${open && round.correct !== "B" ? "is-clear" : ""}`}>
            <span className="shot-tag">
              Photo B
              {open && <em>{round.correct === "B" ? "AI" : "Clear"}</em>}
            </span>
            <AiPhoto />
          </figure>
        </div>
      ) : (
        <div className={`posts ${round.layout}`}>
          {round.options.map((option) => (
            <article key={option.id} className={open ? (option.id === round.correct ? "is-ai" : "is-clear") : ""}>
              <header>
                {round.layout === "posts" ? `Post ${option.id}` : `Flag ${option.id}`}
                {open && <em>{option.id === round.correct ? "AI tell" : "Not the tell"}</em>}
              </header>
              <p>{option.text}</p>
            </article>
          ))}
        </div>
      )}
      {open && (
        <div className="reveal-banner">
          <strong>{round.revealTitle}</strong>
          <p>{round.revealBody}</p>
        </div>
      )}
      <div className="pads">
        {TEAM_INDEXES.map((team) => {
          const choice = picks[team];
          const hit = open && choice === round.correct;
          const miss = open && choice && choice !== round.correct;
          return (
            <article
              key={team}
              className={`pad ${hit ? "is-hit" : ""} ${miss ? "is-miss" : ""}`}
              style={{ ["--team" as string]: TEAM_COLORS[team] }}
            >
              <header>
                <h2>{names[team] || `Team ${team + 1}`}</h2>
                {hit && <span className="point-pop">+1</span>}
                {miss && <span className="miss-pop">Miss</span>}
              </header>
              <div className="pad-actions">
                {(["A", "B"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={choice === option ? "is-on" : ""}
                    disabled={open}
                    aria-pressed={choice === option}
                    onClick={() => onPick(team, option)}
                  >
                    It’s {option}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Finale({
  names,
  scores,
  notes,
  pledge,
  onNote,
  onPledge,
  onReset,
}: {
  names: string[];
  scores: number[];
  notes: string[];
  pledge: boolean[];
  onNote: (note: string) => void;
  onPledge: (index: number) => void;
  onReset: () => void;
}) {
  const [shown, setShown] = useState([0, 0, 0, 0]);
  const [phase, setPhase] = useState(0);
  const [draft, setDraft] = useState("");
  const takeawaysRef = useRef<HTMLElement>(null);
  const discussionRef = useRef<HTMLElement>(null);
  const referencesRef = useRef<HTMLElement>(null);

  const order =
    phase >= 1
      ? TEAM_INDEXES.slice().sort((a, b) => scores[b] - scores[a] || a - b)
      : [...TEAM_INDEXES];
  const top = Math.max(...scores);
  const leaders = TEAM_INDEXES.filter((team) => scores[team] === top);
  const reduce =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduce) {
      setShown(scores);
      setPhase(4);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1100);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(scores.map((score) => Math.round(score * eased)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const timers = [
      window.setTimeout(() => setPhase(1), 1300),
      window.setTimeout(() => setPhase(2), 2400),
      window.setTimeout(() => setPhase(3), 4200),
      window.setTimeout(() => setPhase(4), 6000),
    ];
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [reduce, scores]);

  useEffect(() => {
    const target = phase === 2 ? takeawaysRef.current : phase === 3 ? discussionRef.current : phase >= 4 ? referencesRef.current : null;
    target?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [phase, reduce]);

  const bits = useMemo(
    () =>
      Array.from({ length: 26 }, (_, index) => ({
        id: index,
        left: (index * 37) % 100,
        delay: (index % 7) * 0.07,
        color: TEAM_COLORS[index % 4],
        duration: 1.7 + (index % 4) * 0.25,
      })),
    [],
  );

  return (
    <div className="finale">
      <section className="score-hero">
        {phase >= 1 && top > 0 && <div className="confetti" aria-hidden="true">{bits.map((bit) => (
          <i key={bit.id} style={{ left: `${bit.left}%`, background: bit.color, animationDelay: `${bit.delay}s`, animationDuration: `${bit.duration}s` }} />
        ))}</div>}
        <p className="kicker">Scoreboard</p>
        <h1>Who spotted the most AI?</h1>
        <ol className="ranks">
          {order.map((team) => (
            <li key={team} style={{ ["--team" as string]: TEAM_COLORS[team] }}>
              <span className="place">{scores.filter((score) => score > scores[team]).length + 1}</span>
              <div>
                <strong>{names[team]}</strong>
                <div className="bar" aria-hidden="true">
                  <span style={{ width: `${(shown[team] / 3) * 100}%` }} />
                </div>
              </div>
              <em>{shown[team]}<small>/3</small></em>
            </li>
          ))}
        </ol>
        {phase >= 1 && (
          <p className="callout" aria-live="polite">
            {top === 0
              ? "No points on the board. The tells are still yours to use."
              : leaders.length === 1
                ? `${names[leaders[0]]} spotted the most AI.`
                : `Tie between ${leaders.map((team) => names[team]).join(" and ")}.`}
          </p>
        )}
      </section>

      {phase >= 2 && (
        <section className="closer" ref={takeawaysRef} id="takeaways">
          <h2 className="stamp">Takeaways</h2>
          <p className="lede">The 3-rule digital citizen pledge. Tap each rule to take it.</p>
          <div className="pledge">
            {[
              ["Pause before sharing", "Never let a strong emotion dictate the repost."],
              ["Verify first", "Run at least one reverse search or a cross-source check."],
              ["Report misinformation", "Flag deceptive AI so the next person gets a warning."],
            ].map(([title, body], index) => (
              <button key={title} type="button" className={pledge[index] ? "is-on" : ""} aria-pressed={pledge[index]} onClick={() => onPledge(index)}>
                <span>0{index + 1}</span>
                <strong>{title}</strong>
                <em>{body}</em>
                <b>{pledge[index] ? "Pledged" : "Tap to pledge"}</b>
              </button>
            ))}
          </div>
        </section>
      )}

      {phase >= 3 && (
        <section className="closer" ref={discussionRef} id="discussion">
          <h2 className="stamp">Questions and discussions</h2>
          <p className="lede">What was the last suspicious post on your feed? Practice the verification steps together.</p>
          <p className="tags">
            <span>#DigitalLiteracy</span>
            <span>#VerifyFirst</span>
            <span>#SpotTheAI</span>
          </p>
          <form
            className="note-form"
            onSubmit={(event) => {
              event.preventDefault();
              const next = draft.trim();
              if (!next) return;
              onNote(next);
              setDraft("");
            }}
          >
            <label htmlFor="class-note">Add a question or a post you want to check</label>
            <div>
              <input
                id="class-note"
                value={draft}
                maxLength={180}
                placeholder="Type it so the room can see it"
                onChange={(event) => setDraft(event.target.value)}
              />
              <button type="submit" className="btn primary">Add</button>
            </div>
          </form>
          <ul className="notes">
            {notes.length === 0 && <li className="empty">Nothing on the board yet.</li>}
            {notes.map((note, index) => (
              <li key={`${note}-${index}`}>{note}</li>
            ))}
          </ul>
        </section>
      )}

      {phase >= 4 && (
        <section className="closer" ref={referencesRef} id="references">
          <h2 className="stamp">References</h2>
          <p className="lede">Image sources listed in the deck.</p>
          <div className="sources">
            {REFERENCES.map((source) => (
              <article key={source.name}>
                <p>{source.name}</p>
                <a href={source.href} target="_blank" rel="noopener noreferrer">
                  {source.site}
                </a>
                <a className="source-url" href={source.image} target="_blank" rel="noopener noreferrer">
                  {source.image}
                </a>
              </article>
            ))}
          </div>
          <button type="button" className="btn ghost" onClick={onReset}>
            Play the workshop again
          </button>
        </section>
      )}
    </div>
  );
}
