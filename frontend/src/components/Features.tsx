import React from 'react';
import { FileText, Zap, Shield, Globe } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: 'Lightning Fast',
      description: 'Convert multiple files simultaneously with our powerful backend',
    },
    {
      icon: <Shield className="w-8 h-8 text-green-500" />,
      title: 'Secure & Private',
      description: 'Your files are processed securely and deleted after conversion',
    },
    {
      icon: <FileText className="w-8 h-8 text-blue-500" />,
      title: 'Batch Processing',
      description: 'Upload multiple DOCX files and get a single ZIP with all PDFs',
    },
    {
      icon: <Globe className="w-8 h-8 text-purple-500" />,
      title: 'No Installation',
      description: 'Works entirely in your browser - no software installation needed',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
      {features.map((feature, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex justify-center mb-4">{feature.icon}</div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white text-center mb-2">
            {feature.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center">{feature.description}</p>
        </div>
      ))}
    </div>
  );
};

export default Features;
