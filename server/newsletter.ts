import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

interface NewsletterSubscriber {
  email: string;
  timestamp: string;
  source: string;
}

const NEWSLETTER_FILE = path.join(process.cwd(), 'newsletter-subscribers.json');

// Initialize file if it doesn't exist
if (!fs.existsSync(NEWSLETTER_FILE)) {
  fs.writeFileSync(NEWSLETTER_FILE, JSON.stringify([], null, 2));
}

export const subscribeNewsletter = async (req: Request, res: Response) => {
  try {
    const { email, source = 'footer' } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Read existing subscribers
    const existingData = fs.readFileSync(NEWSLETTER_FILE, 'utf8');
    const subscribers: NewsletterSubscriber[] = JSON.parse(existingData);

    // Check if email already exists
    const existingSubscriber = subscribers.find(sub => sub.email.toLowerCase() === email.toLowerCase());
    
    if (existingSubscriber) {
      return res.status(200).json({ 
        message: 'Email already subscribed',
        alreadySubscribed: true 
      });
    }

    // Add new subscriber
    const newSubscriber: NewsletterSubscriber = {
      email: email.toLowerCase(),
      timestamp: new Date().toISOString(),
      source
    };

    subscribers.push(newSubscriber);

    // Write back to file
    fs.writeFileSync(NEWSLETTER_FILE, JSON.stringify(subscribers, null, 2));

    console.log(`New newsletter subscriber: ${email} from ${source}`);

    res.status(200).json({ 
      message: 'Successfully subscribed to newsletter',
      subscriberCount: subscribers.length 
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe to newsletter' });
  }
};

export const getNewsletterStats = async (req: Request, res: Response) => {
  try {
    const existingData = fs.readFileSync(NEWSLETTER_FILE, 'utf8');
    const subscribers: NewsletterSubscriber[] = JSON.parse(existingData);

    res.status(200).json({
      totalSubscribers: subscribers.length,
      recentSubscribers: subscribers.slice(-10), // Last 10 subscribers
      sources: subscribers.reduce((acc, sub) => {
        acc[sub.source] = (acc[sub.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });
  } catch (error) {
    console.error('Newsletter stats error:', error);
    res.status(500).json({ error: 'Failed to get newsletter stats' });
  }
};
