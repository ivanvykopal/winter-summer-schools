'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/schools.module.css'; 

interface School {
  name: string;
  link: string;
  venue: string;
  date: string;
  application_deadline?: string;
}

export default function Home() {

  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSchoolsData = async () => {
      try {
        const apiUrl = '/api/schools';
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch schools data: ${response.status}`);
        }
        const result = await response.json();
        const data = result.data || result;
        setSchools(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading schools:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadSchoolsData();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading schools data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Summer & Winter Schools</title>
        <meta name="description" content="List of summer and winter schools" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Summer & Winter Schools</h1>

        {/* Results Count */}
        <div className={styles.resultsInfo}>
          Showing {schools.length} of {schools.length} schools
        </div>

        {/* Schools List */}
        <div className={styles.schoolsList}>
          {schools.length === 0 ? (
            <div className={styles.noResults}>No schools found matching your criteria.</div>
          ) : (
            schools.map((school, index) => (
              <div key={index} className={styles.schoolCard}>
                <div className={styles.schoolHeader}>
                  <h2 className={styles.schoolName}>
                    <a 
                      href={school.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.schoolLink}
                    >
                      {school.name}
                    </a>
                  </h2>
                </div>
                
                <div className={styles.schoolDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Venue:</span>
                    <span className={styles.detailValue}>{school.venue || 'N/A'}</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Date:</span>
                    <span className={styles.detailValue}>
                      {school.date}
                    </span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Application Deadline:</span>
                    <span className={styles.detailValue}>
                      {school.application_deadline ? 
                        school.application_deadline : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
