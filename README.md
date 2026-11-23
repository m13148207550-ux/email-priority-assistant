# Explainable Email Assistant

README prose word count: 294

## Project status

A student can inspect a suggested priority, see the matching email text, clarify attendance, override the label and undo the last change. A deterministic rule simulates the assistant. The bundled messages are fictional. All application state expires on reload. Inbox ordering and preference learning are planned.

## Run and inspect

Open `index.html` in a modern browser. HTML supplies the controls, CSS styles them and JavaScript handles classification and session state. No installation, account, network connection or key is needed. Node.js is optional for replaying the checks.

```sh
node test_offline.cjs
```

Load the standard example and request a suggestion. Next load the problem example. Try Baseline, then Revised, with attendance Unknown. Select No and request a fresh suggestion. Run the standard example again, change its priority to Normal and undo.

## Development record

- Import from earlier labs (`d8350e9`). A deadline alone had promoted an optional workshop. The revised rule asks about attendance. A reported fetch failure led to local browser execution. [Saved cases](results.json) preserve the earlier labels.
- A2 interface revision (`e1760f2`). A manual edit appeared under “Suggested”. The revised label identifies the user’s decision alongside the original suggestion. Editing an input now clears the old result. [Replay results](offline_results.json) cover clarification, correction, undo, stale results and parity with four saved classifications.
- The [development archive](development.bundle) preserves all three local commits and the a2-v1 tag. Clone it with `git clone development.bundle history` to inspect the changes above. The public snapshot keeps the replay and its JSON files together at the repository root. The report contains the architecture and illustrated scenarios. The replay uses synthetic inputs and a minimal DOM.

## AI assistance

ChatGPT and Codex assisted with prototype code, report drafting and figures. The manual priority label was revised, and the interaction checks compared the displayed results with saved examples.

