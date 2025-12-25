import React from 'react';
import { Step } from '../testCase.types';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
};

type Template = { id: string; name: string; description: string; steps: Step[] };

const TENANTS = ['Epos', 'Claims', 'Quotes', 'Renewals', 'All'];

const QUOTE_WORKFLOW_TEMPLATE: Step[] = [
  { id: 1, action: 'Go to login page', expectedResult: 'Login page loads' },
  { id: 2, action: 'Enter valid username & password', expectedResult: 'Credentials accepted' },
  { id: 3, action: 'Click Login', expectedResult: 'User is redirected to Home Page /home' },
  { id: 4, action: 'Confirm the browser loads home page', expectedResult: 'Home Dashboard loads fully, user menu & navigation visible' },
  { id: 5, action: 'Search for Quote 3864-0759-1214', expectedResult: 'Quote Found' },
  { id: 6, action: 'Click on Quote link', expectedResult: 'Quote 3864-0759-1214 is open' },
  { id: 7, action: 'Click Policies tab', expectedResult: 'Policies tab loads successfully' },
  { id: 8, action: 'Click + Add Policy', expectedResult: 'Add Policy modal appears' },
  { id: 9, action: 'Select Carrier, Enter Policy Number: newcomm12, Set Effective/Expiration dates, Set Premium = 100', expectedResult: 'All fields filled correctly' },
  { id: 10, action: 'Click Confirm', expectedResult: 'Policy created, redirects to policy case page' },
  { id: 11, action: 'Click the quote link inside the policy', expectedResult: 'Quote timeline opens' },
  { id: 12, action: 'Click Policies tab', expectedResult: 'One policy appears in the list' },
  { id: 13, action: 'Click + Add Policy', expectedResult: 'Add Policy modal appears' },
  { id: 14, action: 'Enter renewal policy details - Policy Number: newcomm11, Premium = 600', expectedResult: 'Renewal policy details entered' },
  { id: 15, action: 'Click Confirm', expectedResult: 'Renewal policy added' },
  { id: 16, action: 'Open the Policies tab', expectedResult: 'Two policies appear in the list' },
  { id: 17, action: 'Open Renewal details', expectedResult: 'Renewal policy shows parent link to original policy' },
  { id: 18, action: 'Navigate to /renewals-policies', expectedResult: 'List displays newcomm11 renewal' },
  { id: 19, action: 'Click the checkbox for the newcomm11 row', expectedResult: 'Row selected successfully' },
  { id: 20, action: 'Click Requote', expectedResult: 'Batch API runs, renewal status updates to Info Required' },
];

