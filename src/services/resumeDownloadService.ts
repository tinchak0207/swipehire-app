/**
 * Resume Download Service
 * Handles client-side generation and download of optimized resumes in PDF and DOCX formats
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import type { ResumeAnalysisResponse } from '@/lib/types/resume-optimizer';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface DownloadOptions {
  format: 'pdf' | 'docx';
  includeAnalysis?: boolean;
  includeSuggestions?: boolean;
  adoptedSuggestions?: string[];
  fileName?: string;
}

export interface DownloadResult {
  success: boolean;
  fileName?: string;
  error?: string;
}

/**
 * Main service class for handling resume downloads
 */
export class ResumeDownloadService {
  /**
   * Downloads the optimized resume in the specified format
   */
  static async downloadResume(
    resumeContent: string,
    analysisResult: ResumeAnalysisResponse | null,
    options: DownloadOptions
  ): Promise<DownloadResult> {
    try {
      const { format, fileName } = options;
      const timestamp = new Date().toISOString().slice(0, 10);
      const defaultFileName = `resume_optimized_${timestamp}`;
      const finalFileName = fileName || defaultFileName;

      if (format === 'pdf') {
        return await this.generatePDF(resumeContent, analysisResult, options, finalFileName);
      } else if (format === 'docx') {
        return await this.generateDOCX(resumeContent, analysisResult, options, finalFileName);
      } else {
        throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error('Resume download error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to download resume'
      };
    }
  }

  /**
   * Generates and downloads a PDF version of the resume
   */
  private static async generatePDF(
    resumeContent: string,
    analysisResult: ResumeAnalysisResponse | null,
    options: DownloadOptions,
    fileName: string
  ): Promise<DownloadResult> {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to add text with word wrapping
      const addWrappedText = (text: string, fontSize: number = 11, isBold: boolean = false): number => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = doc.splitTextToSize(text, contentWidth);
        const lineHeight = fontSize * 0.4;
        
        // Check if we need a new page
        if (yPosition + (lines.length * lineHeight) > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        
        lines.forEach((line: string) => {
          doc.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
        
        return yPosition;
      };

      // Add title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Optimized Resume', margin, yPosition);
      yPosition += 15;

      // Add analysis score if available
      if (analysisResult) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Overall Score: ${analysisResult.overallScore}/100`, margin, yPosition);
        doc.text(`ATS Score: ${analysisResult.atsScore}/100`, margin + 80, yPosition);
        yPosition += 15;
      }

      // Add separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Add resume content
      yPosition = addWrappedText(resumeContent, 11, false);
      yPosition += 10;

      // Add analysis section if requested
      if (options.includeAnalysis && analysisResult) {
        // Add new page for analysis
        doc.addPage();
        yPosition = margin;

        // Analysis title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Resume Analysis Report', margin, yPosition);
        yPosition += 15;

        // Scores section
        doc.setFontSize(14);
        doc.text('Scores', margin, yPosition);
        yPosition += 10;

        const scoresData = [
          ['Overall Score', `${analysisResult.overallScore}/100`],
          ['ATS Compatibility', `${analysisResult.atsScore}/100`],
          ['Keyword Match', `${analysisResult.keywordAnalysis.score}/100`],
          ['Grammar Score', `${analysisResult.grammarCheck.score}/100`],
          ['Format Score', `${analysisResult.formatAnalysis.score}/100`]
        ];

        doc.autoTable({
          startY: yPosition,
          head: [['Metric', 'Score']],
          body: scoresData,
          theme: 'grid',
          headStyles: { fillColor: [66, 139, 202] },
          margin: { left: margin, right: margin },
          tableWidth: contentWidth
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;

        // Strengths section
        if (analysisResult.strengths.length > 0) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('Strengths', margin, yPosition);
          yPosition += 10;

          analysisResult.strengths.forEach((strength) => {
            yPosition = addWrappedText(`• ${strength}`, 11, false);
          });
          yPosition += 10;
        }

        // Weaknesses section
        if (analysisResult.weaknesses.length > 0) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('Areas for Improvement', margin, yPosition);
          yPosition += 10;

          analysisResult.weaknesses.forEach((weakness) => {
            yPosition = addWrappedText(`• ${weakness}`, 11, false);
          });
          yPosition += 10;
        }

        // Suggestions section
        if (options.includeSuggestions && analysisResult.suggestions.length > 0) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('Optimization Suggestions', margin, yPosition);
          yPosition += 10;

          const adoptedSet = new Set(options.adoptedSuggestions || []);
          
          analysisResult.suggestions.forEach((suggestion, index) => {
            const isAdopted = adoptedSet.has(suggestion.id);
            const status = isAdopted ? '[ADOPTED]' : '[PENDING]';
            
            yPosition = addWrappedText(`${index + 1}. ${status} ${suggestion.title}`, 11, true);
            yPosition = addWrappedText(`   ${suggestion.description}`, 10, false);
            yPosition = addWrappedText(`   Impact: ${suggestion.impact.toUpperCase()}`, 10, false);
            yPosition += 5;
          });
        }
      }

      // Generate and download the PDF
      const pdfBlob = doc.output('blob');
      this.downloadBlob(pdfBlob, `${fileName}.pdf`);

      return {
        success: true,
        fileName: `${fileName}.pdf`
      };
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  /**
   * Generates and downloads a DOCX version of the resume
   */
  private static async generateDOCX(
    resumeContent: string,
    analysisResult: ResumeAnalysisResponse | null,
    options: DownloadOptions,
    fileName: string
  ): Promise<DownloadResult> {
    try {
      const children: any[] = [];

      // Add title
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Optimized Resume',
              bold: true,
              size: 32
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );

      // Add analysis score if available
      if (analysisResult) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Overall Score: ${analysisResult.overallScore}/100 | ATS Score: ${analysisResult.atsScore}/100`,
                bold: true,
                size: 24
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 }
          })
        );
      }

      // Add separator
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '─'.repeat(50),
              color: '999999'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 }
        })
      );

      // Add resume content
      const resumeParagraphs = resumeContent.split('\n').filter(line => line.trim());
      resumeParagraphs.forEach(paragraph => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: paragraph,
                size: 22
              })
            ],
            spacing: { after: 200 }
          })
        );
      });

      // Add analysis section if requested
      if (options.includeAnalysis && analysisResult) {
        // Page break
        children.push(
          new Paragraph({
            children: [new TextRun({ text: '', break: 1 })],
            pageBreakBefore: true
          })
        );

        // Analysis title
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Resume Analysis Report',
                bold: true,
                size: 28
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 400 }
          })
        );

        // Scores section
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Performance Scores',
                bold: true,
                size: 24
              })
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 }
          })
        );

        const scores = [
          `Overall Score: ${analysisResult.overallScore}/100`,
          `ATS Compatibility: ${analysisResult.atsScore}/100`,
          `Keyword Match: ${analysisResult.keywordAnalysis.score}/100`,
          `Grammar Score: ${analysisResult.grammarCheck.score}/100`,
          `Format Score: ${analysisResult.formatAnalysis.score}/100`
        ];

        scores.forEach(score => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `• ${score}`,
                  size: 22
                })
              ],
              spacing: { after: 150 }
            })
          );
        });

        // Strengths section
        if (analysisResult.strengths.length > 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Strengths',
                  bold: true,
                  size: 24
                })
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            })
          );

          analysisResult.strengths.forEach(strength => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${strength}`,
                    size: 22
                  })
                ],
                spacing: { after: 150 }
              })
            );
          });
        }

        // Weaknesses section
        if (analysisResult.weaknesses.length > 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Areas for Improvement',
                  bold: true,
                  size: 24
                })
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            })
          );

          analysisResult.weaknesses.forEach(weakness => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${weakness}`,
                    size: 22
                  })
                ],
                spacing: { after: 150 }
              })
            );
          });
        }

        // Suggestions section
        if (options.includeSuggestions && analysisResult.suggestions.length > 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Optimization Suggestions',
                  bold: true,
                  size: 24
                })
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            })
          );

          const adoptedSet = new Set(options.adoptedSuggestions || []);
          
          analysisResult.suggestions.forEach((suggestion, index) => {
            const isAdopted = adoptedSet.has(suggestion.id);
            const status = isAdopted ? '[ADOPTED]' : '[PENDING]';
            
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}. ${status} ${suggestion.title}`,
                    bold: true,
                    size: 22
                  })
                ],
                spacing: { after: 100 }
              })
            );

            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `   ${suggestion.description}`,
                    size: 20
                  })
                ],
                spacing: { after: 100 }
              })
            );

            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `   Impact: ${suggestion.impact.toUpperCase()}`,
                    size: 20,
                    color: suggestion.impact === 'high' ? 'FF0000' : suggestion.impact === 'medium' ? 'FFA500' : '008000'
                  })
                ],
                spacing: { after: 200 }
              })
            );
          });
        }
      }

      // Create the document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: children
          }
        ]
      });

      // Generate and download the DOCX
      const docxBlob = await Packer.toBlob(doc);
      this.downloadBlob(docxBlob, `${fileName}.docx`);

      return {
        success: true,
        fileName: `${fileName}.docx`
      };
    } catch (error) {
      console.error('DOCX generation error:', error);
      throw new Error('Failed to generate DOCX');
    }
  }

  /**
   * Downloads a blob as a file
   */
  private static downloadBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Validates resume content before download
   */
  static validateResumeContent(content: string): { isValid: boolean; error?: string } {
    if (!content || content.trim().length === 0) {
      return { isValid: false, error: 'Resume content is empty' };
    }

    if (content.length < 100) {
      return { isValid: false, error: 'Resume content is too short (minimum 100 characters)' };
    }

    if (content.length > 50000) {
      return { isValid: false, error: 'Resume content is too long (maximum 50,000 characters)' };
    }

    return { isValid: true };
  }

  /**
   * Gets suggested file name based on resume content
   */
  static getSuggestedFileName(resumeContent: string, analysisResult?: ResumeAnalysisResponse | null): string {
    const timestamp = new Date().toISOString().slice(0, 10);
    
    // Try to extract name from resume content
    const lines = resumeContent.split('\n').slice(0, 5); // Check first 5 lines
    const namePattern = /^[A-Z][a-z]+ [A-Z][a-z]+/;
    
    for (const line of lines) {
      const match = line.trim().match(namePattern);
      if (match) {
        const name = match[0].toLowerCase().replace(/\s+/g, '_');
        return `${name}_resume_optimized_${timestamp}`;
      }
    }

    // Fallback to generic name with score if available
    if (analysisResult) {
      return `resume_optimized_score_${analysisResult.overallScore}_${timestamp}`;
    }

    return `resume_optimized_${timestamp}`;
  }
}

export default ResumeDownloadService;