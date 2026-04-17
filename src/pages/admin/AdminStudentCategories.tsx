import AdminLayout from '@/components/AdminLayout';
import StudentCategoryManager from '@/components/admin/StudentCategoryManager';

const AdminStudentCategories = () => {
  return (
    <AdminLayout>
      <div className="card-elevated p-5">
        <StudentCategoryManager />
      </div>
    </AdminLayout>
  );
};

export default AdminStudentCategories;
