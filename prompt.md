# 🏙️ CivFit

> A gamified self-improvement platform where users build real-life habits and grow a virtual civilization based on their consistency and progress.

---

# 📖 Overview

CivFit transforms habit building into an engaging city-building experience.

Users improve their lives by completing real-world habits. Every completed habit contributes to the growth of a virtual civilization, allowing users to unlock buildings, increase population, improve their economy, and evolve their city over time.

The city serves as a visual representation of the user's personal growth journey.

---

# 🎯 Goals

The platform aims to:

- Encourage long-term habit formation.
- Increase user engagement through gamification.
- Visualize self-improvement progress.
- Reward consistency and discipline.
- Create a fun and motivating productivity experience.

---

# 👥 Target Users

### Primary Users

- University Students
- Young Professionals
- Productivity Enthusiasts
- Self-Improvement Communities

### Secondary Users

- Habit Tracking Users
- Gamification Enthusiasts
- Personal Development Learners

---

# 🧩 Core Features

## 1. Habit Management

Users can:

- Create habits
- Edit habits
- Delete habits
- Complete habits
- Track streaks
- View completion history

### Habit Attributes

```ts
{
  id: string
  title: string
  description: string
  category: string
  difficulty: "easy" | "medium" | "hard"
  frequency: "daily" | "weekly"
  rewardPoints: number
  streak: number
}
```

---

## 2. City Simulation System

The city represents user progress.

### City Metrics

- Population
- Happiness
- Productivity
- Economy
- Technology
- Sustainability

### Growth Logic

Completing habits:

✅ Increase happiness

✅ Increase productivity

✅ Generate resources

✅ Improve economy

Missing habits:

❌ Reduce growth rate

❌ Reduce happiness

❌ Slow city development

---

## 3. Economy System

Users earn:

- Coins
- Resources
- Development Points

### Resource Usage

Resources can be used for:

- Building construction
- Building upgrades
- Unlocking city districts
- Research progression

---

## 4. Building System

### Residential

- House
- Apartment
- Smart Housing

### Commercial

- Shop
- Market
- Mall

### Education

- School
- University
- Research Center

### Health

- Clinic
- Hospital
- Wellness Center

### Technology

- Startup Hub
- Innovation Center
- AI Laboratory

### Building Properties

```ts
{
  id: string
  name: string
  category: string
  level: number
  upgradeCost: number
  effects: {
    happiness: number
    economy: number
    productivity: number
    technology: number
  }
}
```

---

## 5. Progression System

Every day the system should:

1. Process completed habits.
2. Calculate rewards.
3. Update city metrics.
4. Update economy values.
5. Evaluate evolution requirements.
6. Generate daily reports.

### Requirements

- Scalable
- Extensible
- Centralized formulas
- Easy balancing

---

## 6. Evolution System

Cities evolve through multiple stages.

```text
Village
   ↓
Town
   ↓
City
   ↓
Smart City
   ↓
Future Civilization
```

Each stage unlocks:

- New buildings
- New districts
- New technologies
- New visual themes

---

## 7. Leaderboards

### Global Rankings

Users compete based on:

- Habit Score
- Longest Streak
- City Level
- Economy Growth
- Civilization Rank

### Supported Modes

- Global
- Friends
- Community Groups

---

# 📊 Dashboard

The main dashboard should display:

### Habit Section

- Today's Habits
- Completion Progress
- Current Streak

### City Overview

- Population
- Economy
- Happiness
- Technology

### Quick Actions

- Complete Habit
- Build Structure
- Upgrade Building

### Analytics

- Weekly Progress
- Monthly Progress
- Habit Trends
- Growth Metrics

---

# 🎮 Gamification Features

### Rewards

- XP
- Coins
- Resources

### Achievements

Examples:

- First Habit Completed
- 7-Day Streak
- 30-Day Streak
- First Building Constructed
- First Evolution Reached

### Daily Challenges

- Complete 3 Habits
- Earn 100 Coins
- Upgrade 1 Building

---

# 🎨 Design Requirements

## Design Style

Modern SaaS + Gamification

### Inspirations

- Duolingo
- Habitica
- Notion
- Linear

### Design Principles

- Clean
- Minimal
- Engaging
- Responsive
- Accessible

---

# 🌙 Theme Support

Required:

- Light Mode
- Dark Mode

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- Vite
- React Router
- Zustand
- TanStack Query
- Tailwind CSS
- Shadcn UI

## Backend

Recommended:

- Supabase

or

- Node.js + PostgreSQL

---

# 📁 Project Structure

```text
src/
├── app/
├── pages/
├── features/
│   ├── habits/
│   ├── city/
│   ├── economy/
│   ├── buildings/
│   ├── evolution/
│   └── leaderboard/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── charts/
│   └── shared/
│
├── services/
├── hooks/
├── store/
├── lib/
├── constants/
├── types/
└── assets/
```

---

# ⚙️ Architecture Rules

## Required

✅ Feature-based architecture

✅ Reusable components

✅ Strong TypeScript typing

✅ Separation of concerns

✅ Scalable folder structure

✅ Production-ready code

---

## Forbidden

❌ React Native

❌ Expo

❌ Monolithic components

❌ Business logic inside UI components

❌ Hardcoded mock data in production code

❌ Duplicate state management

---

# 🚀 Deliverables

Before generating code:

1. Explain system architecture.
2. Explain database schema.
3. Explain state management strategy.
4. Explain API design.
5. Explain component hierarchy.

Then generate implementation incrementally.

Do not generate placeholder architecture.
Build as if this project will be deployed to production.