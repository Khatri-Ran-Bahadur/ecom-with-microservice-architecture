import React from "react";

export const ChartContainer = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl bg-white/5 dark:bg-slate-900/5 backdrop-blur-md p-6 shadow-sm">
    <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
      {title}
    </h2>
    {children}
  </div>
);
