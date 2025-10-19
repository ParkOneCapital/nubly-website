'use client';

export default function TestPage() {
  const sendTestEvent = () => {
    console.log('Button clicked!');
    console.log('gtag available?', typeof window.gtag);

    if (typeof window.gtag !== 'undefined') {
      console.log('Sending event to GA...');
      window.gtag('event', 'test_button_click', {
        event_category: 'engagement',
        event_label: 'Test Button',
      });
      console.log('Event sent!');
      alert('Event sent! Check Network tab for google-analytics.com/g/collect');
    } else {
      console.log('gtag not found!');
      alert('gtag not loaded!');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">GA Test Page</h1>
      <button
        onClick={sendTestEvent}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Send Test Event
      </button>
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Check the browser console for debug messages
        </p>
      </div>
    </div>
  );
}
