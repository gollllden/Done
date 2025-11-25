import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Mail, Send } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const EmailModal = ({ isOpen, onClose, customer }) => {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject || !message) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in subject and message',
        variant: 'destructive'
      });
      return;
    }

    if (!customer.email) {
      toast({
        title: 'No Email Address',
        description: 'This customer did not provide an email address',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const API = `${BACKEND_URL}/api`;
      
      const response = await fetch(`${API}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_email: customer.email,
          to_name: customer.name,
          subject: subject,
          message: message,
          customer_id: customer.customerId
        })
      });

      if (response.ok) {
        toast({
          title: 'Email Sent Successfully! ✉️',
          description: `Message sent to ${customer.name} at ${customer.email}`,
        });
        setSubject('');
        setMessage('');
        onClose();
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      toast({
        title: 'Failed to Send Email',
        description: 'There was an error sending the email. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Send Message to Customer
          </DialogTitle>
          <DialogDescription>
            Sending to: {customer?.name} ({customer?.email || customer?.phone})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="e.g., Booking Confirmation Update"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Professional Templates:</strong>
            </p>
            <div className="mt-3 space-y-2">
              <button
                onClick={() => setMessage(`Dear ${customer?.name},\n\nGreat news! Your booking with Golden Touch Cleaning Services has been confirmed.\n\nService: ${customer?.serviceName}\nDate: ${customer?.date}\nTime: ${customer?.time}\nLocation: ${customer?.address}\n\nOur professional team will arrive on time and fully equipped to deliver exceptional service. We will call you 30 minutes before arrival.\n\nIf you have any questions or need to make changes, please don't hesitate to contact us at (647) 787-5942.\n\nThank you for choosing Golden Touch Cleaning Services!\n\nBest regards,\nGolden Touch Cleaning Services Team\nCalgary's Premier Cleaning Service`)}
                className="text-sm text-blue-600 hover:text-blue-700 block w-full text-left p-2 hover:bg-blue-100 rounded"
              >
                📋 Booking Confirmation
              </button>
              <button
                onClick={() => setMessage(`Hi ${customer?.name},\n\nWe're on our way to your location!\n\nExpected arrival: 15-20 minutes\nLocation: ${customer?.address}\n\nOur team is fully prepared with all necessary equipment and supplies to provide you with exceptional service.\n\nPlease ensure:\n• Access to the service area is clear\n• Pets are secured (if applicable)\n• Water and electricity access is available\n\nIf you need to reach us immediately, call (647) 787-5942.\n\nSee you soon!\n\nGolden Touch Cleaning Services Team`)}
                className="text-sm text-blue-600 hover:text-blue-700 block w-full text-left p-2 hover:bg-blue-100 rounded"
              >
                🚗 On The Way
              </button>
              <button
                onClick={() => setMessage(`Dear ${customer?.name},\n\nThank you for choosing Golden Touch Cleaning Services! It was our pleasure to serve you today.\n\nWe hope you're completely satisfied with our ${customer?.serviceName} service. Your satisfaction is our top priority.\n\nWe would greatly appreciate your feedback:\n• How did we do?\n• Is there anything we could improve?\n• Would you recommend us to others?\n\nFor your next booking, mention this service and receive 10% off!\n\nStay connected:\n📞 Phone: (647) 787-5942\n📧 Email: ohemenggold@gmail.com\n\nWe look forward to serving you again!\n\nBest regards,\nGolden Touch Cleaning Services Team\nCalgary's Premier Mobile Cleaning Service`)}
                className="text-sm text-blue-600 hover:text-blue-700 block w-full text-left p-2 hover:bg-blue-100 rounded"
              >
                ⭐ Thank You & Follow Up
              </button>
              <button
                onClick={() => setMessage(`Dear ${customer?.name},\n\nWe wanted to remind you of your upcoming appointment with Golden Touch Cleaning Services.\n\nService Details:\n• Service: ${customer?.serviceName}\n• Date: ${customer?.date}\n• Time: ${customer?.time}\n• Location: ${customer?.address}\n\nTo ensure smooth service delivery, please:\n✓ Be available at the scheduled time\n✓ Provide access to service areas\n✓ Secure any pets if applicable\n\nNeed to reschedule? No problem! Just call us at (647) 787-5942 at least 24 hours in advance.\n\nWe're excited to serve you!\n\nBest regards,\nGolden Touch Cleaning Services Team`)}
                className="text-sm text-blue-600 hover:text-blue-700 block w-full text-left p-2 hover:bg-blue-100 rounded"
              >
                🔔 Appointment Reminder
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            disabled={sending}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {sending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailModal;
