import AdminLayout from '@/components/AdminLayout';
import FeeTypeManager from '@/components/admin/FeeTypeManager';

const AdminFeeTypes = () => {
  return (
    <AdminLayout>
      <div className="card-elevated p-5">
        <FeeTypeManager />
      </div>
    </AdminLayout>
  );
};

export default AdminFeeTypes;
