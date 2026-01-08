/**
 * Shared PDF Styles for Exam Documents
 */

import { StyleSheet, Font } from '@react-pdf/renderer';

// Register Vietnamese-compatible fonts (using Google Fonts CDN URLs)
// Note: In production, download and serve these fonts locally for reliability
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf',
      fontWeight: 'bold',
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1Mu52xPKTM1K9nz.ttf',
      fontWeight: 'normal',
      fontStyle: 'italic',
    },
  ],
});

// Hyphenation callback for Vietnamese (prevent word breaks)
Font.registerHyphenationCallback((word) => [word]);

export const examStyles = StyleSheet.create({
  // Page layout
  page: {
    fontFamily: 'Roboto',
    fontSize: 11,
    padding: 40,
    paddingTop: 30,
    paddingBottom: 50,
    lineHeight: 1.5,
    backgroundColor: '#ffffff',
  },

  // Header section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  schoolInfo: {
    fontSize: 10,
    maxWidth: '60%',
  },
  schoolName: {
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 2,
  },
  examCodeBox: {
    textAlign: 'right',
  },
  examCode: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  examCodeLabel: {
    fontSize: 9,
    color: '#666666',
  },

  // Title section
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 15,
    color: '#333333',
  },

  // Student info section
  studentInfoSection: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    borderBottomStyle: 'dashed',
  },
  studentInfoField: {
    flex: 1,
    marginRight: 10,
  },
  studentInfoLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  studentInfoLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#999999',
    borderBottomStyle: 'dotted',
    height: 20,
  },

  // Instructions
  instructions: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginBottom: 15,
    borderRadius: 4,
  },
  instructionsTitle: {
    fontWeight: 'bold',
    fontSize: 10,
    marginBottom: 5,
  },
  instructionsText: {
    fontSize: 9,
    color: '#333333',
    lineHeight: 1.4,
  },

  // Question section
  questionSection: {
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  questionNumber: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  questionPrompt: {
    flex: 1,
    lineHeight: 1.4,
  },

  // MCQ options
  optionsContainer: {
    paddingLeft: 25,
    marginTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  optionLabel: {
    fontWeight: 'bold',
    width: 20,
    marginRight: 5,
  },
  optionText: {
    flex: 1,
    lineHeight: 1.3,
  },

  // Essay answer area
  essayArea: {
    marginTop: 8,
    marginLeft: 25,
    height: 80,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 4,
    padding: 8,
  },
  essayPlaceholder: {
    fontSize: 9,
    color: '#999999',
    fontStyle: 'italic',
  },

  // Answer grid (bubble sheet style)
  answerGridContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
  },
  answerGridTitle: {
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 10,
    textAlign: 'center',
  },
  answerGridRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  answerGridNumber: {
    width: 25,
    fontWeight: 'bold',
    fontSize: 10,
  },
  answerGridOptions: {
    flexDirection: 'row',
    flex: 1,
  },
  answerBubble: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#000000',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerBubbleText: {
    fontSize: 9,
    fontWeight: 'bold',
  },

  // Page footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#666666',
  },

  // Answer key styles
  answerKeyHeader: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  answerKeyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  answerKeySubtitle: {
    fontSize: 10,
    color: '#666666',
  },
  answerKeyTable: {
    marginTop: 10,
  },
  answerKeyRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingVertical: 6,
    alignItems: 'center',
  },
  answerKeyRowHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  },
  answerKeyCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
  },
  answerKeyCellNumber: {
    width: 50,
    textAlign: 'center',
  },
  answerKeyCellAnswer: {
    width: 60,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  answerKeyCellPoints: {
    width: 60,
    textAlign: 'center',
  },
});

// Font size variants
export const fontSizes = {
  small: {
    page: 10,
    title: 12,
    question: 10,
    option: 9,
  },
  medium: {
    page: 11,
    title: 14,
    question: 11,
    option: 10,
  },
  large: {
    page: 12,
    title: 16,
    question: 12,
    option: 11,
  },
};
