'use client';

import { useState, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Chip from '@mui/material/Chip';
import {
  LocationOn,
  CalendarToday,
  EventAvailable,
  EventBusy,
  Description
} from '@mui/icons-material';
import Filter, { Filters } from '@/components/Filter';
import { School } from '@/types/school';
import { CircularProgress } from '@mui/material';

type Props = {
  initialSchools: School[];
  loading?: boolean;
  error?: string | null;
};

export default function SchoolsList({ initialSchools, loading, error }: Props) {
  const [filters, setFilters] = useState<Filters>({
    name: '',
    registrationStatus: 'all', // Changed default to 'all'
    startDateFrom: '',
    startDateTo: '',
    deadlineBefore: '',
    sortOrder: 'asc',
  });

  const formatDate = (raw?: string) => {
    if (!raw) return 'N/A';
    const iso = raw.split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return raw;

    // Format as "Jan 20, 2026"
    const date = new Date(iso);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'open') return 'success';
    if (statusLower === 'closed') return 'error';
    return 'default';
  };

  const filtered = useMemo(() => {
    const toMs = (s: string) => (s ? new Date(s).getTime() : NaN);
    const hasName = filters.name.trim().length > 0;
    const nameLC = filters.name.toLowerCase();
    // FIXED: Only filter by status if it's not empty AND not 'all'
    const hasStatus = filters.registrationStatus !== '' && filters.registrationStatus !== 'all';
    const hasFrom = filters.startDateFrom !== '';
    const hasTo = filters.startDateTo !== '';
    const hasDeadline = filters.deadlineBefore !== '';

    const result = initialSchools.filter((sch) => {
      if (hasName && !sch.name.toLowerCase().includes(nameLC)) return false;

      // FIXED: Only filter by status when it's not 'all'
      if (hasStatus && sch.registration_status.toLowerCase() !== filters.registrationStatus.toLowerCase()) {
        return false;
      }

      if (hasFrom || hasTo) {
        const start = toMs(sch.start_date);
        const end = toMs(sch.end_date);
        const from = hasFrom ? toMs(filters.startDateFrom) : -Infinity;
        const to = hasTo ? toMs(filters.startDateTo) : Infinity;
        if (isNaN(start) || isNaN(end)) return false;
        if (start > to || end < from) return false;
      }

      if (hasDeadline) {
        if (!sch.application_deadline) return true;
        const deadline = toMs(sch.application_deadline);
        const limit = toMs(filters.deadlineBefore);
        if (isNaN(deadline) || isNaN(limit)) return false;
        if (deadline > limit) return false;
      }

      return true;
    });

    return result.sort((a, b) => {
      const aMs = toMs(a.start_date);
      const bMs = toMs(b.start_date);
      if (isNaN(aMs)) return 1;
      if (isNaN(bMs)) return -1;
      return filters.sortOrder === 'asc' ? aMs - bMs : bMs - aMs;
    });
  }, [initialSchools, filters]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  if (initialSchools.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No schools data available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Filter filters={filters} onChange={setFilters} />

      <Box
        sx={{
          mt: 3,
          mb: 2,
          p: 2,
          backgroundColor: '#1a1a1a',
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Typography variant="body1" fontWeight={500}>
          Showing <strong style={{ color: '#1e88e5' }}>{filtered.length}</strong> of{' '}
          <strong>{initialSchools.length}</strong> schools
        </Typography>
        {filters.name && (
          <Chip
            label={`Filtered by: "${filters.name}"`}
            onDelete={() => setFilters({ ...filters, name: '' })}
            color="primary"
            variant="outlined"
            size="small"
          />
        )}
      </Box>

      {filtered.length === 0 ? (
        <Box
          sx={{
            p: 6,
            textAlign: 'center',
            backgroundColor: '#1a1a1a',
            borderRadius: 2,
            border: '1px solid #2a2a2a'
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No schools found matching your criteria
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters to see more results
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((sch, i) => (
            <Grid key={i}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#fff',
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(30, 136, 229, 0.15)',
                    borderColor: '#1e88e5',
                  }
                }}
              >
                <CardHeader
                  title={
                    <Link
                      href={sch.link}
                      target="_blank"
                      rel="noopener"
                      sx={{
                        color: '#000',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        textDecoration: 'none',
                        '&:hover': {
                          color: '#1e88e5',
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {sch.name}
                    </Link>
                  }
                  action={
                    <Chip
                      label={sch.registration_status}
                      color={getStatusColor(sch.registration_status)}
                      size="small"
                      icon={
                        sch.registration_status.toLowerCase() === 'open'
                          ? <EventAvailable />
                          : <EventBusy />
                      }
                    />
                  }
                  sx={{
                    pb: 1,
                    '& .MuiCardHeader-action': {
                      marginTop: 0
                    }
                  }}
                />
                <CardContent sx={{ flexGrow: 1, pt: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <LocationOn sx={{ fontSize: 18, color: '#666' }} />
                      <Typography variant="body2" color="#000" fontWeight={500}>
                        {sch.venue || 'Venue TBD'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <CalendarToday sx={{ fontSize: 18, color: '#666' }} />
                      <Typography variant="body2" color="#555">
                        {formatDate(sch.start_date)} – {formatDate(sch.end_date)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventAvailable sx={{ fontSize: 18, color: '#666' }} />
                      <Typography variant="body2" color="#555">
                        <strong>Deadline:</strong> {formatDate(sch.application_deadline)}
                      </Typography>
                    </Box>
                  </Box>

                  {sch.description && (
                    <Accordion
                      sx={{
                        mt: 2,
                        backgroundColor: '#f5f5f5',
                        '&:before': { display: 'none' },
                        boxShadow: 'none',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px !important'
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: '#666' }} />}
                        sx={{
                          minHeight: 40,
                          '& .MuiAccordionSummary-content': {
                            margin: '8px 0',
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Description sx={{ fontSize: 18, color: '#666' }} />
                          <Typography variant="body2" fontWeight={600} color="#000">
                            Description
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 2 }}>
                        <Typography variant="body2" color="#333" sx={{ lineHeight: 1.6 }}>
                          {sch.description}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}