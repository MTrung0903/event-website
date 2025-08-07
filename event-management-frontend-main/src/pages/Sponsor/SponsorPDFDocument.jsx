import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Định nghĩa style
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
    width: '16.66%',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    backgroundColor: '#f0f0f0',
    padding: 2,
    fontWeight: 'bold',
  },
  tableCol: {
    width: '16.66%',
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

// Các cột hiển thị (giới hạn 7 cột để fit trang ngang)
const headers = [
  'ID',
  'Name',
  'Email',
  'Phone',
  'Type',
  'Level'
];

// Component PDF
const SponsorPDFDocument = ({ sponsors }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Sponsor List</Text>
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
        {sponsors.map((sponsor, rowIndex) => (
          <View style={styles.tableRow} key={rowIndex}>
            <View style={styles.tableCol}>
              <Text style={styles.cellText}>{sponsor.sponsorId}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cellText}>{sponsor.sponsorName}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cellText}>{sponsor.sponsorEmail}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cellText}>{sponsor.sponsorPhone}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cellText}>{sponsor.sponsorType}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cellText}>{sponsor.sponsorLevel}</Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default SponsorPDFDocument;
