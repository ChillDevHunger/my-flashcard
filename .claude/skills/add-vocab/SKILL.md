---
name: add-vocab
description: Use when the user gives a list of words/phrases to add to the flashcard vocab store (vocab-app.html DECKS). Dedupes against existing words, writes AmE IPA and original examples, adds rows or a new deck, and verifies.
---

# Add vocab to the flashcard store

Store = `DECKS` array in `vocab-app.html`. Each deck: `{id:'x', name:'Tên tiếng Việt', raw:\`...\`}`, one card per line:

`word|pos|/IPA/|nghĩa tiếng Việt|English example with *word* wrapped in stars|dịch ví dụ`

## Rules
- From the user's list take only **word + meaning**. Ignore their examples/IPA; write **American English IPA** (Cambridge AmE style, e.g. `/ˈmer.ɪdʒ/`, `ɚ`, `oʊ`, `t̬`) and **write a fresh natural example** (+ Vietnamese translation). The example wraps the word (or its inflected form) in `*...*`.
- Keep the word name short as given. Put structure in the pos column, like rel1's `n · get acquainted (v-phr) = làm quen` (e.g. `v-phr · apply for + N`).
- Meaning: short, Vietnamese, as the user gave it.
- No extra `|`, no backtick, no `${` in any line (breaks the template literal). Exactly 6 fields.
- Do not change app logic/UI or edit existing words.

## Procedure
1. `node .claude/skills/add-vocab/vocab-check.js list` — existing words per deck + total (note the count).
2. `node .claude/skills/add-vocab/vocab-check.js dup "w1" "w2" ...` — prints `NEW` / `DUP(deck)` / `DUP(input)` (case/whitespace-insensitive on column 1; a leading "be " is ignored). Skip every DUP; also skip near-identical items by judgment (e.g. "in charge of" vs "in charge of sth"). Merge repeats within the list.
3. Pick the deck: append to an existing deck if the theme fits; otherwise add a new deck before the closing `\`}\n];` with a unique `id` and a Vietnamese `name`.
4. Append rows (tool edit, UTF-8, keep style of neighbouring lines).
5. `node .claude/skills/add-vocab/vocab-check.js verify <old_count + added>` — checks every `<script>` parses, prints the card count, exits 1 on mismatch. `WARN` lines flag malformed/duplicate rows; some pre-existing rows warn (loose IPA, old dups), ignore those but fix any WARN for rows you added.
6. Report to the user: words added, and words skipped as duplicates (with the deck they already live in).
