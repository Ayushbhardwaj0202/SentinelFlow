import React from 'react';

const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-secondary mt-2">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex gap-4">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
