import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useMyCourse } from '../../hooks/course/useMyCourse';
import Header from '../../components/course/my-courses/Header';
import StatusGuide from '../../components/course/my-courses/StatusGuide';
import Filters from '../../components/course/my-courses/Filters';
import CourseList from '../../components/course/my-courses/CourseList';
import DeleteModal from '../../components/course/my-courses/DeleteModal';

export function MyCoursesPage() {
    const navigate = useNavigate();
    const {
        loading,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        deleteId,
        setDeleteId,
        filtered,
        counts,
        canDelete,
        fetchCourses,
        handleDeleteCourse,
        handleSubmitForReview
    } = useMyCourse();

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleCreateCourse = () => {
        navigate('/provider/courses/create');
    };

    const handleViewCourse = (id: number) => {
        // Navigates to the provider's course details page
        navigate(`/provider/courses/detail?id=${id}`);
    };

    const handleEditCourse = (id: number) => {
        // Navigates to the course builder / edit page
        navigate(`/provider/courses/create?id=${id}`);
    };

    const handleSubmitCourse = async (id: number) => {
        try {
            await handleSubmitForReview(id);
        } catch (error) {
            toast.error('Failed to submit course for review. Please try again.');
        }
    };

    const handleConfirmDelete = async (id: number) => {
        try {
            await handleDeleteCourse(id);
            toast.success('Course deleted successfully!');
            setDeleteId(null);
        } catch (error) {
            toast.error('Failed to delete course. Please try again.');
        }
    };

    return (
        <div style={{ fontFamily: "'Inter','SF Pro Display',sans-serif", background: '#F8FAFC', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 32px 48px' }}>
                {/* Header */}
                <Header onCreateCourse={handleCreateCourse} />

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
                        <div className="w-8 h-8 border-4 border-[#E11D48] border-t-transparent rounded-full animate-spin mb-3" />
                        <p style={{ fontSize: 14, color: '#6B7280' }}>Loading courses...</p>
                    </div>
                ) : (
                    <>
                        {/* Status guide */}
                        <StatusGuide counts={counts} />

                        {/* Filters */}
                        <Filters 
                            search={search} 
                            setSearch={setSearch} 
                            statusFilter={statusFilter} 
                            setStatusFilter={setStatusFilter} 
                            counts={counts} 
                        />

                        {/* Course list */}
                        <CourseList 
                            filtered={filtered} 
                            canDelete={canDelete} 
                            setDeleteId={setDeleteId} 
                            onView={handleViewCourse} 
                            onEdit={handleEditCourse} 
                            onSubmit={handleSubmitCourse}
                            onCreateCourse={handleCreateCourse}
                        />
                    </>
                )}
            </div>

            {/* Delete modal */}
            <DeleteModal 
                deleteId={deleteId} 
                setDeleteId={setDeleteId} 
                onConfirmDelete={handleConfirmDelete} 
            />
        </div>
    );
}
