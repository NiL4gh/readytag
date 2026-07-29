# Monetization Plan

> Status: Free-only during early access. ReadyTag Pro not yet live.

---

## Current State

ReadyTag is 100% free. No paywall, no usage cap beyond your own AI provider limits.

BYOK model — users supply their own API key. ReadyTag charges nothing for AI usage; costs go directly to the chosen provider. Groq is free.

Active monetization bridge: Patreon — `patreon.com/MetaRefresh`

---

## Planned: ReadyTag Pro (Token System)

> Do not implement in the codebase yet. Planning reference only.

### Token model

- 1 token = 1 asset processed (single-asset generation or 1 CSV batch row)
- Tokens consumed regardless of AI provider
- Balance tracked: Cloudflare D1 (persistent) + KV (fast reads)
- Payment processor: LemonSqueezy

### Free tier

| Feature | Free |
|---------|------|
| Monthly tokens | 50/month (once Pro launches) |
| Onboarding tokens | 50 one-time on install |
| Single-asset generation | ✅ |
| Image Mode | ✅ |
| All 10 AI providers | ✅ |
| 4 platforms | ✅ |
| CSV Batch Export (>5 files) | ❌ Pro only |
| Customization presets | ❌ Pro only |

Open question: do early-access users (pre-Pro launch) get legacy free status or start fresh at 50 tokens?

### One-time token packs

| Pack | Price | Per token |
|------|-------|-----------|
| 500 tokens | $5.99 | ~$0.012 |
| 2,000 tokens | $11.99 | ~$0.006 |
| 6,000 tokens | $22.99 | ~$0.004 |
| 15,000 tokens | $44.99 | ~$0.003 |

Tokens never expire. Best for occasional users or one-off portfolio projects.

### Pro subscription

| Tier | Price | Monthly tokens |
|------|-------|----------------|
| Pro Monthly | $7.99/mo | 2,000 |
| Pro Annual | $59.99/yr (~$5/mo) | 2,000 |

Pro includes: unlimited CSV batch, all customization presets, priority Worker routing.

### Technical implementation (when ready)

1. Worker `/checkout` → LemonSqueezy checkout link
2. Worker `/balance` → reads token count from D1
3. Worker: decrement D1 token count on each successful `/generate`
4. Extension: token balance in panel header
5. Extension: gate CSV batch (>5 files) and presets behind Pro check
6. LemonSqueezy webhook: on payment success, credit tokens via D1

---

## Competitive Positioning

| Dimension | ReadyTag | Typical competitor |
|-----------|----------|--------------------|
| Pricing model | BYOK + optional Pro | Subscription-only |
| Multi-platform | 4 platforms | Usually single-platform |
| Data retention | Zero (no server-side storage) | Often logs requests |
| Free tier | 50 tokens/month | Usually 7-day trial |
