import AdminLayout from '@/components/AdminLayout';
import FeeCategoryManager from '@/components/admin/FeeCategoryManager';

const AdminFeeCategories = () => {
  return (
    <AdminLayout>
      <div className="card-elevated p-5">
        <FeeCategoryManager />
      </div>
    </AdminLayout>
  );
};

export default AdminFeeCategories;
