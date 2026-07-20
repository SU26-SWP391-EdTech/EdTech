export interface ClientStreakData {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string; // YYYY-MM-DD
    streakLife: number;
}

const DEFAULT_STREAK: ClientStreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    streakLife: 1,
};

export function getStreak(userId: number): ClientStreakData {
    const key = `learner_streak_user_${userId}`;
    const dataStr = localStorage.getItem(key);
    if (!dataStr) {
        return { ...DEFAULT_STREAK };
    }
    try {
        return JSON.parse(dataStr);
    } catch {
        return { ...DEFAULT_STREAK };
    }
}

export function updateStreak(userId: number): ClientStreakData {
    const key = `learner_streak_user_${userId}`;
    const current = getStreak(userId);
    
    const now = new Date();
    // Get YYYY-MM-DD in local time
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    if (current.lastActiveDate === todayStr) {
        return current;
    }
    
    if (!current.lastActiveDate) {
        current.currentStreak = 1;
        current.longestStreak = 1;
        current.lastActiveDate = todayStr;
        current.streakLife = 1;
    } else {
        const [ly, lm, ld] = current.lastActiveDate.split('-').map(Number);
        const lastActiveMidnight = new Date(ly, lm - 1, ld);
        const todayMidnight = new Date(year, now.getMonth(), now.getDate());
        
        const diffTime = Math.abs(todayMidnight.getTime() - lastActiveMidnight.getTime());
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            current.currentStreak += 1;
            if (current.currentStreak > current.longestStreak) {
                current.longestStreak = current.currentStreak;
            }
            current.lastActiveDate = todayStr;
        } else if (diffDays > 1) {
            if (current.streakLife > 0) {
                current.streakLife -= 1;
                current.lastActiveDate = todayStr;
            } else {
                current.currentStreak = 1;
                current.lastActiveDate = todayStr;
            }
        }
    }
    
    localStorage.setItem(key, JSON.stringify(current));
    return current;
}
