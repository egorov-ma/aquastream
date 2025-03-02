import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  FormControl, 
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ru } from 'date-fns/locale';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { TextField, Button, Typography } from '../ui';

const cities = [
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Сочи',
  'Екатеринбург',
  'Новосибирск',
  'Красноярск',
  'Иркутск',
  'Владивосток'
];

const EventsFilter = ({ onFilterChange }) => {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [city, setCity] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  const handleAvailableChange = (e) => {
    setOnlyAvailable(e.target.checked);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const applyFilters = () => {
    onFilterChange({
      search: searchQuery,
      startDate,
      endDate,
      city,
      onlyAvailable
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStartDate(null);
    setEndDate(null);
    setCity('');
    setOnlyAvailable(false);
    onFilterChange({
      search: '',
      startDate: null,
      endDate: null,
      city: '',
      onlyAvailable: false
    });
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Поиск мероприятий по названию или описанию"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={clearSearch} size="small">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<FilterListIcon />}
          onClick={toggleFilters}
        >
          {filtersVisible ? 'Скрыть фильтры' : 'Показать фильтры'}
        </Button>
      </Box>

      {filtersVisible && (
        <Box 
          sx={{ 
            p: 3, 
            borderRadius: 2, 
            bgcolor: 'background.paper',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            mb: 3
          }}
        >
          <Typography variant="h6" gutterBottom>Фильтры</Typography>
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Дата начала"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Дата окончания"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Город"
                  value={city}
                  onChange={handleCityChange}
                  fullWidth
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value=""></option>
                  {cities.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={onlyAvailable}
                        onChange={handleAvailableChange}
                        color="primary"
                      />
                    }
                    label="Только мероприятия с открытой регистрацией"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button variant="outlined" onClick={resetFilters}>
                    Сбросить
                  </Button>
                  <Button variant="contained" onClick={applyFilters}>
                    Применить
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Box>
      )}
    </Box>
  );
};

export default EventsFilter; 