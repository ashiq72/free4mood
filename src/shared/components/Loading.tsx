export const Loading = ({ label = "Loading..." }: { label?: string }) => {
  return (
    <div className="flex items-center justify-center py-6 text-sm text-gray-500">
      {label}
    </div>
  );
};
