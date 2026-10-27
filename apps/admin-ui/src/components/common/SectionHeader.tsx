import React from "react";

export const SectionHeader = ({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
      {title}
    </h2>
    {action && <div>{action}</div>}
  </div>
);
