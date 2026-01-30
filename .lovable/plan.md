

# Implementation Plan: Enhanced Quiz UI, New Categories, Payment Flow & Admin Console

## Summary

This plan addresses five major feature requests:
1. Add images to question cards (matching reference screenshots)
2. Create 25 questions each for three new categories
3. Fix payment success redirect to unlock premium features
4. Verify/improve question submission modal
5. Build admin console for managing questions and OGs

---

## Part 1: Question Card Images (Match Reference Design)

### Changes Required

**1. Update Question Interface** (`src/data/rapQuestions.ts`)
```typescript
export interface Question {
  id: string;
  category: string;
  question: string;
  hint: string;
  options: string[];
  correctAnswer: string;
  resultTitle: string;
  resultCommentary: string;
  resultImageUrl?: string;
  questionImageUrl?: string;  // NEW: Image shown with question
}
```

**2. Update QuizCard Component** (`src/components/QuizCard.tsx`)
- Add image display area above question text
- Show `questionImageUrl` if present
- Match reference design: rounded corners, proper sizing

**3. Update Existing Questions**
- Add `questionImageUrl` to existing rap questions where applicable
- Use relevant GIFs/images for visual questions

---

## Part 2: New Category Questions (75 Total)

### These Streets (25 Questions)
Topics covering:
- NYC borough geography and landmarks
- Street slang and terminology
- Famous NYC corners and neighborhoods
- Hood legends and street code
- Project housing facts
- Graffiti and street art culture

### Hood Flicks (25 Questions)
Topics covering:
- Classic hood movies (Menace II Society, Boyz n the Hood, Paid in Full, etc.)
- Movie quotes and scenes
- Actor trivia
- Director knowledge
- Soundtrack questions
- Behind-the-scenes facts

### Corner Stores (25 Questions)
Topics covering:
- Bodega culture and products
- Chopped cheese and other hood foods
- Candy and snack trivia
- Corner store slang
- Lottery and scratch-off culture
- "Ock" terminology

### Implementation
- Create three new arrays: `streetsQuestions`, `flicksQuestions`, `storesQuestions`
- Update `getRandomQuestions` function to filter by category
- Add result images/GIFs for celebratory feedback

---

## Part 3: Payment Success Flow Fix

### Current Issue
After payment, user lands on success page but must manually click "LET'S GO" to return. The `has_paid` status is updated, but there's no automatic redirect to an "unlocked" state.

### Solution

**1. Auto-redirect after database update** (`src/pages/PaymentSuccess.tsx`)
```typescript
// After successful update:
setTimeout(() => {
  navigate('/');
}, 3000); // 3-second delay to show celebration
```

**2. Visual confirmation of premium status** (`src/components/HomeScreen.tsx`)
- Show "UNLIMITED" badge for paid users
- Remove any paywall indicators
- Display premium crown icon next to avatar

**3. Ensure profile refresh on return to home**
- Call `refetchProfile` after navigation
- Verify `has_paid: true` is reflected in UI

---

## Part 4: Question Submission Modal Verification

### Current State
The `SubmitQuestionModal` component exists and inserts into `question_submissions` table.

### Improvements Needed

**1. Better UX feedback**
- Show success animation after submission
- Display "Your question will be reviewed by OGs" message
- Add estimated approval timeframe

**2. Category selection**
- Add dropdown to select category (Rap, Streets, Flicks, Stores)
- Currently hardcoded to the played category

**3. Optional image upload**
- Allow users to suggest a result image URL
- Add field for `questionImageUrl` suggestion

---

## Part 5: Admin Console

### New Route: `/admin`

**Access Control**
- Create `user_roles` table with admin role
- Only users with admin role can access
- Use RLS and server-side validation

### Database Changes

```sql
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));
```

### Admin Dashboard Features

**1. Question Review Panel**
- List all pending `question_submissions` (status = 'pending')
- Display question, options, correct answer, hint
- Show submitter info and OG vote counts
- Approve/Reject buttons
- On approve: copy to `questions` table with `is_approved = true`

**2. OG Vote Summary**
- Show vote counts per submission
- Display which OGs voted and how
- Threshold indicator (e.g., "5 votes needed")

**3. Category Masters Management**
- List current category masters from `category_masters` table
- See approved question counts per user
- Manually assign/remove category master status
- Featured curator display toggle

**4. User Management**
- Search users by email or initials
- View user stats (games played, submissions, OG status)
- Grant/revoke OG status
- View payment status

### New Components

```text
src/pages/Admin.tsx           - Main admin dashboard
src/components/admin/
  ├── QuestionReviewCard.tsx  - Individual submission review
  ├── OGVoteSummary.tsx       - Vote visualization
  ├── CategoryMastersList.tsx - Masters management
  └── UserSearch.tsx          - User lookup/management
```

### Routing

```typescript
// src/App.tsx
<Route path="/admin" element={<AdminProtectedRoute><Admin /></AdminProtectedRoute>} />
```

---

## File Changes Summary

| File | Action |
|------|--------|
| `src/data/rapQuestions.ts` | Add questionImageUrl field, add 75 new questions |
| `src/components/QuizCard.tsx` | Add image display in question card |
| `src/pages/PaymentSuccess.tsx` | Add auto-redirect, improve timing |
| `src/components/HomeScreen.tsx` | Add premium badge for paid users |
| `src/components/SubmitQuestionModal.tsx` | Add category selector, image field |
| `src/pages/Admin.tsx` | NEW: Admin dashboard |
| `src/components/admin/*` | NEW: Admin sub-components |
| `src/App.tsx` | Add /admin route |
| `src/hooks/useAdmin.tsx` | NEW: Admin role check hook |
| Database migration | Create user_roles table, has_role function |

---

## Technical Considerations

### Security
- Admin access validated via database function, not client-side
- RLS policies prevent unauthorized access to admin data
- Cannot bypass role check with localStorage manipulation

### Performance
- Question images lazy-loaded
- Admin queries paginated (50 items per page)
- OG votes aggregated server-side

### Mobile Experience
- Admin console responsive but optimized for desktop
- Question images scale appropriately on mobile
- Touch-friendly approve/reject buttons