const templates: Template[] = [
  {
    id: 'quote-workflow-complete',
    name: '📋 Complete Quote & Policy Flow (20 Steps)',
    description: 'Full end-to-end flow from login through quote, policy creation, and renewal management',
    steps: QUOTE_WORKFLOW_TEMPLATE,
  },
  {
    id: 'tc1.1',
    name: '🔐 Login With Valid Credentials',
    description: 'Login as user with valid credentials',
    steps: [
      { id: 1, action: 'Go to login page', expectedResult: 'Login page loads' },
      { id: 2, action: 'Enter valid username & password', expectedResult: 'Credentials accepted' },
      { id: 3, action: 'Click Login', expectedResult: 'User is redirected to Home Page: /home' },
    ],
  },
  {
    id: 'tc2.1',
    name: '🔍 Quote Search & View',
    description: 'Search for and open a quote',
    steps: [
      { id: 1, action: 'Search for Quote 3864-0759-1214', expectedResult: 'Quote Found' },
      { id: 2, action: 'Click on Quote link', expectedResult: 'Quote details are open' },
      { id: 3, action: 'Verify quote information loads', expectedResult: 'All quote details visible' },
    ],
  },
  {
    id: 'tc3.1',
    name: '➕ Create New Policy',
    description: 'Add a policy to a quote',
    steps: [
      { id: 1, action: 'Click Policies tab', expectedResult: 'Policies tab loads successfully' },
      { id: 2, action: 'Click + Add Policy', expectedResult: 'Add Policy modal appears' },
      { id: 3, action: 'Select Carrier, enter Policy Number: newcomm12, set Premium = 100', expectedResult: 'All fields filled correctly' },
      { id: 4, action: 'Click Confirm', expectedResult: 'Policy created successfully' },
    ],
  },
  {
    id: 'tc4.1',
    name: '🔄 Renewal Policy Management',
    description: 'Create and manage renewal policies',
    steps: [
      { id: 1, action: 'Click Policies tab on original policy', expectedResult: 'Policies list visible' },
      { id: 2, action: 'Click + Add Policy for renewal', expectedResult: 'Add Policy modal appears' },
      { id: 3, action: 'Enter renewal policy details with Premium = 600', expectedResult: 'Renewal policy details saved' },
      { id: 4, action: 'Verify two policies appear in list', expectedResult: 'Both policies visible' },
    ],
  },
  {
    id: 'tc5.1',
    name: '💼 Claims Processing Workflow',
    description: 'Full claims submission and review process',
    steps: [
      { id: 1, action: 'Navigate to Claims section', expectedResult: 'Claims dashboard loads' },
      { id: 2, action: 'Click New Claim button', expectedResult: 'Claim creation form appears' },
      { id: 3, action: 'Fill in claim details (type, amount, date)', expectedResult: 'All fields populated' },
      { id: 4, action: 'Upload supporting documentation', expectedResult: 'Files uploaded successfully' },
      { id: 5, action: 'Submit claim for review', expectedResult: 'Claim status changes to Submitted' },
    ],
  },
  {
    id: 'tc6.1',
    name: '📱 Mobile App Navigation',
    description: 'Test core mobile navigation flows',
    steps: [
      { id: 1, action: 'Open mobile app on iOS/Android', expectedResult: 'App launches successfully' },
      { id: 2, action: 'Tap Dashboard tab', expectedResult: 'Dashboard displays with summary' },
      { id: 3, action: 'Tap Policies tab', expectedResult: 'Active policies list shows' },
      { id: 4, action: 'Tap a policy from the list', expectedResult: 'Policy details page opens' },
    ],
  },
  {
    id: 'tc7.1',
    name: '🔔 Notification & Alert Management',
    description: 'Test notification settings and delivery',
    steps: [
      { id: 1, action: 'Go to Settings > Notifications', expectedResult: 'Notifications page loads' },
      { id: 2, action: 'Enable Email Notifications', expectedResult: 'Toggle switched on' },
      { id: 3, action: 'Trigger a test notification', expectedResult: 'Email received in inbox' },
      { id: 4, action: 'Disable Push Notifications', expectedResult: 'Toggle switched off' },
    ],
  },
];

const TemplatesModal: React.FC<Props> = ({ open, onClose, onSelect }) => {
  const [selectedTenant, setSelectedTenant] = React.useState('All');
  
  if (!open) return null;

  const filteredTemplates = selectedTenant === 'All' 
    ? templates 
    : templates.filter(t => t.id.includes(selectedTenant.toLowerCase()));

  const handleSelect = (t: Template) => {
    onSelect({
      ...t,
      steps: t.steps.map((s) => ({ ...s, id: Date.now() + Math.random() })),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-11/12 max-w-4xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-6 border-b border-gray-200 flex justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">📋 Test Case Templates</h2>
            <p className="text-blue-100 text-sm">Choose a template to get started quickly</p>
          </div>
          <div className="flex items-center gap-3 min-w-fit">
            <label className="text-white text-sm font-semibold whitespace-nowrap">Tenant:</label>
            <select 
              value={selectedTenant} 
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/40 cursor-pointer font-semibold"
            >
              {TENANTS.map(t => (
                <option key={t} value={t} className="text-gray-800">{t}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200 ml-auto"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Templates Grid with Scroll */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map(t => (
            <div 
              key={t.id} 
              className="border border-gray-200 rounded-lg p-5 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg hover:border-cyan-400 transition-all duration-300"
            >
              <div className="font-bold text-lg text-gray-900 mb-2">{t.name}</div>
              <p className="text-sm text-gray-600 mb-3">{t.description}</p>
              <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                <span>📌</span>
                <span>{t.steps.length} steps included</span>
              </div>
              <button 
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={() => handleSelect(t)}
              >
                ➕ Create From Template
              </button>
            </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p className="text-lg font-semibold">No templates found for {selectedTenant}</p>
              <p className="text-sm">Try selecting a different tenant</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatesModal;
