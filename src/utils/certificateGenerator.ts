import jsPDF from 'jspdf';

interface CertificateData {
  name: string;
  courseId: string;
  courseName: string;
  dateIssued: string;
  certificateId: string;
  organizationName?: string;
}

export const generateCertificate = async (data: CertificateData): Promise<void> => {
  try {
    // Validate input data
    if (!data.name || !data.courseId || !data.dateIssued || !data.certificateId) {
      throw new Error('Missing required certificate data');
    }

    // Create new PDF document in landscape orientation
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // A4 landscape dimensions: 297mm x 210mm
    const pageWidth = 297;
    const pageHeight = 210;

    // Add background image
    try {
      pdf.addImage('/certbg.png', 'PNG', 0, 0, pageWidth, pageHeight);
    } catch (error) {
      console.warn('Background image not found, using white background');
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    }

    // Add Nova Space logo - convert to base64 or use absolute URL
    try {
      // For web applications, we need to load the image first
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        logoImg.onload = () => {
          // Create canvas to convert image to base64
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = logoImg.width;
          canvas.height = logoImg.height;
          ctx?.drawImage(logoImg, 0, 0);
          
          try {
            const logoDataUrl = canvas.toDataURL('image/png');
            // Logo at better size (30mm x 9mm) and centered horizontally
            const logoWidth = 30;
            const logoHeight = 9;
            const logoX = (pageWidth - logoWidth) / 2;
            pdf.addImage(logoDataUrl, 'PNG', logoX, 20, logoWidth, logoHeight);
            resolve(true);
          } catch (err) {
            console.warn('Failed to convert logo to base64:', err);
            resolve(false);
          }
        };
        logoImg.onerror = () => {
          console.warn('Logo image failed to load');
          resolve(false);
        };
        logoImg.src = '/FullLogo_Transparent_NoBuffer.png';
      });
    } catch (error) {
      console.warn('Logo processing failed, continuing without logo:', error);
    }

    // Set up fonts and colors
    pdf.setTextColor(44, 62, 80); // Dark blue-gray

    // Certificate Title
    pdf.setFontSize(36);
    pdf.setFont('helvetica', 'bold');
    const titleText = 'CERTIFICATE OF COMPLETION';
    const titleWidth = pdf.getTextWidth(titleText);
    pdf.text(titleText, (pageWidth - titleWidth) / 2, 50);

    // Decorative line under title
    pdf.setLineWidth(1);
    pdf.setDrawColor(52, 152, 219); // Blue
    pdf.line((pageWidth - titleWidth) / 2, 55, (pageWidth + titleWidth) / 2, 55);

    // "This is to certify that" text
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    const certifyText = 'This is to certify that';
    const certifyWidth = pdf.getTextWidth(certifyText);
    pdf.text(certifyText, (pageWidth - certifyWidth) / 2, 75);

    // Student Name (larger, bold)
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(52, 152, 219); // Blue color for name
    const nameWidth = pdf.getTextWidth(data.name);
    pdf.text(data.name, (pageWidth - nameWidth) / 2, 95);

    // Decorative line under name
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(52, 152, 219);
    pdf.line((pageWidth - nameWidth) / 2 - 10, 100, (pageWidth + nameWidth) / 2 + 10, 100);

    // "has successfully completed" text
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(44, 62, 80);
    const completedText = 'has successfully completed the simulation training course';
    const completedWidth = pdf.getTextWidth(completedText);
    pdf.text(completedText, (pageWidth - completedWidth) / 2, 115);

    // Course Name
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(231, 76, 60); // Red color for course
    const courseWidth = pdf.getTextWidth(data.courseName || data.courseId);
    pdf.text(data.courseName || data.courseId, (pageWidth - courseWidth) / 2, 135);

    // Date and Certificate ID section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(44, 62, 80);

    // Date issued (left side)
    const dateText = `Date Issued: ${data.dateIssued}`;
    pdf.text(dateText, 40, 165);

    // Certificate ID (right side)
    const certIdText = `Certificate ID: ${data.certificateId}`;
    const certIdWidth = pdf.getTextWidth(certIdText);
    pdf.text(certIdText, pageWidth - certIdWidth - 40, 165);

    // Organization name (if provided)
    if (data.organizationName) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      const orgText = data.organizationName;
      const orgWidth = pdf.getTextWidth(orgText);
      pdf.text(orgText, (pageWidth - orgWidth) / 2, 185);
    }

    // Nova Space VR Training System and Website
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(127, 140, 141); // Gray
    const systemText = 'Nova Space VR Training System - www.novaspace.space';
    const systemWidth = pdf.getTextWidth(systemText);
    pdf.text(systemText, (pageWidth - systemWidth) / 2, 195);

    // Add decorative elements (corners)
    pdf.setLineWidth(2);
    pdf.setDrawColor(52, 152, 219);
    
    // Top left corner
    pdf.line(20, 20, 40, 20);
    pdf.line(20, 20, 20, 40);
    
    // Top right corner
    pdf.line(pageWidth - 40, 20, pageWidth - 20, 20);
    pdf.line(pageWidth - 20, 20, pageWidth - 20, 40);
    
    // Bottom left corner
    pdf.line(20, pageHeight - 40, 20, pageHeight - 20);
    pdf.line(20, pageHeight - 20, 40, pageHeight - 20);
    
    // Bottom right corner
    pdf.line(pageWidth - 20, pageHeight - 40, pageWidth - 20, pageHeight - 20);
    pdf.line(pageWidth - 40, pageHeight - 20, pageWidth - 20, pageHeight - 20);

    // Save the PDF
    const fileName = `Certificate_${data.name.replace(/\s+/g, '_')}_${data.certificateId}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating certificate:', error);
    throw new Error('Failed to generate certificate. Please try again.');
  }
};

// Helper function to get course name from course ID
export const getCourseNameById = (courseId: string): string => {
  const courseNames: { [key: string]: string } = {
    'P001': 'Automotive Engineering',
    'P002': 'Electrical Engineering', 
    'P003': 'Mechanical Engineering',
    'P004': 'Plumbing Course',
    'P005': 'TechCorp Safety Training',
    'P006': 'Advanced Manufacturing Processes',
    'C001': 'Automotive Engineering',
    'C002': 'Electrical Engineering',
    'C003': 'Mechanical Engineering', 
    'C004': 'Plumbing Course'
  };
  
  return courseNames[courseId] || courseId;
};