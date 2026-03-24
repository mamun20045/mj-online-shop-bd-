import React from 'react';

const ReturnPolicy: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16">
    <h1 className="text-4xl font-bold text-gray-900 mb-8">Return Policy</h1>
    <div className="prose prose-lg text-gray-600 space-y-6">
      <p>We want you to be completely satisfied with your purchase. If you are not satisfied, you can return the product within 7 days of delivery.</p>
      <h2 className="text-2xl font-bold text-gray-900">Conditions for Return</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>The product must be unused and in the same condition that you received it.</li>
        <li>The product must be in the original packaging.</li>
        <li>The product must have the original tags and labels.</li>
      </ul>
      <h2 className="text-2xl font-bold text-gray-900">Refunds</h2>
      <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.</p>
    </div>
  </div>
);

export default ReturnPolicy;
