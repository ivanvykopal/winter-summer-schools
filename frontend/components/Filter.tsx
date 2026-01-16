import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { Search, CalendarMonth, Sort } from '@mui/icons-material';
import InputAdornment from '@mui/material/InputAdornment';

export type Filters = {
  name: string;
  registrationStatus: string;
  startDateFrom: string;
  startDateTo: string;
  deadlineBefore: string;
  sortOrder: 'asc' | 'desc';
};

type Props = {
  filters: Filters;
  onChange: (newFilters: Filters) => void;
};

export default function Filter({
  filters,
  onChange,
}: Props) {
  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: '#fff'
      }}
    >
      <Grid container spacing={3}>
        <Grid>
          <TextField
            fullWidth
            label="School Name"
            placeholder='e.g. "Quantum"'
            value={filters.name}
            onChange={(e) => update('name', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#666' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#1976d2',
                },
              },
            }}
          />
        </Grid>

        <Grid>
          <FormControl fullWidth>
            <InputLabel id="status-label" shrink>Registration Status</InputLabel>
            <Select
              labelId="status-label"
              label="Registration Status"
              value={filters.registrationStatus}
              onChange={(e) => update('registrationStatus', e.target.value)}
              displayEmpty
              notched
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                },
                '& .MuiSelect-select': {
                  minWidth: '100%',
                },
                width: '200px',
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid >
          <FormControl fullWidth>
            <InputLabel id="sort-label">Sort by Start Date</InputLabel>
            <Select
              labelId="sort-label"
              label="Sort by Start Date"
              value={filters.sortOrder}
              onChange={(e) => update('sortOrder', e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <Sort sx={{ color: '#666', ml: 1 }} />
                </InputAdornment>
              }
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                },
              }}
            >
              <MenuItem value="asc">Earliest → Latest</MenuItem>
              <MenuItem value="desc">Latest → Earliest</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid>
          <Box
            sx={{
              p: 2,
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: '#555',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <CalendarMonth sx={{ fontSize: 20 }} />
              Date Filters
            </Typography>

            <Grid container spacing={2}>
              <Grid>
                <TextField
                  type="date"
                  label="Start Date From"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={filters.startDateFrom}
                  onChange={(e) => update('startDateFrom', e.target.value)}
                  sx={{
                    backgroundColor: '#fff',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid>
                <TextField
                  type="date"
                  label="Start Date To"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={filters.startDateTo}
                  onChange={(e) => update('startDateTo', e.target.value)}
                  sx={{
                    backgroundColor: '#fff',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid>
                <TextField
                  type="date"
                  label="Application Deadline (≤)"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={filters.deadlineBefore}
                  onChange={(e) => update('deadlineBefore', e.target.value)}
                  sx={{
                    backgroundColor: '#fff',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}