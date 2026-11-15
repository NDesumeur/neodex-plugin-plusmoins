# Higher or Lower

A pixel art trivia game: the left card shows its number, and you guess whether the right one is higher or lower.

*Version française : [README.md](README.md)*

## Controls

- **↑** or **click HIGHER**: the right card is higher.
- **↓** or **click LOWER**: it is lower.
- **Space**: play again after a mistake.

## How it works

- A right answer moves the right card to the left and a new one comes in. A mistake ends the streak.
- **Fourteen categories** of real rounded numbers: population and area of countries, height of mountains, length of rivers, weight, speed and lifespan of animals, height of monuments, size of celestial bodies, year of inventions, population of French cities, calories in foods, birth year of famous people and release year of video games.
- **All mixed** changes category every 5 right answers.
- Two cards that are too close never come up together: there is always a real difference.

## The cards

Each card has its small pixel-art picture: the country's **flag**, the **mountain**'s outline (with its crater for volcanoes), the winding **river**, the **animal**, the **monument** or the **celestial body**. The other categories keep their icon. The picture never gives away the answer.

When the game is lost, the result shows in a strip under the cards: both cards and their values stay readable.

## Full screen

The **Full screen** button fills the whole screen with the cards (Escape to leave). Otherwise the game takes all the height the window leaves.

## Stats

The Bests panel keeps your **best streak** in each category, the number of **games** and **right answers**.

## Data and sync

Your bests and totals are saved by NeoDex, backed up and synced between your PCs if sync is on.

## Install

In NeoDex: **NeoStore → Discover → Higher or Lower → Install**.

Building a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
