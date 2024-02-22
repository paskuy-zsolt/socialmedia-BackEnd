import nodemailer from "nodemailer";

export async function sendEmail(email, name, resetToken) {

    let transporter;

    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.ADMIN_NAME,
                pass: process.env.ADMIN_PASS
            }
        });

        console.log("Transporter created successfully.");
    } catch (error) {
        console.error("Error creating transporter:", error);
        
        return;
    }

    const html = `
        <p>Dear ${name},</p>
        <p>This is a request to reset your password login credential to <strong>Connect Hub</strong>. To ensure the security of your account, we have initiated the password reset process.</p>
        <p>Below are the link to reset your password:</p>
        <p>http://localhost:3000/user/reset-password/:${resetToken} .</p>
        <p>Accessing the following link you will be redirected to enter a new password. With the new password you will now log in to your account.</p>
        <p>Thank you for your attention to this matter.</p>
        <p>Best regards, <br>Connect Hub Team</p>`;

    const mailOptions = {
        from: process.env.ADMIN_NAME,
        to: email,
        subject: "Connect Hub - Password Reset Request",
        html: html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}
