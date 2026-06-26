import { useLeaderboard } from '../../hooks/leaderboard/useLeaderboard';
import { LeaderboardHeader } from '../../components/leaderboard/LeaderboardHeader';
import { LeaderboardFilterTabs } from '../../components/leaderboard/LeaderboardFilterTabs';
import { LeaderboardSummaryCard } from '../../components/leaderboard/LeaderboardSummaryCard';
import { LeaderboardTable } from '../../components/leaderboard/LeaderboardTable';
import { ChallengeModal } from '../../components/leaderboard/ChallengeModal';

export function LeaderboardPage() {
    const {
        tab,
        setTab,
        selectedCourseId,
        setSelectedCourseId,
        search,
        setSearch,
        showCourseDropdown,
        setShowCourseDropdown,
        enrollFilter,
        setEnrollFilter,
        challengeModalEntry,
        setChallengeModalEntry,
        courses,
        filteredCoursesDropdown,
        selectedCourse,
        searchedList,
        currentUserCourseEntry,
        currentUserOverallEntry,
        isLoading,
        handleSendChallenge,
    } = useLeaderboard();

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter','SF Pro Display',sans-serif" }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ border: '3px solid #E2E8F0', borderTop: '3px solid #E11D48', borderRadius: '50%', width: 36, height: 36, animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>Loading leaderboard...</p>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Inter','SF Pro Display',sans-serif", background: '#F8FAFC', minHeight: '100vh', padding: '24px 32px 48px' }}>
            
            {/* Header: Title and Search bar */}
            <LeaderboardHeader search={search} setSearch={setSearch} />

            {/* Filter Tabs & Course Selectors */}
            <LeaderboardFilterTabs
                tab={tab}
                setTab={setTab}
                selectedCourse={selectedCourse}
                selectedCourseId={selectedCourseId}
                setSelectedCourseId={setSelectedCourseId}
                showCourseDropdown={showCourseDropdown}
                setShowCourseDropdown={setShowCourseDropdown}
                enrollFilter={enrollFilter}
                setEnrollFilter={setEnrollFilter}
                courses={courses}
                filteredCoursesDropdown={filteredCoursesDropdown}
                currentUserCourseEntry={currentUserCourseEntry}
                currentUserOverallEntry={currentUserOverallEntry}
            />

            {/* Current user summary stats highlight card */}
            <LeaderboardSummaryCard
                tab={tab}
                currentUserCourseEntry={currentUserCourseEntry}
                currentUserOverallEntry={currentUserOverallEntry}
                selectedCourseTitle={selectedCourse.title}
            />

            {/* Leaderboard Table Grid */}
            <LeaderboardTable
                tab={tab}
                searchedList={searchedList}
                totalCourses={courses.length}
                setChallengeModalEntry={setChallengeModalEntry}
            />

            {/* Legend guide */}
            <div style={{ marginTop: 12, display: 'flex', gap: 20, fontSize: 12, color: '#9CA3AF' }}>
                <span><strong style={{ color: '#374151' }}>Score</strong> — avg quiz & lesson score</span>
                <span><strong style={{ color: '#374151' }}>Time</strong> — completion time (min)</span>
                <span><strong style={{ color: '#374151' }}>PvP</strong> — challenge wins · +5 pts each</span>
                {tab === 'overall' && (
                    <span><strong style={{ color: '#374151' }}>Courses</strong> — completed out of {courses.length}</span>
                )}
            </div>

            {/* PVP Challenge Modal */}
            <ChallengeModal
                challengeModalEntry={challengeModalEntry}
                setChallengeModalEntry={setChallengeModalEntry}
                tab={tab}
                selectedCourseTitle={selectedCourse.title}
                currentUserCourseEntry={currentUserCourseEntry}
                currentUserOverallEntry={currentUserOverallEntry}
                handleSendChallenge={handleSendChallenge}
            />
        </div>
    );
}
export default LeaderboardPage;
