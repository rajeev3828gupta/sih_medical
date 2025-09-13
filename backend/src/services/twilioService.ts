import twilio from 'twilio';

let client: any = null;

// Only initialize Twilio if credentials are provided
if (process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_AUTH_TOKEN && 
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  console.log('✅ Twilio initialized');
} else {
  console.log('⚠️  Twilio not configured - SMS will be simulated');
}

export const sendOtpSms = async (phone: string, otp: string): Promise<void> => {
  if (!client) {
    console.log(`📱 Development mode: OTP for ${phone} is ${otp}`);
    return;
  }

  try {
    await client.messages.create({
      body: `Your Telemedicine Nabha verification code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    
    console.log(`OTP sent to ${phone}`);
  } catch (error) {
    console.error('Twilio SMS error:', error);
    console.log(`📱 Fallback: OTP for ${phone} is ${otp}`);
  }
};

export const sendAppointmentSms = async (
  phone: string, 
  doctorName: string, 
  appointmentTime: Date
): Promise<void> => {
  if (!client) {
    console.log(`📱 Development mode: Appointment SMS for ${phone}`);
    return;
  }

  try {
    const message = `Your appointment with Dr. ${doctorName} is scheduled for ${appointmentTime.toLocaleString()}. Join via Telemedicine Nabha app.`;
    
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    
    console.log(`Appointment SMS sent to ${phone}`);
  } catch (error) {
    console.error('Twilio SMS error:', error);
    console.log(`📱 Fallback: Appointment SMS for ${phone}`);
  }
};
