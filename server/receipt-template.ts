/**
 * DOPAYA RECEIPT TEMPLATE
 * 
 * This file defines the receipt format and copy for payment confirmations.
 * Based on PRD Section 6: Receipts & Transparency (Split-Receipt + Public Summary)
 * 
 * Implementation: To be integrated with email service (e.g., SendGrid, AWS SES, Resend)
 */

export interface ReceiptData {
  // Transaction details
  transactionId: string;
  transactionDate: Date;
  
  // User details
  payerName: string;
  payerEmail: string;
  
  // Project Support details
  projectSupportAmount: number;
  projectName: string;
  projectId: number;
  impactPointsEarned: number;
  
  // Optional Tip details
  tipAmount: number;
  
  // Total
  totalAmount: number;
  
  // Payment method
  paymentMethod: string; // e.g., "Visa ending in 1234"
}

/**
 * Generate receipt email HTML
 * 
 * CRITICAL: This receipt clearly separates:
 * 1) Project Support (goes to Social Enterprise via Impaktera)
 * 2) Optional Tip to Dopaya (goes to Dopaya)
 * 
 * Each line item shows: Payer, Recipient/Beneficiary, Processor, and Tax notes
 */
export function generateReceiptHTML(data: ReceiptData): string {
  const {
    transactionId,
    transactionDate,
    payerName,
    payerEmail,
    projectSupportAmount,
    projectName,
    impactPointsEarned,
    tipAmount,
    totalAmount,
    paymentMethod
  } = data;
  
  const formattedDate = transactionDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Dopaya Receipt</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f2662d;
    }
    .header h1 {
      color: #f2662d;
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header p {
      color: #666;
      margin: 0;
      font-size: 14px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e5e5;
    }
    .line-item {
      background-color: #f9f9f9;
      border-left: 4px solid #f2662d;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    .line-item.tip {
      border-left-color: #9333ea;
    }
    .line-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .line-item-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    .line-item-amount {
      font-size: 18px;
      font-weight: 700;
      color: #f2662d;
    }
    .line-item.tip .line-item-amount {
      color: #9333ea;
    }
    .line-item-details {
      font-size: 13px;
      color: #666;
      line-height: 1.5;
    }
    .line-item-details strong {
      color: #333;
      font-weight: 600;
    }
    .note {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      margin-top: 10px;
      border-radius: 4px;
      font-size: 12px;
      color: #92400e;
    }
    .impact-points {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }
    .impact-points .value {
      font-size: 32px;
      font-weight: 700;
      color: #f2662d;
      margin: 10px 0;
    }
    .impact-points .label {
      font-size: 14px;
      color: #666;
    }
    .total {
      background-color: #333;
      color: #fff;
      padding: 20px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      font-weight: 600;
      margin-top: 30px;
    }
    .total .amount {
      font-size: 24px;
      font-weight: 700;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
    .footer a {
      color: #f2662d;
      text-decoration: none;
    }
    .transaction-details {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      font-size: 12px;
      color: #666;
    }
    .transaction-details div {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Thank You for Your Support!</h1>
      <p>Receipt for your impact on ${formattedDate}</p>
    </div>
    
    <!-- Impact Points Earned -->
    <div class="impact-points">
      <div class="label">You've Earned</div>
      <div class="value">${impactPointsEarned}</div>
      <div class="label">Impact Points</div>
    </div>
    
    <!-- Line Item 1: Project Support -->
    <div class="section">
      <div class="section-title">Your Support Breakdown</div>
      
      <div class="line-item">
        <div class="line-item-header">
          <div class="line-item-title">Project Support</div>
          <div class="line-item-amount">$${projectSupportAmount.toFixed(2)}</div>
        </div>
        <div class="line-item-details">
          <div><strong>Payer:</strong> ${payerName} (${payerEmail})</div>
          <div><strong>Recipient (Beneficiary):</strong> ${projectName}</div>
          <div><strong>Processor (Nonprofit facilitator):</strong> Impaktera (Suisse-based non-profit Association according to Art. 60 ff. of the Swiss Civil Code, ZGB)</div>
          <div style="margin-top: 8px;"><strong>Impact Points:</strong> ${impactPointsEarned} IP earned (10 IP per $1)</div>
        </div>
        <div class="note">
          <strong>Important:</strong> Not tax-deductible at this time. (We are actively working on this!) 100% of this amount goes to ${projectName}, minus unavoidable payment processing fees. You'll receive updates from our partner; some updates may be aggregated.
        </div>
      </div>
      
      ${tipAmount > 0 ? `
      <!-- Line Item 2: Optional Tip to Dopaya -->
      <div class="line-item tip">
        <div class="line-item-header">
          <div class="line-item-title">Tip to Dopaya</div>
          <div class="line-item-amount">$${tipAmount.toFixed(2)}</div>
        </div>
        <div class="line-item-details">
          <div><strong>Payee:</strong> Dopaya (legal entity)</div>
          <div><strong>Purpose:</strong> Keeps the platform independent and ad-free</div>
        </div>
        <div class="note">
          <strong>Note:</strong> Tip (not tax-deductible). No Impact Points earned for tips. Thank you for supporting the platform!
        </div>
      </div>
      ` : ''}
    </div>
    
    <!-- Total -->
    <div class="total">
      <span>Total Paid</span>
      <span class="amount">$${totalAmount.toFixed(2)}</span>
    </div>
    
    <!-- Transaction Details -->
    <div class="section">
      <div class="section-title">Transaction Details</div>
      <div class="transaction-details">
        <div><strong>Transaction ID:</strong> ${transactionId}</div>
        <div><strong>Date:</strong> ${formattedDate}</div>
        <div><strong>Payment Method:</strong> ${paymentMethod}</div>
        <div><strong>Email:</strong> ${payerEmail}</div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>Questions? Visit <a href="https://dopaya.com/trust">Trust & Transparency</a> or contact <a href="mailto:support@dopaya.com">support@dopaya.com</a></p>
      <p style="margin-top: 15px;">Dopaya - Supporting Social Enterprises, Empowering Change</p>
      <p>Please keep this receipt for your records.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of receipt (for email clients that don't support HTML)
 */
export function generateReceiptText(data: ReceiptData): string {
  const {
    transactionId,
    transactionDate,
    payerName,
    payerEmail,
    projectSupportAmount,
    projectName,
    impactPointsEarned,
    tipAmount,
    totalAmount,
    paymentMethod
  } = data;
  
  const formattedDate = transactionDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `
DOPAYA - RECEIPT
================

Thank you for your support on ${formattedDate}!

YOU'VE EARNED: ${impactPointsEarned} Impact Points
-----------------

YOUR SUPPORT BREAKDOWN
----------------------

1) PROJECT SUPPORT: $${projectSupportAmount.toFixed(2)}
   
   Payer: ${payerName} (${payerEmail})
   Recipient (Beneficiary): ${projectName}
   Processor (Nonprofit facilitator): Impaktera (Suisse-based non-profit Association according to Art. 60 ff. of the Swiss Civil Code, ZGB)
   Impact Points: ${impactPointsEarned} IP earned (10 IP per $1)
   
   IMPORTANT: Not tax-deductible at this time. (We are actively working on this!)
   100% of this amount goes to ${projectName}, minus unavoidable payment processing fees.
   You'll receive updates from our partner; some updates may be aggregated.

${tipAmount > 0 ? `
2) TIP TO DOPAYA: $${tipAmount.toFixed(2)}
   
   Payee: Dopaya (legal entity)
   Purpose: Keeps the platform independent and ad-free
   
   NOTE: Tip (not tax-deductible). No Impact Points earned for tips.
   Thank you for supporting the platform!
` : ''}

TOTAL PAID: $${totalAmount.toFixed(2)}
-----------

TRANSACTION DETAILS
-------------------
Transaction ID: ${transactionId}
Date: ${formattedDate}
Payment Method: ${paymentMethod}
Email: ${payerEmail}

---

Questions? Visit https://dopaya.com/trust or contact support@dopaya.com

Dopaya - Supporting Social Enterprises, Empowering Change
Please keep this receipt for your records.
  `.trim();
}

/**
 * Send receipt email
 * 
 * Integration: Connect to your email service (SendGrid, AWS SES, Resend, etc.)
 */
export async function sendReceiptEmail(data: ReceiptData): Promise<void> {
  const htmlContent = generateReceiptHTML(data);
  const textContent = generateReceiptText(data);
  
  // TODO: Integrate with actual email service
  // Example with SendGrid:
  // await sgMail.send({
  //   to: data.payerEmail,
  //   from: 'receipts@dopaya.com',
  //   subject: `Your Dopaya Receipt - ${data.projectName}`,
  //   text: textContent,
  //   html: htmlContent,
  // });
  
  console.log('Receipt email would be sent to:', data.payerEmail);
  console.log('HTML Preview:', htmlContent.substring(0, 500) + '...');
}

