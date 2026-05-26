<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the PostHog Games Next.js App Router project. The project already had `posthog-js` installed, `instrumentation-client.ts` initializing PostHog with EU region settings, reverse proxy rewrites in `next.config.ts`, and event tracking in all three game pages. The wizard added two new events to complete the analytics contract: `game_selected` on the home page (converted from a server component to a client component) and `quiz_started` on the Data Quiz page. Environment variables were confirmed and updated with the correct PostHog EU host and project token.

| Event | Description | File |
|---|---|---|
| `game_selected` | User clicks a game card on the home page; includes `game_name` property (`hedgehog_clicker`, `data_quiz`, `dino_run`) | `src/app/page.tsx` |
| `quiz_started` | Data Quiz page loads — top of quiz funnel; includes `total_questions` | `src/app/data-quiz/page.tsx` |
| `hedgehog_game_started` | Player starts or replays Hedgehog Clicker | `src/app/hedgehog-clicker/page.tsx` |
| `hedgehog_game_completed` | 10-second timer runs out; includes `clicks` and `clicks_per_second` | `src/app/hedgehog-clicker/page.tsx` |
| `quiz_answer_submitted` | Player selects a quiz answer; includes `question_index`, `is_correct`, `selected_option` | `src/app/data-quiz/page.tsx` |
| `quiz_completed` | Player finishes all quiz questions; includes `score` and `total` | `src/app/data-quiz/page.tsx` |
| `dino_game_started` | Player starts or retries Dino Run | `src/app/dino-run/page.tsx` |
| `dino_game_over` | Dino collides with an obstacle; includes `score` | `src/app/dino-run/page.tsx` |

## Next steps

Create an "Analytics basics" dashboard in your PostHog project with these recommended insights:

1. **Game popularity** — Trend of `game_selected` broken down by `game_name` — see which games attract the most players
2. **Quiz funnel** — Funnel from `quiz_started` → `quiz_answer_submitted` → `quiz_completed` — measure drop-off through the quiz
3. **Hedgehog Clicker performance** — Average `clicks_per_second` from `hedgehog_game_completed` — track player skill distribution
4. **Dino Run score distribution** — Average `score` from `dino_game_over` — understand how far players get
5. **Quiz correct answer rate** — Percentage of `quiz_answer_submitted` where `is_correct = true` — see how knowledgeable players are

Visit your PostHog project to build these insights: https://eu.posthog.com/project/186762

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
