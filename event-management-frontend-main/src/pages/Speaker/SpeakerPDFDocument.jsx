
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '12.5%',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    backgroundColor: '#f0f0f0',
    padding: 2,
    fontWeight: 'bold',
  },
  tableCol: {
    width: '12.5%',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 2,
  },
  cellText: {
    fontSize: 8,
    wordWrap: 'break-word',
  },
});

// Columns to display (limited to 8 to fit landscape page)
const headers = [
  'ID',
  'Name',
  'Email',
  'Phone',
  'Biography',
  'Experience',
  'Social Media',
  'Status',
];

// PDF Component
const SpeakerPDFDocument = ({ speakers }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Speaker List</Text>
      <View style={styles.table}>
        {/* Header row */}
        <View style={styles.tableRow}>
          {headers.map((header, index) => (
            <View style={styles.tableColHeader} key={index}>
              <Text style={styles.cellText}>{header}</Text>
            </View>
          ))}
        </View>

        {/* Data rows */}
        {speakers.map((speaker, rowIndex) => (
          <View style={styles.tableRow} key={rowIndex}>
            <View style={styles.tableCol}>
              <Text style={styles.cellText}>{speaker.speakerId}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cellText}>{speaker.speakerName}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cellText}>{speaker.speakerEmail}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cellText}>{speaker.speakerPhone}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cellText}>{speaker.speakerDesc}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cellText}>{speaker.speakerExperience}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cellText}>{speaker.speakerSocialMedia}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cellText}>{speaker.speakerStatus}</Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default SpeakerPDFDocument;
