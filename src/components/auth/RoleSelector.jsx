const RoleSelector = ({ selectedRole, onRoleChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Select Role
      </label>
      <div className="flex space-x-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="role"
            value="parent"
            checked={selectedRole === 'parent'}
            onChange={(e) => onRoleChange(e.target.value)}
            className="mr-2"
          />
          <span className="text-gray-700">Parent</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="role"
            value="student"
            checked={selectedRole === 'student'}
            onChange={(e) => onRoleChange(e.target.value)}
            className="mr-2"
          />
          <span className="text-gray-700">Student</span>
        </label>
      </div>
    </div>
  );
};

export default RoleSelector;