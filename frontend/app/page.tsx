'use client';
import Head from 'next/head';
import SchoolsList from '@/components/SchoolsList';
import { School } from '@/types/school';
import { useEffect, useState } from 'react';


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

  return (
    <>
      <Head>
        <title>Summer & Winter Schools</title>
        <meta name="description" content="List of summer and winter schools" />
      </Head>

      <main style={{ padding: '2rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Summer & Winter Schools</h1>

        <SchoolsList
          initialSchools={schools}
          loading={loading}
          error={error}
        />
      </main>
    </>
  );
}
